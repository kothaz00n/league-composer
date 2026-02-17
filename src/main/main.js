/**
 * main.js — Electron Main Process
 *
 * Manages the application lifecycle:
 *  1. Creates the BrowserWindow
 *  2. Polls for the League Client lockfile
 *  3. Connects via WebSocket when lockfile is found
 *  4. Forwards champ-select events to renderer via IPC
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs'); // Added fs import
const { readLockfile } = require('./lcu/lockfileReader');
const { createLcuClient, getCurrentSummoner, getChampSelectSession } = require('./lcu/lcuClient');
const { LcuWebSocket } = require('./lcu/lcuWebSocket');
const { getRecommendations, initializeEngine } = require('../engine/recommend');
const { loadChampionData, getIdToNameMap, getNameToIdMap, getChampionTags,
    getLatestVersion,
    getAllChampions,
} = require('../data/champions');
const { loadWinRates, getChampionStats, getAllWinRates, getImportedChampions, getAvailableQueues } = require('../data/winRateProvider');
const { scrapeUGGChampions } = require('./scrapers/ugg');

// ─── State ──────────────────────────────────────────────────────────────
let mainWindow = null;

// ─── Engine State ───────────────────────────────────────────────────────
let isConnected = false;
let lcuClient = null;
let lcuWebSocket = null;
let pollingInterval = null;
let draftPreferences = { targetArchetype: 'auto', overrideRole: null };
let rosterConfig = null; // Store roster data in memory

// ─── Constants ──────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 5000;
const IS_DEV = !app.isPackaged;
const WINRATES_PATH = path.join(__dirname, '../data/winrates.json');
const ROSTER_PATH = path.join(__dirname, '../data/roster.json'); // Added WINRATES_PATH

// ─── Window Creation ────────────────────────────────────────────────────
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1100,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'LoL Draft Recommender',
        frame: false,
        transparent: false,
        backgroundColor: '#0a0e1a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (IS_DEV) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ─── Helper Functions ───────────────────────────────────────────────────
/**
 * Reloads win rates from the local file or uses a fallback.
 * @param {object} [initialData={}] - Optional initial data to merge or use if file not found.
 */
function reloadWinRates(initialData = {}) {
    let winRateData = { ...initialData };
    if (fs.existsSync(WINRATES_PATH)) {
        try {
            const raw = fs.readFileSync(WINRATES_PATH, 'utf8');
            const fileData = JSON.parse(raw);
            winRateData = { ...winRateData, ...fileData }; // Merge file data
            console.log(`[Main] Loaded ${Object.keys(fileData).length} win rates from local file`);
        } catch (e) {
            console.error('[Main] Error reading local winrates.json:', e);
        }
    }
    loadWinRates(winRateData); // Pass the combined data to the provider
}

