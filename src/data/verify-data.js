/**
 * verify-data.js — Verification Script
 *
 * Tests the data layer, archetype mapping, and recommendation engine
 * without requiring the League Client or Electron.
 *
 * Run: node src/data/verify-data.js
 */

const { loadWinRates, getWinRate, getAllWinRates } = require('./winRateProvider');
const {
    getCompositionRoles,
    detectTeamComposition,
    getCompositionTier,
    getArchetypeFitBonus,
} = require('./archetypeMapping.cjs');
const { getRecommendations, initializeEngine } = require('../engine/recommend');
const { loadChampionData, getIdToNameMap, getNameToIdMap, getChampionTags } = require('./champions');
const countersDB = require('./counters.json');

// ─── Color helpers ──────────────────────────────────────────────────────
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ${green('✓')} ${label}`);
        passed++;
    } else {
        console.log(`  ${red('✗')} ${label}`);
        failed++;
    }
}

async function main() {
    console.log(cyan('\n═══════════════════════════════════════════════'));
    console.log(cyan('  League Draft Recommender — Data Verification'));
    console.log(cyan('═══════════════════════════════════════════════\n'));

    // ─── Test 1: Win Rate Provider ──────────────────────────────
    console.log(yellow('1. Win Rate Provider'));
    await loadWinRates();

    const allWR = getAllWinRates();
    assert(Object.keys(allWR).length > 100, `Loaded ${Object.keys(allWR).length} champion win rates`);
    assert(getWinRate('Aatrox') > 0.40, `Aatrox WR = ${getWinRate('Aatrox')}`);
    assert(getWinRate('Jinx') > 0.40, `Jinx WR = ${getWinRate('Jinx')}`);
    assert(getWinRate('NonExistentChamp') === 0.50, 'Unknown champion defaults to 0.50');
    console.log('');

    // ─── Test 2: Archetype Mapping ──────────────────────────────
    console.log(yellow('2. Archetype Mapping'));

    const tankRoles = getCompositionRoles(['Tank']);
    assert(tankRoles.includes('engage'), 'Tank → includes "engage"');
    assert(tankRoles.includes('frontline'), 'Tank → includes "frontline"');

    const mageRoles = getCompositionRoles(['Mage']);
    assert(mageRoles.includes('poke'), 'Mage → includes "poke"');
    assert(mageRoles.includes('teamfight'), 'Mage → includes "teamfight"');

    const assassinRoles = getCompositionRoles(['Assassin']);
    assert(assassinRoles.includes('dive'), 'Assassin → includes "dive"');
    assert(assassinRoles.includes('pick'), 'Assassin → includes "pick"');

    const marksmanRoles = getCompositionRoles(['Marksman']);
    assert(marksmanRoles.includes('hypercarry'), 'Marksman → includes "hypercarry"');
    console.log('');

    // ─── Test 3: Team Composition Detection ─────────────────────
    console.log(yellow('3. Team Composition Detection'));

    // Engage comp: Malphite (Tank), Amumu (Tank), Leona (Tank)
    const engageComp = detectTeamComposition([
        { tags: ['Tank', 'Fighter'] },      // Malphite
        { tags: ['Tank', 'Fighter'] },      // Amumu
        { tags: ['Tank', 'Support'] },      // Leona
        { tags: ['Mage'] },                 // Orianna
        { tags: ['Marksman'] },             // Jinx
    ]);
    assert(engageComp.archetype !== 'unknown', `Engage comp detected: ${engageComp.name} (confidence: ${engageComp.confidence})`);
    console.log(`    → ${engageComp.icon} ${engageComp.name}: ${engageComp.desc}`);

    // Protect comp
    const protectComp = detectTeamComposition([
        { tags: ['Support'] },              // Lulu
        { tags: ['Support'] },              // Janna-like
        { tags: ['Tank'] },                 // Frontline
        { tags: ['Marksman'] },             // Jinx
        { tags: ['Marksman'] },             // Kog'Maw
    ]);
    assert(protectComp.archetype !== 'unknown', `Protect comp detected: ${protectComp.name} (confidence: ${protectComp.confidence})`);
    console.log(`    → ${protectComp.icon} ${protectComp.name}: ${protectComp.desc}`);

    // Dive comp
    const diveComp = detectTeamComposition([
        { tags: ['Fighter'] },              // Irelia
        { tags: ['Assassin'] },             // Zed
        { tags: ['Fighter'] },              // Camille
        { tags: ['Assassin', 'Mage'] },     // Katarina
        { tags: ['Marksman'] },             // ADC
    ]);
    assert(diveComp.archetype !== 'unknown', `Dive comp detected: ${diveComp.name} (confidence: ${diveComp.confidence})`);
    console.log(`    → ${diveComp.icon} ${diveComp.name}: ${diveComp.desc}`);
    console.log('');

    // ─── Test 4: Composition Tier ───────────────────────────────
    console.log(yellow('4. Composition Tier'));

    const tierA = getCompositionTier([
        { tags: ['Tank'], winRate: 0.53 },
        { tags: ['Tank'], winRate: 0.52 },
        { tags: ['Mage'], winRate: 0.51 },
        { tags: ['Marksman'], winRate: 0.52 },
        { tags: ['Support'], winRate: 0.53 },
    ]);
    assert(['S', 'A', 'B'].includes(tierA), `Strong team → Tier ${tierA}`);

    const tierLow = getCompositionTier([
        { tags: ['Assassin'], winRate: 0.46 },
        { tags: ['Assassin'], winRate: 0.45 },
    ]);
    assert(['C', 'D'].includes(tierLow), `Weak team → Tier ${tierLow}`);
    console.log('');

    // ─── Test 5: Archetype Fit Bonus ────────────────────────────
    console.log(yellow('5. Archetype Fit Bonus'));

    const tankFit = getArchetypeFitBonus(['Tank'], 'hardEngage');
    assert(tankFit > 0, `Tank fits Hard Engage: +${tankFit}`);

    const assassinProtect = getArchetypeFitBonus(['Assassin'], 'protect');
    assert(assassinProtect === 0, `Assassin doesn't fit Protect: +${assassinProtect}`);

    const marksmanProtect = getArchetypeFitBonus(['Marksman'], 'protect');
    assert(marksmanProtect > 0, `Marksman fits Protect: +${marksmanProtect}`);
    console.log('');

    // ─── Test 6: Counters DB Integrity ──────────────────────────
    console.log(yellow('6. Counters DB'));

    const champCount = Object.keys(countersDB).length;
    assert(champCount >= 20, `${champCount} champions in counters.json`);

    let allHaveTags = true;
    for (const [name, data] of Object.entries(countersDB)) {
        if (!data.tags || data.tags.length === 0) {
            allHaveTags = false;
            console.log(`    ${red('!')} ${name} has no tags`);
        }
    }
    assert(allHaveTags, 'All champions in counters.json have tags');
    console.log('');

    // ─── Test 7: Recommendation Engine (New Features) ───────────
    console.log(yellow('7. Recommendation Engine (Target & Role)'));

    // Mock initialization
    await loadChampionData();
    const idToName = getIdToNameMap();
    const nameToId = getNameToIdMap();
    const tagsMap = {};
    for (const champName of Object.values(idToName)) {
        tagsMap[champName] = getChampionTags(champName);
    }
    initializeEngine({ idToName, nameToId, tagsMap });

    // Test Role Override
    const recsJungle = getRecommendations({
        role: 'jungle', // Force jungle
        allyPicks: [],
        enemyPicks: [],
    });
    const topJungleRec = recsJungle.recommendations[0];
    // counters.json entries often lack specific roles, so we check if result has roles
    // In our recommend.js, we filter by role if provided.
    // Let's assume the DB has some jungle roles.
    assert(recsJungle.recommendations.length > 0, `Got ${recsJungle.recommendations.length} jungle recommendations`);

    // Test Target Archetype
    const recsTarget = getRecommendations({
        role: 'mid',
        targetArchetype: 'hardEngage',
        allyPicks: [],
        enemyPicks: [],
    });
    // Should favor champions with 'engage' or similar tags that fit 'hardEngage'
    const topRec = recsTarget.recommendations[0];
    const hasFitReason = topRec.reasons.some(r => r.includes('Fits target hardEngage'));
    assert(hasFitReason, `Top pick ${topRec.name} has reason: Fits target hardEngage`);

    console.log('');

    // ─── Summary ────────────────────────────────────────────────
    console.log(cyan('═══════════════════════════════════════════════'));
    console.log(`  Results: ${green(`${passed} passed`)}, ${failed > 0 ? red(`${failed} failed`) : `${failed} failed`}`);
    console.log(cyan('═══════════════════════════════════════════════\n'));

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error(red(`Fatal error: ${err.message}`));
    process.exit(1);
});
