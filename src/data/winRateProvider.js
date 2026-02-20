/**
 * winRateProvider.js — Champion Win Rate Data
 *
 * Supports two queues: "soloq" and "flex".
 * Each queue has per-role data: { soloq: { top: { Aatrox: {...} }, ... }, flex: { ... } }
 * Falls back to static data when no imported data exists.
 */

// ─── Data Store ─────────────────────────────────────────────────────────
// New format: { soloq: { top: {...}, ... }, flex: { top: {...}, ... } }
// Legacy format: { top: {...}, ... } (auto-migrated to soloq)
let queueData = {}; // { soloq: { role: { champ: stats } }, flex: { role: { champ: stats } } }
let dataSource = 'static'; // 'static' | 'imported'

const VALID_ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];
const VALID_QUEUES = ['soloq', 'flex'];

/**
 * Load win rates. Supports new format { soloq: {...}, flex: {...} }
 * and legacy format { top: {...}, ... } (migrated to soloq).
 */
function loadWinRates(externalData = null) {
    if (externalData && Object.keys(externalData).length > 0) {
        // Detect format
        const keys = Object.keys(externalData);
        const hasQueues = keys.some(k => VALID_QUEUES.includes(k));
        const hasLegacyRoles = keys.some(k => VALID_ROLES.includes(k.toLowerCase()));

        if (hasQueues) {
            // New format: { soloq: { top: {...} }, flex: { top: {...} } }
            queueData = externalData;
            dataSource = 'imported';
            const queues = Object.keys(queueData).filter(q => VALID_QUEUES.includes(q));
            const totalChamps = queues.reduce((sum, q) => {
                return sum + Object.values(queueData[q] || {}).reduce((s, roleData) => s + Object.keys(roleData || {}).length, 0);
            }, 0);
            console.log(`[WinRate] Loaded queue-based win rates for ${queues.join(', ')} (${totalChamps} total entries)`);
        } else if (hasLegacyRoles) {
            // Legacy format: { top: {...}, ... } → migrate to soloq
            queueData = { soloq: {} };
            for (const [role, roleData] of Object.entries(externalData)) {
                if (typeof roleData === 'object' && roleData !== null) {
                    queueData.soloq[role.toLowerCase()] = roleData;
                }
            }
            dataSource = 'imported';
            const count = Object.values(queueData.soloq).reduce((s, rd) => s + Object.keys(rd).length, 0);
            console.log(`[WinRate] Migrated legacy role-based data to soloq (${count} entries)`);
        } else {
            // Unknown format
            console.warn('[WinRate] Unknown data format provided. Ignoring.');
            queueData = {};
            dataSource = 'static';
        }
    } else {
        queueData = {};
        dataSource = 'static';
        console.log('[WinRate] No win rate data loaded (source: static)');
    }
}

/**
 * Get the win rate for a champion.
 * @param {string} championName
 * @param {string} [role]
 * @param {string} [queue] - 'soloq' or 'flex' (default: 'soloq')
 * @returns {number}
 */
function getWinRate(championName, role = null, queue = 'soloq') {
    queue = queue || 'soloq';
    if (dataSource === 'imported' && role) {
        const qData = queueData[queue];
        if (qData) {
            const roleKey = Object.keys(qData).find(k => k.toLowerCase() === role.toLowerCase());
            const roleData = roleKey ? qData[roleKey] : null;
            if (roleData && roleData[championName]) {
                const entry = roleData[championName];
                return typeof entry === 'object' ? (entry.winRate || 0.50) : entry;
            }
        }
        return 0; // No data found
    }
    return 0; // No data found
}

/**
 * Get full stats for a champion.
 * @param {string} championName
 * @param {string} [role]
 * @param {string} [queue] - 'soloq' or 'flex'
 * @returns {Object} { winRate, pickRate, banRate, tier, matches, hasData }
 */
function getChampionStats(championName, role = null, queue = 'soloq') {
    queue = queue || 'soloq';
    let entry = null;
    let hasData = false;

    if (dataSource === 'imported') {
        if (role) {
            const qData = queueData[queue];
            if (qData) {
                const roleKey = Object.keys(qData).find(k => k.toLowerCase() === role.toLowerCase());
                const roleData = roleKey ? qData[roleKey] : null;
                if (roleData && roleData[championName]) {
                    entry = roleData[championName];
                    hasData = true;
                }
            }
        } else {
            // ALL: aggregate across roles for this queue
            const qData = queueData[queue];
            if (qData) {
                // If we have explicit "all" role data from scraper, use it
                if (qData.all && qData.all[championName]) {
                    entry = qData.all[championName];
                    hasData = true;
                } else {
                    // Fallback: finding the role with the most matches
                    let bestEntry = null;
                    let bestMatches = -1;
                    for (const roleKey of Object.keys(qData)) {
                        if (roleKey === 'all') continue; // Skip 'all' in fallback loop to avoid double dipping if it exists but missing this champ
                        const roleData = qData[roleKey];
                        if (roleData && roleData[championName]) {
                            const candidate = roleData[championName];
                            const matches = typeof candidate === 'object' ? (candidate.matches || 0) : 0;
                            if (matches > bestMatches) {
                                bestMatches = matches;
                                bestEntry = candidate;
                            }
                        }
                    }
                    if (bestEntry) {
                        entry = bestEntry;
                        hasData = true;
                    }
                }
            }
        }
    }

    if (!entry) return { winRate: 0.50, pickRate: 0, banRate: 0, tier: '', matches: 0, hasData };

    if (typeof entry === 'number') {
        return { winRate: entry, pickRate: 0, banRate: 0, tier: '', matches: 0, hasData };
    }

    return {
        winRate: entry.winRate || 0.50,
        pickRate: entry.pickRate || 0,
        banRate: entry.banRate || 0,
        tier: entry.tier || '',
        matches: entry.matches || 0,
        hasData,
        counters: entry.counters || {},
    };
}

/**
 * Get list of champion names that have imported data for a queue/role.
 * @param {string} [queue] - 'soloq' or 'flex'
 * @param {string} [role] - specific role or null for all
 * @returns {string[]}
 */
function getImportedChampions(queue = 'soloq', role = null) {
    if (dataSource !== 'imported') return [];
    const qData = queueData[queue];
    if (!qData) return [];

    if (role) {
        const roleKey = Object.keys(qData).find(k => k.toLowerCase() === role.toLowerCase());
        return roleKey ? Object.keys(qData[roleKey] || {}) : [];
    }

    // All roles: union
    const names = new Set();
    for (const roleData of Object.values(qData)) {
        for (const name of Object.keys(roleData || {})) {
            names.add(name);
        }
    }
    return [...names];
}

/**
 * Get all win rate data.
 */
function getAllWinRates() {
    return { queueData: { ...queueData }, dataSource };
}

/**
 * Check which queues have data.
 */
function getAvailableQueues() {
    if (dataSource !== 'imported') return [];
    return Object.keys(queueData).filter(q => VALID_QUEUES.includes(q));
}

function getDataSource() {
    return dataSource;
}

module.exports = {
    loadWinRates,
    getWinRate,
    getAllWinRates,
    getDataSource,
    getChampionStats,
    getImportedChampions,
    getAvailableQueues,
};