// ─── IPC Handlers ───────────────────────────────────────────────────────
function setupIPC() {
    // Window controls (frameless window)
    ipcMain.on('window:minimize', () => mainWindow?.minimize());
    ipcMain.on('window:close', () => mainWindow?.close());

    // Manual connection retry
    ipcMain.on('lcu:connect', () => {
        if (!isConnected) {
            startPolling();
        }
    });

    ipcMain.on('draft:updatePreferences', (event, prefs) => {
        console.log('[Main] Updated draft preferences:', prefs);
        draftPreferences = { ...draftPreferences, ...prefs };
        // If we have an active session, re-run analysis immediately
        if (currentSession) {
            handleChampSelectUpdate(currentSession);
        }
    });

    ipcMain.on('winrate:save', (event, data) => {
        try {
            // Read existing file to merge
            let existing = {};
            if (fs.existsSync(WINRATES_PATH)) {
                try {
                    existing = JSON.parse(fs.readFileSync(WINRATES_PATH, 'utf8'));
                } catch (e) { /* ignore parse errors */ }
            }

            // If data has a queue key (soloq/flex), merge into existing
            const queue = data._queue; // e.g. 'soloq' or 'flex'
            const roleData = data._roleData; // { top: {...}, jungle: {...}, ... }

            if (queue && roleData) {
                // Ensure existing is in new format
                if (!existing.soloq && !existing.flex) {
                    // Migrate legacy: existing might be { top: {...}, ... }
                    const firstKey = Object.keys(existing)[0];
                    if (firstKey && ['top', 'jungle', 'mid', 'adc', 'support', 'all'].includes(firstKey.toLowerCase())) {
                        existing = { soloq: existing };
                    }
                }
                // MERGE logic: update only the roles provided in roleData
                existing[queue] = { ...(existing[queue] || {}), ...roleData };
            } else {
                // Legacy format: treat as soloq
                existing = { soloq: data };
            }

            console.log(`[Main] Saving win rates to ${WINRATES_PATH}`);
            fs.writeFileSync(WINRATES_PATH, JSON.stringify(existing, null, 2));
            reloadWinRates(existing);

            if (currentSession) handleChampSelectUpdate(currentSession);
            event.reply('winrate:save-success', { count: Object.keys(data).length });
        } catch (err) {
            console.error('[Main] Failed to save winrates:', err);
            event.reply('winrate:save-error', { message: err.message });
        }
    });

    // ─── Roster IPC ─────────────────────────────────────────────────────────

    ipcMain.handle('roster:load', async () => {
        try {
            if (fs.existsSync(ROSTER_PATH)) {
                const data = fs.readFileSync(ROSTER_PATH, 'utf8');
                rosterConfig = JSON.parse(data); // Cache
                return rosterConfig;
            }
            return null;
        } catch (err) {
            console.error('[Main] Failed to load roster:', err);
            return null;
        }
    });


    ipcMain.on('roster:save', (event, data) => {
        try {
            console.log(`[Main] Saving roster config to ${ROSTER_PATH}`);
            fs.writeFileSync(ROSTER_PATH, JSON.stringify(data, null, 2));
            rosterConfig = data; // Update cache
            // Trigger update if session active
            if (currentSession) handleChampSelectUpdate(currentSession);
            event.reply('roster:save-success');
        } catch (err) {
            console.error('[Main] Failed to save roster:', err);
            event.reply('roster:save-error', { message: err.message });
        }
    });

    // ─── Scraper ────────────────────────────────────────────────────────
    ipcMain.on('scraper:run-ugg', async (event, force = false, queueType = 'soloq') => {
        console.log(`[Main] Request to run U.GG scrape (${queueType})...`);
        try {
            // Check last updated time
            let existing = {};
            if (fs.existsSync(WINRATES_PATH)) {
                try {
                    existing = JSON.parse(fs.readFileSync(WINRATES_PATH, 'utf8'));
                } catch (e) { /* ignore */ }
            }

            // Check specific queue timestamp if it exists, otherwise check root
            // We'll store metadata per queue now
            const queueData = existing[queueType] || {};

            if (!force && existing.lastUpdated && existing.lastUpdatedQueue === queueType) {
                const now = Date.now();
                const diff = now - existing.lastUpdated;
                const hours = diff / (1000 * 60 * 60);

                if (hours < 24) {
                    const remaining = Math.ceil(24 - hours);
                    console.log(`[Main] Scrape skipped: Data is fresh (${hours.toFixed(1)}h old).`);
                    event.reply('scraper:complete', {
                        success: false,
                        message: `Data for ${queueType} is recent (updated ${hours.toFixed(1)}h ago). Wait ${remaining}h or use Force Update.`
                    });
                    return;
                }
            }

            console.log(`[Main] Starting U.GG scrape for ${queueType}...`);

            const onProgress = (msg) => event.reply('scraper:progress', msg);
            const rawData = await scrapeUGGChampions(onProgress, queueType);

            if (!rawData || !rawData[queueType]) {
                throw new Error('Scraper returned invalid data structure');
            }

            // Merge with existing data
            const merged = {
                ...existing,
                [queueType]: rawData[queueType], // overwrite specific queue
                lastUpdated: Date.now(),
                lastUpdatedQueue: queueType // track which one was last updated for simple global cooldown
            };

            fs.writeFileSync(WINRATES_PATH, JSON.stringify(merged, null, 2));
            console.log('[Main] Scrape complete and saved.');

            // Reload in memory
            winRateProvider.loadWinRates();

            // Create summary stats
            const totalChamps = Object.values(rawData[queueType]).reduce((acc, roleObj) => acc + Object.keys(roleObj).length, 0);

            event.reply('scraper:complete', {
                success: true,
                message: `Scrape complete! Updated ${totalChamps} champion entries for ${queueType}.`,
                count: totalChamps
            });

            // Trigger engine update
            if (currentSession) handleChampSelectUpdate(currentSession);

        } catch (error) {
            console.error('[Main] Scraper failed:', error);
            event.reply('scraper:complete', {
                success: false,
                message: `Scraping failed: ${error.message}`
            });
        }
    });
}

