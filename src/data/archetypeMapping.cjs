/**
 * archetypeMapping.js — Archetype & Composition Classification
 *
 * Maps Riot's Data Dragon champion tags to custom composition archetypes.
 * Provides functions to detect a team's composition type and rate it.
 */

// ─── Riot Tag → Composition Role Mapping ────────────────────────────────
// Each Riot tag maps to one or more composition roles
const TAG_TO_COMP_ROLES = {
    'Tank': ['engage', 'frontline'],
    'Fighter': ['dive', 'bruiser'],
    'Mage': ['poke', 'teamfight'],
    'Assassin': ['dive', 'pick'],
    'Marksman': ['hypercarry', 'dps'],
    'Support': ['protect', 'anti-engage'],
};

// ─── Composition Archetypes ─────────────────────────────────────────────
// Each archetype has a name, description, required roles, and an icon
const COMP_ARCHETYPES = {
    hardEngage: {
        name: 'Hard Engage',
        icon: '⚔️',
        desc: 'Strong initiation with heavy CC and frontline',
        requiredRoles: ['engage', 'frontline'],
        bonusRoles: ['teamfight', 'dps'],
    },
    protect: {
        name: 'Protect the Carry',
        icon: '🛡️',
        desc: 'Peel-heavy comp focused on keeping the hypercarry alive',
        requiredRoles: ['protect', 'hypercarry'],
        bonusRoles: ['anti-engage', 'frontline'],
    },
    dive: {
        name: 'Dive / Pick',
        icon: '🗡️',
        desc: 'Aggressive comp that dives the backline',
        requiredRoles: ['dive'],
        bonusRoles: ['pick', 'bruiser'],
    },
    poke: {
        name: 'Poke / Siege',
        icon: '🏹',
        desc: 'Long-range poke to win fights before they start',
        requiredRoles: ['poke', 'dps'],
        bonusRoles: ['anti-engage'],
    },
    splitpush: {
        name: 'Splitpush',
        icon: '🔱',
        desc: 'Strong sidelaners that create map pressure',
        requiredRoles: ['bruiser'],
        bonusRoles: ['dive', 'dps'],
    },
    teamfight: {
        name: 'Teamfight / Wombo Combo',
        icon: '💥',
        desc: 'AoE-heavy composition for devastating 5v5 fights',
        requiredRoles: ['teamfight', 'engage'],
        bonusRoles: ['frontline', 'dps'],
    },
};

/**
 * Get composition roles for a champion based on their Riot tags.
 * @param {string[]} riotTags - e.g. ["Fighter", "Tank"]
 * @returns {string[]} composition roles - e.g. ["dive", "bruiser", "engage", "frontline"]
 */
function getCompositionRoles(riotTags) {
    if (!riotTags || !Array.isArray(riotTags)) return [];

    const roles = new Set();
    for (const tag of riotTags) {
        const mapped = TAG_TO_COMP_ROLES[tag];
        if (mapped) {
            mapped.forEach(r => roles.add(r));
        }
    }
    return [...roles];
}

/**
 * Detect the team's composition archetype based on champions' roles.
 * @param {Array<{ tags: string[] }>} teamChampions - array of champion data with tags
 * @returns {{ archetype: string, name: string, icon: string, desc: string, confidence: number }}
 */
function detectTeamComposition(teamChampions) {
    if (!teamChampions || teamChampions.length === 0) {
        return { archetype: 'unknown', name: 'Unknown', icon: '❓', desc: 'Not enough data', confidence: 0 };
    }

    // Collect all roles across the team
    const teamRoles = [];
    for (const champ of teamChampions) {
        const roles = getCompositionRoles(champ.tags || []);
        teamRoles.push(...roles);
    }

    // Count role occurrences
    const roleCounts = {};
    for (const role of teamRoles) {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
    }

    // Score each archetype
    let bestArchetype = null;
    let bestScore = 0;

    for (const [key, archetype] of Object.entries(COMP_ARCHETYPES)) {
        let score = 0;

        // Required roles contribute heavily
        for (const req of archetype.requiredRoles) {
            score += (roleCounts[req] || 0) * 3;
        }

        // Bonus roles contribute lightly
        for (const bonus of archetype.bonusRoles) {
            score += (roleCounts[bonus] || 0) * 1;
        }

        if (score > bestScore) {
            bestScore = score;
            bestArchetype = { archetype: key, ...archetype, confidence: score };
        }
    }

    if (!bestArchetype) {
        return { archetype: 'mixed', name: 'Mixed', icon: '🔀', desc: 'A balanced but unfocused composition', confidence: 0 };
    }

    return bestArchetype;
}

/**
 * Get a composition tier based on how well the team fits an archetype + win rates.
 * @param {Array<{ tags: string[], winRate?: number }>} teamChampions
 * @returns {string} tier - S, A, B, C, or D
 */
function getCompositionTier(teamChampions) {
    if (!teamChampions || teamChampions.length === 0) return 'D';

    const comp = detectTeamComposition(teamChampions);
    const maxPossibleConfidence = teamChampions.length * 3 * 2; // max if all roles match fully

    // Average win rate of the team
    const winRates = teamChampions
        .map(c => c.winRate || 0.50)
        .filter(wr => wr > 0);
    const avgWinRate = winRates.length > 0
        ? winRates.reduce((sum, wr) => sum + wr, 0) / winRates.length
        : 0.50;

    // Combined score: composition fit (0-1) * 50 + win rate influence (0-1) * 50
    const compFit = Math.min(comp.confidence / maxPossibleConfidence, 1.0);
    const wrScore = (avgWinRate - 0.45) / 0.10; // 0.45 = 0, 0.55 = 1
    const combined = compFit * 50 + Math.max(0, Math.min(wrScore, 1)) * 50;

    if (combined >= 80) return 'S';
    if (combined >= 60) return 'A';
    if (combined >= 40) return 'B';
    if (combined >= 20) return 'C';
    return 'D';
}

/**
 * Check if a champion's roles align with a given composition archetype.
 * @param {string[]} championTags - Riot tags for the champion
 * @param {string} archetypeKey - key from COMP_ARCHETYPES
 * @returns {number} bonus score (0-5)
 */
function getArchetypeFitBonus(championTags, archetypeKey) {
    const archetype = COMP_ARCHETYPES[archetypeKey];
    if (!archetype || !championTags) return 0;

    const champRoles = getCompositionRoles(championTags);
    let bonus = 0;

    for (const req of archetype.requiredRoles) {
        if (champRoles.includes(req)) bonus += 3;
    }
    for (const b of archetype.bonusRoles) {
        if (champRoles.includes(b)) bonus += 1;
    }

    return Math.min(bonus, 5); // Cap at 5
}

module.exports = {
    TAG_TO_COMP_ROLES,
    COMP_ARCHETYPES,
    getCompositionRoles,
    detectTeamComposition,
    getCompositionTier,
    getArchetypeFitBonus,
};
