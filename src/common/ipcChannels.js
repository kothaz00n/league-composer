const IPC_CHANNELS = {
    // Window controls
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_CLOSE: 'window:close',

    // LCU connection
    LCU_CONNECT: 'lcu:connect',
    LCU_RETRY: 'lcu:retry',
    LCU_STATUS: 'lcu:status',

    // Draft preferences
    DRAFT_UPDATE_PREFERENCES: 'draft:updatePreferences',

    // Win rates
    WINRATE_SAVE: 'winrate:save',
    WINRATE_SAVE_SUCCESS: 'winrate:save-success',
    WINRATE_SAVE_ERROR: 'winrate:save-error',

    // Roster
    ROSTER_LOAD: 'roster:load',
    ROSTER_SAVE: 'roster:save',
    ROSTER_SAVE_SUCCESS: 'roster:save-success',
    ROSTER_SAVE_ERROR: 'roster:save-error',

    // Compositions
    COMPOSITION_SAVE_ARCHETYPE: 'composition:save-archetype',
    COMPOSITION_SAVE_SUCCESS: 'composition:save-success',
    COMPOSITION_SAVE_ERROR: 'composition:save-error',
    COMPOSITION_GET_ALL: 'composition:get-all',
    COMPOSITION_SAVE_COMP: 'composition:save-comp',
    COMPOSITION_SAVE_COMP_SUCCESS: 'composition:save-comp-success',
    COMPOSITION_SAVE_COMP_ERROR: 'composition:save-comp-error',
    COMPOSITION_ANALYZE: 'composition:analyze',

    // Champions
    CHAMPION_GET_OP_PICKS: 'champion:get-op-picks',
    CHAMPION_GET_DATA: 'champion:get-data',
    CHAMPION_GET_STATS: 'champion:get-stats',
    CHAMPION_GET_IMPORTED_LIST: 'champion:get-imported-list',
    CHAMPION_GET_AVAILABLE_QUEUES: 'champion:get-available-queues',

    // Scraper
    SCRAPER_RUN_UGG: 'scraper:run-ugg',
    SCRAPER_PROGRESS: 'scraper:progress',
    SCRAPER_COMPLETE: 'scraper:complete',

    // Champ Select
    CHAMP_SELECT_UPDATE: 'champSelect:update',
    CHAMP_SELECT_ENDED: 'champSelect:ended',
};

module.exports = { IPC_CHANNELS };
