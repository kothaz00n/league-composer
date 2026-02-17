/**
 * preload.js — Secure IPC Bridge
 *
 * Exposes a safe API to the renderer process via contextBridge.
 * This prevents the renderer from accessing Node.js APIs directly.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ─── LCU Status ─────────────────────────────────────────────
    onConnectionStatus: (callback) => {
        ipcRenderer.on('lcu:status', (_event, data) => callback(data));
    },

    // ─── Champ Select Events ───────────────────────────────────
    onChampSelectUpdate: (callback) => {
        ipcRenderer.on('champSelect:update', (_event, data) => callback(data));
    },

    onChampSelectEnded: (callback) => {
        ipcRenderer.on('champSelect:ended', (_event, data) => callback(data));
    },

    // ─── Window Controls (frameless) ───────────────────────────
    minimizeWindow: () => ipcRenderer.send('window:minimize'),
    closeWindow: () => ipcRenderer.send('window:close'),

    // ─── Actions ───────────────────────────────────────────────
    // ─── Actions ───────────────────────────────────────────────
    retryConnection: () => ipcRenderer.send('lcu:retry'),

    // Send updated preferences (role override, target archetype) to main process
    updateDraftPreferences: (prefs) => ipcRenderer.send('draft:updatePreferences', prefs),

    // Save imported win rates
    saveWinRates: (data) => ipcRenderer.send('winrate:save', data),

    // Roster
    loadRoster: () => ipcRenderer.invoke('roster:load'),
    saveRoster: (data) => ipcRenderer.send('roster:save', data),
    onRosterSaveSuccess: (callback) => ipcRenderer.on('roster:save-success', () => callback()),

    // Champions
    getChampionData: () => ipcRenderer.invoke('champion:get-data'),
    getChampionStats: (name, role, queue) => ipcRenderer.invoke('champion:get-stats', name, role, queue),
    getImportedChampions: (queue, role) => ipcRenderer.invoke('champion:get-imported-list', queue, role),
    getAvailableQueues: () => ipcRenderer.invoke('champion:get-available-queues'),

    // ─── Scraper ──────────────────────────────────────────────
    runUggScrape: (force = false, queueType = 'soloq') => ipcRenderer.send('scraper:run-ugg', force, queueType),
    onScraperProgress: (callback) => ipcRenderer.on('scraper:progress', (_event, msg) => callback(msg)),
    onScraperComplete: (callback) => ipcRenderer.on('scraper:complete', (_event, result) => callback(result)),
});
