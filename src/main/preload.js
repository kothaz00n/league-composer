/**
 * preload.js — Secure IPC Bridge
 *
 * Exposes a safe API to the renderer process via contextBridge.
 * This prevents the renderer from accessing Node.js APIs directly.
 */

const { contextBridge, ipcRenderer } = require('electron');
const { IPC_CHANNELS } = require('../common/ipcChannels');

contextBridge.exposeInMainWorld('electronAPI', {
    // ─── LCU Status ─────────────────────────────────────────────
    onConnectionStatus: (callback) => {
        ipcRenderer.on(IPC_CHANNELS.LCU_STATUS, (_event, data) => callback(data));
    },

    // ─── Champ Select Events ───────────────────────────────────
    onChampSelectUpdate: (callback) => {
        ipcRenderer.on(IPC_CHANNELS.CHAMP_SELECT_UPDATE, (_event, data) => callback(data));
    },

    onChampSelectEnded: (callback) => {
        ipcRenderer.on(IPC_CHANNELS.CHAMP_SELECT_ENDED, (_event, data) => callback(data));
    },

    // ─── Window Controls (frameless) ───────────────────────────
    minimizeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    closeWindow: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),

    // ─── Actions ───────────────────────────────────────────────
    // ─── Actions ───────────────────────────────────────────────
    retryConnection: () => ipcRenderer.send(IPC_CHANNELS.LCU_RETRY),

    // Send updated preferences (role override, target archetype) to main process
    updateDraftPreferences: (prefs) => ipcRenderer.send(IPC_CHANNELS.DRAFT_UPDATE_PREFERENCES, prefs),

    // Save imported win rates
    saveWinRates: (data) => ipcRenderer.send(IPC_CHANNELS.WINRATE_SAVE, data),

    // Roster
    loadRoster: () => ipcRenderer.invoke(IPC_CHANNELS.ROSTER_LOAD),
    saveRoster: (data) => ipcRenderer.send(IPC_CHANNELS.ROSTER_SAVE, data),
    onRosterSaveSuccess: (callback) => ipcRenderer.on(IPC_CHANNELS.ROSTER_SAVE_SUCCESS, () => callback()),

    // Champions
    getChampionData: () => ipcRenderer.invoke(IPC_CHANNELS.CHAMPION_GET_DATA),
    saveWinRates: (data) => ipcRenderer.send(IPC_CHANNELS.WINRATE_SAVE, data),
    getChampionStats: (name, role, queue) => ipcRenderer.invoke(IPC_CHANNELS.CHAMPION_GET_STATS, name, role, queue),
    saveArchetype: (data) => ipcRenderer.send(IPC_CHANNELS.COMPOSITION_SAVE_ARCHETYPE, data),
    onSaveArchetypeSuccess: (callback) => ipcRenderer.on(IPC_CHANNELS.COMPOSITION_SAVE_SUCCESS, (_, data) => callback(data)),

    getAllCompositions: () => ipcRenderer.invoke(IPC_CHANNELS.COMPOSITION_GET_ALL),
    saveComposition: (data) => ipcRenderer.send(IPC_CHANNELS.COMPOSITION_SAVE_COMP, data),
    onSaveCompositionSuccess: (callback) => ipcRenderer.on(IPC_CHANNELS.COMPOSITION_SAVE_COMP_SUCCESS, (_, data) => callback(data)),
    analyzeComposition: (team, queue) => ipcRenderer.invoke(IPC_CHANNELS.COMPOSITION_ANALYZE, team, queue),
    getOpPicks: (queue) => ipcRenderer.invoke(IPC_CHANNELS.CHAMPION_GET_OP_PICKS, queue),
    getImportedChampions: (queue, role) => ipcRenderer.invoke(IPC_CHANNELS.CHAMPION_GET_IMPORTED_LIST, queue, role),
    getAvailableQueues: () => ipcRenderer.invoke(IPC_CHANNELS.CHAMPION_GET_AVAILABLE_QUEUES),

    // ─── Scraper ──────────────────────────────────────────────
    runUggScrape: (force = false, queueType = 'soloq') => ipcRenderer.send(IPC_CHANNELS.SCRAPER_RUN_UGG, force, queueType),
    onScraperProgress: (callback) => ipcRenderer.on(IPC_CHANNELS.SCRAPER_PROGRESS, (_event, msg) => callback(msg)),
    onScraperComplete: (callback) => ipcRenderer.on(IPC_CHANNELS.SCRAPER_COMPLETE, (_event, result) => callback(result)),

    // ─── Synergy Orchestrator ─────────────────────────────────────────────
    analyzeTeamSynergy: (data) => ipcRenderer.invoke(IPC_CHANNELS.SYNERGY_ANALYZE, data),

    // ─── Draft Preview (Sandbox Mode) ─────────────────────────────────────────
    getDraftPreview: (scenario, role) => ipcRenderer.invoke(IPC_CHANNELS.DRAFT_PREVIEW, { scenario, role }),
});