// ─── Send to Renderer ───────────────────────────────────────────────────
// ─── Send to Renderer ───────────────────────────────────────────────────
function sendToRenderer(channel, data) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, data);
    }
}

// ─── Champion Data IPC ──────────────────────────────────────────────────

ipcMain.handle('champion:get-data', () => {
    const idToName = getIdToNameMap();
    if (!idToName) return null;

    const nameToId = getNameToIdMap();
    const tagsMap = {};

    // Populate tags map for renderer usage (e.g. TeamBuilder)
    Object.values(idToName).forEach(name => {
        tagsMap[name] = getChampionTags(name);
    });

    return { idToName, nameToId, tagsMap, version: getLatestVersion() };
});

ipcMain.handle('champion:get-stats', (_, name, role, queue) => {
    return getChampionStats(name, role, queue);
});

ipcMain.handle('champion:get-imported-list', (_, queue, role) => {
    return getImportedChampions(queue, role);
});

ipcMain.handle('champion:get-available-queues', () => {
    return getAvailableQueues();
});

// ─── LCU Connection ────────────────────────────────────────────────────
async function tryConnect() {
    try {
        const credentials = await readLockfile();
        if (!credentials) {
            sendToRenderer('lcu:status', { status: 'disconnected', message: 'League Client not detected' });
            return;
        }

        // Create HTTP client
        lcuClient = createLcuClient(credentials);

        // Test the connection by fetching summoner info
        try {
            const summoner = await getCurrentSummoner(lcuClient);
            console.log(`[Main] Connected as: ${summoner.displayName}`);
            sendToRenderer('lcu:status', {
                status: 'connected',
                message: `Connected as ${summoner.displayName}`,
                summoner,
            });
        } catch (err) {
            sendToRenderer('lcu:status', { status: 'connected', message: 'Connected to League Client' });
        }

        isConnected = true;

        // Stop polling, start WebSocket
        stopPolling();
        connectWebSocket(credentials);

        // Check if already in champ select
        try {
            const session = await getChampSelectSession(lcuClient);
            if (session) {
                handleChampSelectUpdate(session);
            }
        } catch {
            // Not in champ select, that's fine
        }

    } catch (err) {
        console.error('[Main] Connection attempt failed:', err.message);
        sendToRenderer('lcu:status', { status: 'disconnected', message: 'Connection failed' });
    }
}

function connectWebSocket(credentials) {
    lcuWebSocket = new LcuWebSocket();

    lcuWebSocket.on('connected', () => {
        console.log('[Main] WebSocket connected — listening for Champ Select');
        sendToRenderer('lcu:status', { status: 'waiting', message: 'Waiting for Champ Select...' });
    });

    lcuWebSocket.on('champSelectStarted', (data) => {
        console.log('[Main] Champ Select STARTED');
        sendToRenderer('lcu:status', { status: 'inChampSelect', message: 'In Champ Select!' });
        handleChampSelectUpdate(data);
    });

    lcuWebSocket.on('champSelectUpdated', (data) => {
        handleChampSelectUpdate(data);
    });

    lcuWebSocket.on('champSelectEnded', () => {
        console.log('[Main] Champ Select ENDED');
        sendToRenderer('lcu:status', { status: 'waiting', message: 'Waiting for Champ Select...' });
        sendToRenderer('champSelect:ended', {});
    });

    lcuWebSocket.on('disconnected', () => {
        console.log('[Main] WebSocket disconnected — resuming polling');
        isConnected = false;
        lcuClient = null;
        sendToRenderer('lcu:status', { status: 'disconnected', message: 'League Client disconnected' });
        startPolling();
    });

    lcuWebSocket.on('error', () => {
        // Will trigger 'disconnected' after
    });

    lcuWebSocket.connect(credentials);
}

/**
 * Process a champ-select session update and send recommendations.
 */
