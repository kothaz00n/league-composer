/**
 * recommend.js — Recommendation Engine
 *
 * Scores each champion based on:
 *  - Counter bonus: how well this champion does vs enemy picks
 *  - Synergy bonus: how well this champion pairs with ally picks
 *  - Win rate bonus: champion's overall win rate in the current meta
 *  - Archetype bonus: how well this champion fits the team composition
 *  - Role filter: only recommends champions that match the user's assigned role
 *  - Exclusion: removes banned and already-picked champions
 *
 * Score formula:
 *   score(champion) =
 *     Σ counterBonus(vs enemyPick) +
 *     Σ synergyBonus(with allyPick) +
 *     winRateBonus(champion) +
 *     archetypeBonus(champion, teamComp) +
 *     roleBonus
 *
 * Also returns team composition analysis (archetype + tier).
 */

const countersDB = require('../data/counters.json');
const { getChampionStats } = require('../data/winRateProvider');
const { getChampionTags, getIdToNameMap } = require('../data/champions');
const {
    getCompositionRoles,
    detectTeamComposition,
    getCompositionTier,
    getArchetypeFitBonus,
} = require('../data/archetypeMapping.cjs');

// ─── Champion ID ↔ Name Mapping ─────────────────────────────────────────
// This will be populated dynamically from Data Dragon via initializeEngine()
let championIdMap = {};    // id → name
let championNameMap = {};  // name → id
let isInitialized = false;

/**
 * Initialize the engine with Data Dragon data.
 * Called from main.js after loadChampionData() completes.
 * @param {{ idToName: Object, nameToId: Object, tagsMap: Object }} data
 */
function initializeEngine({ idToName, nameToId }) {
    championIdMap = idToName || {};
    championNameMap = nameToId || {};
    isInitialized = true;
    console.log(`[Engine] Initialized with ${Object.keys(championIdMap).length} champions`);
}

/**
 * Normalize role names from LCU format to our DB format.
 * LCU sends: "top", "jungle", "middle", "bottom", "utility"
 * Our DB uses: "top", "jungle", "mid", "adc", "support"
 */
function normalizeRole(role) {
    const map = {
        top: 'top',
        jungle: 'jungle',
        middle: 'mid',
        mid: 'mid',
        bottom: 'adc',
        adc: 'adc',
        utility: 'support',
        support: 'support',
    };
    return map[role?.toLowerCase()] || role?.toLowerCase() || '';
}

/**
 * Resolve a champion ID to a name, using dynamic Data Dragon data
 * with fallback to the counters DB entries.
 */
function resolveChampionName(id) {
    return championIdMap[id] || null;
}

/**
 * Resolve a champion name to an ID.
 */
function resolveChampionId(name) {
    return championNameMap[name] || 0;
}

/**
 * Get tags for a champion by name.
 */
function getTagsForChampion(name) {
    return getChampionTags(name);
}

/**
 * Analyze the team composition based on current ally picks.
 * @param {number[]} allyPickIds - champion IDs of allies
 * @returns {{ archetype: string, name: string, icon: string, desc: string, tier: string }}
 */
function analyzeTeamComposition(allyPickIds) {
    const teamChampions = allyPickIds
        .map(id => {
            const name = resolveChampionName(id);
            if (!name) return null;
            return {
                name,
                tags: getTagsForChampion(name),
                winRate: getChampionStats(name).winRate,
            };
        })
        .filter(Boolean);

    const composition = detectTeamComposition(teamChampions);
    const tier = getCompositionTier(teamChampions);

    return {
        ...composition,
        tier,
        championCount: teamChampions.length,
    };
}

/**
 * Compute recommendations.
 * @param {{ role: string, allyPicks: number[], enemyPicks: number[], bannedChampions: number[], targetArchetype: string }} params
 * @param {Object} options.rosterConfig - user roster settings (roles, favorites)
 * @param {Array} options.allies - full ally objects { role, championId, ... }
 * @returns {{ recommendations: Array, compositionAnalysis: Object }}
 */
