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

let countersDB = require('../data/counters.json');
const { getChampionStats } = require('../data/winRateProvider');
const { getChampionTags, getIdToNameMap } = require('../data/champions');
const {
    getCompositionRoles,
    detectTeamComposition,
    getCompositionTier,
    getArchetypeFitBonus,
    COMP_ARCHETYPES,
} = require('../data/archetypeMapping.cjs');

// ─── Champion ID ↔ Name Mapping ─────────────────────────────────────────
// This will be populated dynamically from Data Dragon via initializeEngine()
let championIdMap = {};    // id → name
let championNameMap = {};  // name → id
let isInitialized = false;

/**
 * Initialize the engine with Data Dragon data.
 * Called from main.js after loadChampionData() completes.
 * @param {{ idToName: Object, nameToId: Object, tagsMap: Object, countersDB: Object }} data
 */
function initializeEngine({ idToName, nameToId, countersDB: injectedDB }) {
    championIdMap = idToName || {};
    championNameMap = nameToId || {};
    if (injectedDB) {
        countersDB = injectedDB;
        console.log(`[Engine] Injected countersDB with ${Object.keys(countersDB).length} keys`);
    }
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
// Helper to strip flex pick marker
function cleanName(name) {
    if (!name) return name;
    return name.endsWith('*') ? name.slice(0, -1) : name;
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
    return championNameMap[cleanName(name)] || 0;
}

/**
 * Get tags for a champion by name.
 */
function getTagsForChampion(name) {
    return getChampionTags(cleanName(name));
}

/**
 * Derive required/bonus composition roles from a custom archetype's champion pool.
 * Roles appearing in ≥3 champions → required; 1-2 → bonus.
 * @param {Object} championPool - { top: string[], jungle: string[], ... }
 * @returns {{ required: string[], bonus: string[] }}
 */
function deriveRolesFromPool(championPool) {
    const roleCounts = {};
    for (const champNames of Object.values(championPool || {})) {
        for (const rawName of (champNames || [])) {
            const compRoles = getCompositionRoles(getTagsForChampion(rawName));
            for (const role of compRoles) {
                roleCounts[role] = (roleCounts[role] || 0) + 1;
            }
        }
    }
    const required = Object.entries(roleCounts).filter(([, c]) => c >= 3).map(([r]) => r);
    const bonus = Object.entries(roleCounts).filter(([, c]) => c >= 1 && c < 3).map(([r]) => r);
    return { required, bonus };
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
 * @param {{ role: string, allyPicks: number[], enemyPicks: number[], bannedChampions: number[], targetArchetype: string, targetArchetypeDef: Object }} params
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
    targetArchetypeDef = null, // Custom definition from user
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
    const allyCount = allyPicks.length;

    // ─── Draft phase multipliers ─────────────────────────────────────────
    // As more picks are revealed, counter/synergy data becomes more reliable
    // and should weigh more. Archetype fit is most important early in the draft.
    const totalPicks = allyPicks.length + enemyPicks.length;
    const phaseRatio = Math.min(totalPicks / 10, 1); // 0.0 (no picks) → 1.0 (full draft)
    const counterSynergyMult = 0.5 + phaseRatio * 0.5; // 0.50 → 1.00
    const archetypeMult = 1.5 - phaseRatio * 0.5;      // 1.50 → 1.00

    const results = [];
    const allChampions = championIdMap; // Use internal map (injected or loaded)

    // Flex Pick Strategy: Are we in early draft?
    const isEarlyDraft = allyCount <= 2;

    // ⚡ Bolt Performance Optimization:
    // deriveRolesFromPool iterates over the entire custom champion pool to map tags to roles.
    // Calling this inside the loop (~165 iterations) causes an O(N * P) complexity where N is champions
    // and P is the pool size. Memoizing it outside the loop saves redundant work.
    const customArchetypeRolesMemo = targetArchetypeDef?.champion_pool
        ? deriveRolesFromPool(targetArchetypeDef.champion_pool)
        : null;

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

        // ─── Win rate bonus (NEW) & Tier Bonus ───────────────────────────────
        // Determine context role for win rate lookup
        // If a role is assigned, use it; otherwise, use 'all' for general win rate.
        const lookupRole = normalizedRole || 'all';

        const stats = getChampionStats(champName, lookupRole);

        // Ensure we only recommend champions that are actually played in this role
        if (lookupRole !== 'all' && !stats.hasData) {
            continue;
        }

        // Skip champions with imported data but insufficient sample size
        const MIN_MATCHES = 75;
        if (stats.hasData && stats.matches > 0 && stats.matches < MIN_MATCHES) {
            continue;
        }

        const champWinRate = stats.winRate;
        const champTier = stats.tier || '';
        const champPickRate = stats.pickRate || 0;

        // Merge dynamic counters from U.GG scraper
        const dynamicCounters = stats.counters || {};
        const mergedCounters = { ...(champData.counters || {}), ...dynamicCounters };

        // ─── Counter bonus ──────────────────────────────────────
        for (const enemyName of enemyNames) {
            if (mergedCounters[enemyName]) {
                const winrate = mergedCounters[enemyName];
                const bonus = (winrate - 0.50) * 100 * counterSynergyMult;
                score += bonus;
                counterScore += bonus;
                const verb = winrate < 0.50 ? 'Countered by' : 'Counters';
                scoreDetails.push(`${verb} ${enemyName} (${(winrate * 100).toFixed(0)}% WR)`);
            }
        }

        // ─── Synergy bonus (bidirectional) ──────────────────────
        for (const allyName of allyNames) {
            const ownSyn = champData.synergies?.[allyName];
            const reverseSyn = countersDB[allyName]?.synergies?.[champName];

            let winrate = null;
            if (ownSyn && reverseSyn) winrate = (ownSyn + reverseSyn) / 2;
            else if (ownSyn) winrate = ownSyn;
            else if (reverseSyn) winrate = reverseSyn;

            if (winrate !== null) {
                const bonus = (winrate - 0.50) * 100 * counterSynergyMult;
                score += bonus;
                synergyScore += bonus;
                scoreDetails.push(`Synergy with ${allyName} (${(winrate * 100).toFixed(0)}% WR)`);
            }
        }


        // Base WR Bonus
        const wrBonus = (champWinRate - 0.50) * 50;
        score += wrBonus;

        // Tier Bonus logic
        if (champTier === 'S+') score += 10;
        else if (champTier === 'S') score += 8;
        else if (champTier === 'A') score += 5;
        else if (champTier === 'B') score += 2;

        if (champWinRate > 0.52) {
            scoreDetails.push(`High Win Rate (${(champWinRate * 100).toFixed(1)}%)`);
        }
        if (champTier && ['S+', 'S', 'A'].includes(champTier)) {
            scoreDetails.push(`High Tier (${champTier})`);
        }

        // ─── Archetype bonus (NEW) ──────────────────────────────
        const champTags = getTagsForChampion(champName);
        let fitBonus = 0;

        // ─── FLEX PICK & Custom Archetype Logic ─────────────────
        if (targetArchetypeDef && targetArchetypeDef.typical_comp) {
            // Check if this champion is part of the custom archetype plan
            const planRole = normalizedRole;
            // Check if this specific champion is in the plan for this role
            const planNameRaw = targetArchetypeDef.typical_comp[planRole];
            if (planNameRaw) {
                const planName = cleanName(planNameRaw);
                const isFlex = planNameRaw.endsWith('*');

                if (planName === champName) {
                    // It's the exact planned champion
                    score += 20;
                    scoreDetails.push('Planned Pick');

                    // FLEX PRIORITY
                    if (isFlex && isEarlyDraft) {
                        score += 50; // Huge bonus to secure flex pick early
                        scoreDetails.push('★ FLEX PRIORITY');
                    }
                }
            }
        }

        // ─── Champion Pool Bonus (custom archetypes) ────────────
        if (targetArchetypeDef?.champion_pool?.[normalizedRole]) {
            const pool = targetArchetypeDef.champion_pool[normalizedRole].map(n => cleanName(n));
            if (pool.includes(champName)) {
                score += 8;
                scoreDetails.push('Champion Pool');
            }
        }

        // Standard Archetype Logic
        if (targetArchetype && COMP_ARCHETYPES[targetArchetype]) {
            // Built-in archetype: use existing tag-based fit
            fitBonus = getArchetypeFitBonus(champTags, targetArchetype);
            if (fitBonus > 0) {
                scoreDetails.push(`Fits target ${targetArchetype} comp`);
            }
        } else if (customArchetypeRolesMemo) {
            // Custom archetype: use pre-derived roles from pool and score by tag fit
            const derived = customArchetypeRolesMemo;
            const champRoles = getCompositionRoles(champTags);
            let customFit = 0;
            for (const req of derived.required) {
                if (champRoles.includes(req)) customFit += 3;
            }
            for (const bon of derived.bonus) {
                if (champRoles.includes(bon)) customFit += 1;
            }
            fitBonus = Math.min(customFit, 5);
            if (fitBonus > 0) {
                scoreDetails.push(`Fits custom comp style`);
            }
        }
        // Otherwise use detected composition
        else if (compAnalysis && compAnalysis.archetype !== 'unknown') {
            fitBonus = getArchetypeFitBonus(champTags, compAnalysis.archetype);
            if (fitBonus > 0) {
                scoreDetails.push(`Fits ${compAnalysis.name} comp`);
            }
        }
        const scaledFitBonus = fitBonus * archetypeMult;
        score += scaledFitBonus;
        archetypeScore += scaledFitBonus;

        // ─── Base role bonus ────────────────────────────────────
        if (normalizedRole && champData.roles?.includes(normalizedRole)) {
            score += 1; // Slight preference for main role
        }

        // ─── Roster / Favorites / Flex Mode ─────────────────────
        if (rosterConfig && rosterConfig.roster) {
            const roleKey = normalizedRole;
            const roleData = rosterConfig.roster[roleKey];

            if (roleData && roleData.favorites && roleData.favorites.includes(champName)) {
                if (rosterConfig.myRole === roleKey) {
                    score += 15;
                    scoreDetails.push(`Your Main ❤️`);
                } else {
                    score += 5;
                    scoreDetails.push(`Teammate Fav 🤝`);
                }
            }

            // Flex Mode Synergy
            if (rosterConfig.gameMode === 'flex') {
                const otherRoles = Object.keys(rosterConfig.roster).filter(r => r !== roleKey);
                let flexSynergyParams = 0;

                for (const r of otherRoles) {
                    const allyInRole = allies.find(a => (a.role?.toLowerCase() || '') === r);
                    if (allyInRole && allyInRole.championId === 0) {
                        const favs = rosterConfig.roster[r].favorites || [];
                        for (const fav of favs) {
                            const syn = champData.synergies?.[fav];
                            if (syn && syn > 0.52) {
                                flexSynergyParams++;
                                score += (syn - 0.50) * 20;
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
            tier: champTier || calculateTier(score),
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

/**
 * Advanced analysis of a full team composition (names).
 * Calculates Meta Score, Tier, and suggests substitutions.
 * @param {Object} teamRoles - { top: "Name", jungle: "Name", ... }
 */
function getCompositionAnalysis(teamRoles, queue = 'soloq') {
    const teamChampions = [];
    const roleMap = {}; // name -> role

    // 1. Collect Valid Champions
    for (const [role, name] of Object.entries(teamRoles)) {
        if (!name) continue;
        const stats = getChampionStats(name, role, queue);
        const tags = getTagsForChampion(name);
        roleMap[name] = role;
        teamChampions.push({
            name,
            role,
            stats,
            tags,
            winRate: stats.winRate || 0.50
        });
    }

    if (teamChampions.length === 0) return null;

    // 2. Base Composition Detection
    // We can reuse detectTeamComposition but we need to adapt the input or just use the logic here
    const composition = detectTeamComposition(teamChampions);

    // 3. Calculate Meta Score
    // Formula: 50% Avg WR + 30% Comp Fit + 20% Synergy (simplified to just WR and Fit for now)
    const avgWR = teamChampions.reduce((sum, c) => sum + c.winRate, 0) / teamChampions.length;

    // Normalize WR: 45% -> 0, 55% -> 100
    // roughly: (wr - 0.45) / 0.10 * 100
    let wrScore = (avgWR - 0.45) * 1000; // 0.50 -> 50
    wrScore = Math.max(0, Math.min(100, wrScore));

    // Comp Fit: 0 to 1 -> 0 to 100. detectTeamComposition returns confidence.
    // Max confidence is roughly (5 champs * 3 points) = 15.
    const maxConf = teamChampions.length * 3;
    let fitScore = (composition.confidence / maxConf) * 100;
    fitScore = Math.max(0, Math.min(100, fitScore));

    const metaScore = Math.round((wrScore * 0.6) + (fitScore * 0.4));

    // Tier Calculation
    let tier = 'D';
    if (metaScore >= 85) tier = 'S';
    else if (metaScore >= 70) tier = 'A';
    else if (metaScore >= 55) tier = 'B';
    else if (metaScore >= 40) tier = 'C';

    const isOutOfMeta = avgWR < 0.49;

    // 4. Substitution Suggestions
    const suggestions = [];
    const allChamps = getIdToNameMap(); // id -> name
    const allNames = Object.values(allChamps);

    // Identify weak links (WR < 49% or just lowest in team)
    // For each member, try to find a better option
    for (const member of teamChampions) {
        if (member.winRate > 0.52) continue; // Don't replace strong picks

        // Find candidates in same role with similar tags
        const candidates = [];

        for (const candidateName of allNames) {
            if (candidateName === member.name) continue;
            // Check if candidate is already in team
            if (Object.values(teamRoles).includes(candidateName)) continue;

            const candStats = getChampionStats(candidateName, member.role, queue);
            if (!candStats || candStats.matches < 50) continue; // Skip low sample size

            // Must have significantly higher WR
            if (candStats.winRate <= member.winRate + 0.015) continue; // +1.5% improvement min

            // Must match at least one PRIMARY tag (Archetype preservation)
            const candTags = getTagsForChampion(candidateName);
            const commonTags = member.tags.filter(t => candTags.includes(t));

            // Heuristic: If they share the first tag (primary class), it's a good sub
            if (commonTags.length > 0 && commonTags.includes(member.tags[0])) {
                candidates.push({
                    name: candidateName,
                    winRate: candStats.winRate,
                    diff: candStats.winRate - member.winRate
                });
            }
        }

        // Sort candidates by WR improvement
        candidates.sort((a, b) => b.diff - a.diff);

        // Add top suggestion if any
        if (candidates.length > 0) {
            const best = candidates[0];
            suggestions.push({
                out: member.name,
                in: best.name,
                diff: (best.diff * 100).toFixed(1)
            });
        }
    }

    // Limit suggestions to top 3 improvements
    suggestions.sort((a, b) => parseFloat(b.diff) - parseFloat(a.diff));
    const topSuggestions = suggestions.slice(0, 3);

    return {
        ...composition,
        tier,
        metaScore,
        isOutOfMeta,
        suggestions: topSuggestions,
        championCount: teamChampions.length
    };
}

/**
 * Get OP Picks (High Tier/WR champions).
 * @param {string} [queue='soloq']
 * @returns {Array} List of OP champions
 */
function getOpPicks(queue = 'soloq') {
    const allChamps = getIdToNameMap();
    const allNames = Object.values(allChamps);
    const opCandidates = [];

    // Consider major roles
    const ROLES = ['top', 'jungle', 'mid', 'adc', 'support'];

    for (const name of allNames) {
        // Check finding best role for this champ
        // Or just check all roles and return the best instances
        for (const role of ROLES) {
            const stats = getChampionStats(name, role, queue);
            if (!stats.hasData) continue;

            // Criteria for "OP":
            // 1. Tier S or S+
            // 2. OR Winrate > 52.5% and Matches > 100
            const isHighTier = ['S+', 'S'].includes(stats.tier);
            const isHighVibe = stats.winRate > 0.525 && stats.matches > 100;

            if (isHighTier || isHighVibe) {
                opCandidates.push({
                    name,
                    role,
                    tier: stats.tier || calculateTier((stats.winRate - 0.50) * 100 + (stats.pickRate * 10)),
                    winRate: stats.winRate,
                    pickRate: stats.pickRate,
                    matches: stats.matches,
                    score: stats.winRate * 100 + (stats.pickRate * 10) + (isHighTier ? 5 : 0)
                });
            }
        }
    }

    // Sort by internal score desc
    opCandidates.sort((a, b) => b.score - a.score);

    // Filter duplicates (same champ in multiple roles? maybe keep them if they are good in both)
    // Let's keep unique champions, preferring their best role
    const uniqueOps = [];
    const seen = new Set();
    for (const cand of opCandidates) {
        if (!seen.has(cand.name)) {
            uniqueOps.push(cand);
            seen.add(cand.name);
        }
    }

    return uniqueOps.slice(0, 10); // Return top 10
}

module.exports = {
    initializeEngine,
    getRecommendations,
    normalizeRole,
    analyzeTeamComposition,
    resolveChampionName,
    getCompositionAnalysis,
    getOpPicks,
};
