/**
 * winRateProvider.js — Champion Win Rate Data
 *
 * Supports two queues: "soloq" and "flex".
 * Each queue has per-role data: { soloq: { top: { Aatrox: {...} }, ... }, flex: { ... } }
 * Falls back to static data when no imported data exists.
 */

// ─── Static Win Rate Data (Patch 14.3 approximations) ───────────────────
const STATIC_WIN_RATES = {
    'Aatrox': 0.502, 'Ahri': 0.518, 'Akali': 0.485, 'Akshan': 0.503,
    'Alistar': 0.497, 'Amumu': 0.523, 'Anivia': 0.528, 'Annie': 0.512,
    'Aphelios': 0.473, 'Ashe': 0.517, 'AurelionSol': 0.509,
    'Bard': 0.521, 'Belveth': 0.491, 'Blitzcrank': 0.521, 'Brand': 0.517, 'Braum': 0.492,
    'Briar': 0.503,
    'Caitlyn': 0.511, 'Camille': 0.498, 'Cassiopeia': 0.517, 'ChoGath': 0.521,
    'Corki': 0.489,
    'Darius': 0.508, 'Diana': 0.510, 'DrMundo': 0.517, 'Draven': 0.497,
    'Ekko': 0.506, 'Elise': 0.489, 'Evelynn': 0.503, 'Ezreal': 0.487,
    'Fiddlesticks': 0.522, 'Fiora': 0.501, 'Fizz': 0.505,
    'Galio': 0.514, 'Garen': 0.526, 'Gnar': 0.498, 'Gragas': 0.497,
    'Graves': 0.483, 'Gwen': 0.481,
    'Hecarim': 0.511, 'Heimerdinger': 0.515, 'Hwei': 0.478,
    'Illaoi': 0.517, 'Irelia': 0.484, 'Ivern': 0.531,
    'Janna': 0.533, 'Jarvan IV': 0.508, 'Jax': 0.510, 'Jayce': 0.479,
    'Jhin': 0.517, 'Jinx': 0.523,
    'KSante': 0.471, 'Kaisa': 0.497, 'Kalista': 0.476, 'Karma': 0.501,
    'Karthus': 0.503, 'Kassadin': 0.492, 'Katarina': 0.489, 'Kayle': 0.517,
    'Kayn': 0.511, 'Kennen': 0.493, 'Khazix': 0.510, 'Kindred': 0.497,
    'Kled': 0.503, 'KogMaw': 0.519,
    'LeBlanc': 0.478, 'Lee Sin': 0.487, 'Leona': 0.511, 'Lillia': 0.509,
    'Lissandra': 0.517, 'Lucian': 0.489, 'Lulu': 0.509, 'Lux': 0.521,
    'Malphite': 0.523, 'Malzahar': 0.527, 'Maokai': 0.521,
    'MasterYi': 0.508, 'Milio': 0.519, 'Miss Fortune': 0.523,
    'MonkeyKing': 0.512, 'Mordekaiser': 0.511, 'Morgana': 0.514,
    'Naafiri': 0.497, 'Nami': 0.522, 'Nasus': 0.517, 'Nautilus': 0.508,
    'Neeko': 0.517, 'Nidalee': 0.467, 'Nilah': 0.512, 'Nocturne': 0.517,
    'Nunu': 0.506,
    'Olaf': 0.498, 'Orianna': 0.487, 'Ornn': 0.521,
    'Pantheon': 0.502, 'Poppy': 0.514, 'Pyke': 0.497,
    'Qiyana': 0.479,
    'Rakan': 0.509, 'Rammus': 0.521, 'Rell': 0.508, 'Renata': 0.497,
    'Renekton': 0.489, 'Rengar': 0.497, 'Riven': 0.497, 'Rumble': 0.504, 'Ryze': 0.462,
    'Samira': 0.497, 'Sejuani': 0.517, 'Senna': 0.509, 'Seraphine': 0.521,
    'Sett': 0.511, 'Shaco': 0.509, 'Shen': 0.517, 'Shyvana': 0.512,
    'Singed': 0.523, 'Sion': 0.508, 'Sivir': 0.511, 'Skarner': 0.497,
    'Smolder': 0.478, 'Sona': 0.528, 'Soraka': 0.528, 'Swain': 0.521, 'Sylas': 0.497,
    'Syndra': 0.483,
    'TahmKench': 0.489, 'Taliyah': 0.501, 'Talon': 0.503, 'Taric': 0.528,
    'Teemo': 0.511, 'Thresh': 0.497, 'Tristana': 0.509, 'Trundle': 0.514,
    'Tryndamere': 0.503, 'TwistedFate': 0.487, 'Twitch': 0.511,
    'Udyr': 0.503, 'Urgot': 0.517,
    'Varus': 0.501, 'Vayne': 0.509, 'Veigar': 0.521, 'Velkoz': 0.517,
    'Vex': 0.514, 'Vi': 0.517, 'Viego': 0.497, 'Viktor': 0.489,
    'Vladimir': 0.503, 'Volibear': 0.511,
    'Warwick': 0.521,
    'Xayah': 0.497, 'Xerath': 0.514, 'XinZhao': 0.511,
    'Yasuo': 0.489, 'Yone': 0.487, 'Yorick': 0.523, 'Yuumi': 0.467,
    'Zac': 0.523, 'Zed': 0.497, 'Zeri': 0.471, 'Ziggs': 0.517,
    'Zilean': 0.528, 'Zoe': 0.489, 'Zyra': 0.521,
};

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
        const firstKey = Object.keys(externalData)[0];

        if (VALID_QUEUES.includes(firstKey)) {
            // New format: { soloq: { top: {...} }, flex: { top: {...} } }
            queueData = externalData;
            dataSource = 'imported';
            const queues = Object.keys(queueData).filter(q => VALID_QUEUES.includes(q));
            const totalChamps = queues.reduce((sum, q) => {
                return sum + Object.values(queueData[q] || {}).reduce((s, roleData) => s + Object.keys(roleData || {}).length, 0);
            }, 0);
            console.log(`[WinRate] Loaded queue-based win rates for ${queues.join(', ')} (${totalChamps} total entries)`);
        } else if (VALID_ROLES.includes(firstKey.toLowerCase())) {
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
            // Flat format: { "Aatrox": 0.52, ... }
            queueData = {};
            dataSource = 'static';
            // Store as static override
            for (const [name, val] of Object.entries(externalData)) {
                STATIC_WIN_RATES[name] = typeof val === 'object' ? (val.winRate || 0.50) : val;
            }
            console.log(`[WinRate] Loaded ${Object.keys(externalData).length} static win rates`);
        }
    } else {
        queueData = {};
        dataSource = 'static';
        console.log(`[WinRate] Loaded ${Object.keys(STATIC_WIN_RATES).length} champion win rates (source: static)`);
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
        return STATIC_WIN_RATES[championName] || 0.50;
    }
    return STATIC_WIN_RATES[championName] || 0.50;
}

/**
 * Get full stats for a champion.
 * @param {string} championName
 * @param {string} [role]
 * @param {string} [queue] - 'soloq' or 'flex'
 * @returns {Object} { winRate, pickRate, banRate, tier, matches, hasData }
 */
function getChampionStats(championName, role = null, queue = 'soloq') {
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

    // Fallback to static
    if (!entry) {
        const staticVal = STATIC_WIN_RATES[championName];
        if (staticVal) {
            entry = staticVal;
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