function getRecommendations({
    role,
    allyPicks = [],
    enemyPicks = [],
    bannedChampions = [],
    targetArchetype = null,
    rosterConfig = null,
    allies = [],
}) {
    const normalizedRole = normalizeRole(role);

    // Convert IDs to names for lookup
    const allyNames = allyPicks.map(id => resolveChampionName(id)).filter(Boolean);
    const enemyNames = enemyPicks.map(id => resolveChampionName(id)).filter(Boolean);
    const bannedNames = bannedChampions.map(id => resolveChampionName(id)).filter(Boolean);

    // All unavailable champion names (allies, enemies, bans)
    const unavailable = new Set([...allyNames, ...enemyNames, ...bannedNames]);

    // Analyze current team composition
    const compAnalysis = analyzeTeamComposition(allyPicks);

    const results = [];
    const allChampions = getIdToNameMap(); // Get all champions from the new champions module

    for (const champId of Object.keys(allChampions)) {
        const champName = allChampions[champId];
        const champData = countersDB[champName]; // Still use countersDB for specific counter/synergy data

        // Skip if unavailable or no specific data in countersDB
        if (unavailable.has(champName) || !champData) continue;

        // Filter by role (if role is known)
        if (normalizedRole && champData.roles && !champData.roles.includes(normalizedRole)) {
            continue;
        }

        let score = 0;
        const scoreDetails = [];
        let counterScore = 0;
        let synergyScore = 0;
        let archetypeScore = 0;

        // ─── Counter bonus ──────────────────────────────────────
        for (const enemyName of enemyNames) {
            if (champData.counters && champData.counters[enemyName]) {
                const winrate = champData.counters[enemyName];
                const bonus = (winrate - 0.50) * 100; // e.g. 0.55 → +5 points
                score += bonus;
                counterScore += bonus;
                scoreDetails.push(`Counters ${enemyName} (${(winrate * 100).toFixed(0)}% WR)`);
            }
        }

        // ─── Synergy bonus ──────────────────────────────────────
        for (const allyName of allyNames) {
            if (champData.synergies && champData.synergies[allyName]) {
                const winrate = champData.synergies[allyName];
                const bonus = (winrate - 0.50) * 100;
                score += bonus;
                synergyScore += bonus;
                scoreDetails.push(`Synergy with ${allyName} (${(winrate * 100).toFixed(0)}% WR)`);
            }
        }

        // ─── Win rate bonus (NEW) & Tier Bonus ───────────────────────────────
        // Determine context role for win rate lookup
        // If a role is assigned, use it; otherwise, use 'all' for general win rate.
        const lookupRole = normalizedRole || 'all';

        const stats = getChampionStats(champName, lookupRole);
        const champWinRate = stats.winRate;
        const champTier = stats.tier || '';
        const champPickRate = stats.pickRate || 0;

        const wrBonus = (champWinRate - 0.50) * 50; // e.g. 0.53 → +1.5 points
        score += wrBonus;

        // Tier Bonus logic
        if (champTier === 'S+') score += 10;
        else if (champTier === 'S') score += 8;
        else if (champTier === 'A') score += 5;
        else if (champTier === 'B') score += 2;
        // C/D: 0 bonus

        // Pick Rate Bonus (Popularity suggests viability)
        // e.g. 10% pick rate -> +1 point. Modest bonus.
        score += (champPickRate * 10);

        if (champWinRate > 0.52) {
            scoreDetails.push(`High Win Rate (${(champWinRate * 100).toFixed(1)}%)`);
        }
        if (champTier && ['S+', 'S', 'A'].includes(champTier)) {
            scoreDetails.push(`High Tier (${champTier})`);
        }

        // ─── Archetype bonus (NEW) ──────────────────────────────
        const champTags = getTagsForChampion(champName);
        let fitBonus = 0;

        // If user manually selected a target archetype, prioritize that
        if (targetArchetype) {
            fitBonus = getArchetypeFitBonus(champTags, targetArchetype);
            if (fitBonus > 0) {
                scoreDetails.push(`Fits target ${targetArchetype} comp`);
            }
        }
        // Otherwise use detected composition
        else if (compAnalysis && compAnalysis.archetype !== 'unknown') {
            fitBonus = getArchetypeFitBonus(champTags, compAnalysis.archetype);
            if (fitBonus > 0) {
                scoreDetails.push(`Fits ${compAnalysis.name} comp`);
            }
        }
        score += fitBonus;
        archetypeScore += fitBonus;

        // ─── Base role bonus ────────────────────────────────────
        if (normalizedRole && champData.roles?.includes(normalizedRole)) {
            score += 1; // Slight preference for main role
        }

        // ─── Roster / Favorites / Flex Logic (NEW) ──────────────
        if (rosterConfig && rosterConfig.roster) {
            // Check if this champion is a favorite for the assigned role
            // Normalized role is 'top', 'jungle', etc.
            const roleKey = normalizedRole;
            const roleData = rosterConfig.roster[roleKey];

            if (roleData && roleData.favorites && roleData.favorites.includes(champName)) {
                // Determine if it's MY role or someone else's
                if (rosterConfig.myRole === roleKey) {
                    score += 15; // Massive bonus for comfort pick
                    scoreDetails.push(`Your Main ❤️`);
                } else {
                    score += 5;
                    scoreDetails.push(`Teammate Fav 🤝`);
                }
            }

            // Flex Mode: Synergy with potential teammate picks
            if (rosterConfig.gameMode === 'flex') {
                // Retrieve potential allies (teammates who haven't picked yet)
                // We assume the roster data matches the assigned positions
                const otherRoles = Object.keys(rosterConfig.roster).filter(r => r !== roleKey);

                let flexSynergyParams = 0;

                for (const r of otherRoles) {
                    // Check if this role is open (not picked)
                    // Allies array from LCU: { role: 'TOP', championId: 0, ... }
                    const allyInRole = allies.find(a => (a.role?.toLowerCase() || '') === r); // Riot uses UPPERCASE
                    if (allyInRole && allyInRole.championId === 0) {
                        // Check favorites for this role
                        const favs = rosterConfig.roster[r].favorites || [];
                        for (const fav of favs) {
                            // Synergy: How well does champName play WITH fav?
                            // countersDB[champName].synergies[fav]
                            const syn = champData.synergies?.[fav];
                            if (syn && syn > 0.52) {
                                flexSynergyParams++;
                                score += (syn - 0.50) * 20; // Bonus for potential synergy
                            }
                        }
                    }
                }

                if (flexSynergyParams > 0) {
                    scoreDetails.push(`Synergy with team pool`);
                }
            }
        }

        // Get composition roles for display
        const compRoles = getCompositionRoles(champTags);

        results.push({
            name: champName,
            id: resolveChampionId(champName),
            score: score,
            winRate: champWinRate,
            pickRate: champPickRate,
            banRate: stats.banRate || 0,
            matches: stats.matches || 0,
            roles: champData.roles, // e.g. ["Mage", "Support"]
            tags: champTags,     // e.g. ["Mage"]
            compRoles: compRoles, // e.g. ["poke", "dps"]
            tier: champTier || calculateTier(score), // Uses imported Tier if available, else synthetic
            details: scoreDetails,
            analysis: {
                synergy: synergyScore,
                counter: counterScore,
            }
        });
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    const recommendations = results.slice(0, 5);

    return {
        recommendations,
        compositionAnalysis: compAnalysis,
    };
}

/**
 * Assign a synthetic tier (S, A, B, C, D) based on score if no specific tier data.
 * @param {number} score 
 * @returns {string} Tier
 */
function calculateTier(score) {
    if (score >= 25) return 'S+';
    if (score >= 20) return 'S';
    if (score >= 15) return 'A';
    if (score >= 10) return 'B';
    if (score >= 5) return 'C';
    return 'D';
}

module.exports = {
    initializeEngine,
    getRecommendations,
    normalizeRole,
    analyzeTeamComposition,
    resolveChampionName,
};