function handleChampSelectUpdate(session) {
    try {
        currentSession = session; // Update current session state

        // Parse the session data
        const { myTeam, theirTeam, bans, localPlayerCellId, timer } = session;

        // Find the local player
        const localPlayer = myTeam?.find(p => p.cellId === localPlayerCellId);
        const assignedRole = localPlayer?.assignedPosition || 'unknown';

        // Extract picks and bans
        const allyPicks = (myTeam || [])
            .filter(p => p.championId > 0)
            .map(p => p.championId);

        const enemyPicks = (theirTeam || [])
            .filter(p => p.championId > 0)
            .map(p => p.championId);

        const allBans = [];
        if (bans?.myTeamBans) allBans.push(...bans.myTeamBans.filter(id => id > 0));
        if (bans?.theirTeamBans) allBans.push(...bans.theirTeamBans.filter(id => id > 0));
        // Also check the numBans / bans array format
        if (Array.isArray(bans)) {
            bans.forEach(b => {
                if (b.championId > 0) allBans.push(b.championId);
            });
        }

        // LCU v1: bans are also in session.actions as type "ban"
        if (session.actions && Array.isArray(session.actions)) {
            for (const actionGroup of session.actions) {
                const actions = Array.isArray(actionGroup) ? actionGroup : [actionGroup];
                for (const action of actions) {
                    if (action.type === 'ban' && action.championId > 0 && action.completed) {
                        if (!allBans.includes(action.championId)) {
                            allBans.push(action.championId);
                        }
                    }
                }
            }
        }

        if (allBans.length > 0) {
            console.log(`[Main] Bans detected: ${allBans.map(id => getChampionName(id) || id).join(', ')}`);
        }

        // Get recommendations + composition analysis
        const { recommendations, compositionAnalysis } = getRecommendations({
            role: draftPreferences.overrideRole || assignedRole,
            allyPicks,
            enemyPicks,
            bannedChampions: allBans,
            targetArchetype: draftPreferences.targetArchetype,
            rosterConfig, // Pass roster data to engine
            allies: (myTeam || []), // Need allies data for linking summoner names
            localPlayerCellId,
        });

        // Send full state update to renderer
        const draftState = {
            phase: timer?.phase || 'UNKNOWN',
            localPlayer: {
                cellId: localPlayerCellId,
                role: assignedRole,
                championId: localPlayer?.championId || 0,
            },
            allies: (myTeam || []).map(p => ({
                cellId: p.cellId,
                championId: p.championId,
                role: p.assignedPosition,
                summonerName: p.summonerName || '',
                isLocalPlayer: p.cellId === localPlayerCellId,
            })),
            enemies: (theirTeam || []).map(p => ({
                cellId: p.cellId,
                championId: p.championId,
                role: p.assignedPosition || '',
            })),
            bans: allBans,
            recommendations,
            compositionAnalysis,
            ddragonVersion: getLatestVersion(),
        };

        sendToRenderer('champSelect:update', draftState);

    } catch (err) {
        console.error('[Main] Error processing champ select update:', err);
    }
}

// ─── Polling ────────────────────────────────────────────────────────────
function startPolling() {
    if (pollingInterval) return;
    console.log('[Main] Polling for League Client every 5s...');
    pollingInterval = setInterval(tryConnect, POLL_INTERVAL_MS);
    // Also try immediately
    tryConnect();
}

function stopPolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// ─── App Lifecycle ──────────────────────────────────────────────────────
app.whenReady().then(async () => {
    createWindow();
    setupIPC();

    // Load data
    try {
        await loadChampionData();
        console.log(`[Champions] Loaded ${Object.keys(getIdToNameMap()).length} champions with tags (${getLatestVersion()})`);

        // Load win rates
        reloadWinRates();

        // Load roster
        if (fs.existsSync(ROSTER_PATH)) {
            const rData = fs.readFileSync(ROSTER_PATH, 'utf8');
            rosterConfig = JSON.parse(rData);
            console.log('[Main] Roster config loaded');
        }

        // Initialize the recommendation engine with Data Dragon data
        const idToName = getIdToNameMap();
        const nameToId = getNameToIdMap();
        const tagsMap = {};
        for (const champName of Object.values(idToName)) {
            tagsMap[champName] = getChampionTags(champName);
        }

        initializeEngine({ idToName, nameToId, tagsMap });
        console.log('[Main] Data Dragon + Win Rates loaded successfully');
    } catch (err) {
        console.error('[Main] Failed to load champion data:', err.message);
    }

    startPolling();
});

app.on('window-all-closed', () => {
    stopPolling();
    if (lcuWebSocket) lcuWebSocket.disconnect();
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
