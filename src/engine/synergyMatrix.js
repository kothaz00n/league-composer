/**
 * synergyMatrix.js — Cross-Role Synergy Calculator
 *
 * Computes pairwise synergy scores for any two champions in a team,
 * considering their Riot tags, composition roles, and explicit synergy data.
 *
 * Score formula per pair:
 *   tagSynergy  (tag-based heuristic: e.g. Tank + Assassin = engage enabler)
 *   + dataSynergy (explicit synergy win rate from counters.json)
 *   → normalized to 0-10 scale
 */

const countersDB = require('../data/counters.json');
const { getChampionTags } = require('../data/champions');

// ─── Tag Synergy Matrix ──────────────────────────────────────────────────────
// Defines how pairs of Riot tags synergize. Values 0-3.
// 3 = Core synergy (engage + aoe), 2 = Good, 1 = Decent, 0 = Neutral/Anti
const TAG_SYNERGY_MATRIX = {
    'Tank-Mage': 3,        // Tank engages → Mage unloads AoE (Malphite + Orianna)
    'Tank-Marksman': 3,    // Tank peel → Marksman survives (Leona + Jinx)
    'Tank-Assassin': 2,    // Tank locks down → Assassin picks off
    'Tank-Fighter': 2,     // Double frontline
    'Tank-Support': 2,     // Tank + enchanter = peel + engage
    'Fighter-Mage': 2,     // Bruiser + poke combo
    'Fighter-Marksman': 1, // Carry + bruiser frontline
    'Mage-Marksman': 2,    // Poke comp core
    'Mage-Support': 2,     // Mage + enchanter = scaling poke
    'Mage-Assassin': 1,    // Somewhat redundant damage
    'Assassin-Support': 1, // Pick comp with lockdown
    'Marksman-Support': 2, // Bot lane duo baseline
    'Support-Mage': 2,     // Enchanter + poke
    'Fighter-Fighter': 1,  // Two bruisers (split push viable)
    'Tank-Tank': 0,        // Too tanky, no damage
    'Assassin-Assassin': 0,// Glass cannon risk
};

/**
 * Get synergy score between two tags (order-insensitive).
 * @param {string} tagA
 * @param {string} tagB
 * @returns {number} 0-3
 */
function getTagPairScore(tagA, tagB) {
    if (tagA === tagB) return 1; // Same type = mild synergy
    const key1 = `${tagA}-${tagB}`;
    const key2 = `${tagB}-${tagA}`;
    return TAG_SYNERGY_MATRIX[key1] ?? TAG_SYNERGY_MATRIX[key2] ?? 0;
}

/**
 * Get a human-readable label for a synergy score.
 * @param {number} score 0-10
 * @returns {string}
 */
function getSynergyLabel(score) {
    if (score >= 8) return 'Exceptional Synergy';
    if (score >= 6) return 'Great Synergy';
    if (score >= 4) return 'Good Synergy';
    if (score >= 2) return 'Decent Synergy';
    return 'Low Synergy';
}

/**
 * Generate a human-readable reason for a synergy score.
 * @param {string[]} tagsA
 * @param {string[]} tagsB
 * @param {number} rawTagScore
 * @param {boolean} hasExplicit
 */
function getSynergyReason(champA, tagsA, champB, tagsB, rawTagScore, hasExplicit) {
    const reasons = [];
    if (hasExplicit) reasons.push(`Data: ${champA} and ${champB} have proven win rate synergy`);
    if (rawTagScore >= 3) reasons.push(`${tagsA[0] || 'Tank'} enables ${tagsB[0] || 'Carry'} to shine`);
    else if (rawTagScore >= 2) reasons.push(`${tagsA[0]} and ${tagsB[0]} complement each other well`);
    else if (rawTagScore === 1) reasons.push(`Decent role combination`);
    else reasons.push(`These champions don't naturally synergize`);
    return reasons[0] || 'No data available';
}

/**
 * Compute synergy score between two champions.
 * @param {string} champA
 * @param {string} champB
 * @param {string} [roleA] - unused, reserved for future role-specific logic
 * @param {string} [roleB]
 * @returns {{ score: number, label: string, reason: string }}
 */
function getSynergyScore(champA, champB, roleA, roleB) {
    const tagsA = getChampionTags(champA) || [];
    const tagsB = getChampionTags(champB) || [];
    const dbA = countersDB[champA];
    const dbB = countersDB[champB];

    // 1. Tag-based synergy: best pair across tags
    let rawTagScore = 0;
    for (const tA of tagsA) {
        for (const tB of tagsB) {
            const s = getTagPairScore(tA, tB);
            if (s > rawTagScore) rawTagScore = s;
        }
    }

    // 2. Explicit data synergy: check counters.json both directions
    let dataSynergy = 0;
    let hasExplicit = false;
    const synA = dbA?.synergies?.[champB];
    const synB = dbB?.synergies?.[champA];
    if (synA && synA > 0.50) { dataSynergy = (synA - 0.50) * 40; hasExplicit = true; }
    if (synB && synB > 0.50) { const s = (synB - 0.50) * 40; if (s > dataSynergy) { dataSynergy = s; hasExplicit = true; } }

    // 3. Combine: tag score normalized (0-3 → 0-6) + data synergy (0-4 max)
    const tagContrib = (rawTagScore / 3) * 6;
    const total = tagContrib + dataSynergy;

    // Clamp to 0-10
    const score = Math.min(10, Math.max(0, Math.round(total)));

    return {
        score,
        label: getSynergyLabel(score),
        reason: getSynergyReason(champA, tagsA, champB, tagsB, rawTagScore, hasExplicit),
    };
}

/**
 * Build a full synergy matrix for a team.
 * @param {{ top: string|null, jungle: string|null, mid: string|null, adc: string|null, support: string|null }} teamRoles
 * @returns {{
 *   matrix: Array<{ champA: string, champB: string, roleA: string, roleB: string, score: number, label: string, reason: string }>,
 *   totalScore: number,
 *   avgScore: number,
 *   label: string
 * }}
 */
function getTeamSynergyMatrix(teamRoles) {
    const roles = Object.entries(teamRoles).filter(([, name]) => name);
    const matrix = [];
    let totalScore = 0;
    let pairCount = 0;

    for (let i = 0; i < roles.length; i++) {
        for (let j = i + 1; j < roles.length; j++) {
            const [roleA, champA] = roles[i];
            const [roleB, champB] = roles[j];
            const result = getSynergyScore(champA, champB, roleA, roleB);
            matrix.push({ champA, champB, roleA, roleB, ...result });
            totalScore += result.score;
            pairCount++;
        }
    }

    const avgScore = pairCount > 0 ? totalScore / pairCount : 0;

    // Overall team synergy label
    let label = 'No Data';
    if (pairCount > 0) {
        if (avgScore >= 7) label = 'Exceptional Synergy';
        else if (avgScore >= 5.5) label = 'Strong Synergy';
        else if (avgScore >= 4) label = 'Moderate Synergy';
        else if (avgScore >= 2.5) label = 'Weak Synergy';
        else label = 'Poor Synergy';
    }

    return {
        matrix,
        totalScore: Math.round(totalScore),
        avgScore: parseFloat(avgScore.toFixed(1)),
        label,
        pairCount,
    };
}

module.exports = { getSynergyScore, getTeamSynergyMatrix, getSynergyLabel };
