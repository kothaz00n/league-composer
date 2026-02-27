const assert = require('assert');
const { analyzeTeamComposition, initializeEngine } = require('../src/engine/recommend');
const winRateProvider = require('../src/data/winRateProvider');
const champions = require('../src/data/champions');

function check(result, expected, msg) {
    try {
        assert.deepStrictEqual(JSON.parse(JSON.stringify(result)), expected);
        console.log(`✅ ${msg} passed`);
    } catch (e) {
        console.error(`❌ ${msg} failed`);
        console.error('Expected:', expected);
        console.error('Actual:', result);
        throw e;
    }
}

function testAnalyzeTeamComposition() {
    console.log('Testing analyzeTeamComposition...');

    // 1. Mock Data Setup
    const mockIdToName = {
        1: 'Annie', // Mage -> poke, teamfight
        2: 'Olaf',  // Fighter -> dive, bruiser
        3: 'Galio', // Tank, Mage -> engage, frontline, poke, teamfight
        4: 'Leona', // Tank, Support -> engage, frontline, protect, anti-engage
        5: 'Jinx',  // Marksman -> hypercarry, dps
        6: 'UnknownChamp'
    };

    const mockNameToId = {
        'Annie': 1,
        'Olaf': 2,
        'Galio': 3,
        'Leona': 4,
        'Jinx': 5,
        'UnknownChamp': 6
    };

    const mockTags = {
        'Annie': ['Mage'],
        'Olaf': ['Fighter'],
        'Galio': ['Tank', 'Mage'],
        'Leona': ['Tank', 'Support'],
        'Jinx': ['Marksman'],
        'UnknownChamp': []
    };

    // 2. Mock winRateProvider.getChampionStats
    const originalGetChampionStats = winRateProvider.getChampionStats;
    winRateProvider.getChampionStats = (name) => {
        // Return a mock winRate. For Galio, return a slightly higher winRate just to see if it affects anything (it affects tier).
        if (name === 'Galio') return { winRate: 0.55 };
        return { winRate: 0.50 };
    };

    // 3. Mock champions.getChampionTags by overriding require cache globally or initializeEngine
    // Wait, recommend.js imports `getChampionTags` directly. We can't mock it reliably via `champions` object if it's destructured.
    // However, we can mock it by passing `tagsMap` in a mocked `champions.js` via `require.cache`.
    // Actually, recommend.js doesn't use `tagsMap` from `initializeEngine`, it calls `getChampionTags(cleanName(name))`.
    // Let's modify the test to mock `champions.js` directly in the require cache.
    require.cache[require.resolve('../src/data/champions')] = {
        exports: {
            getChampionTags: (name) => mockTags[name] || [],
            getIdToNameMap: () => mockIdToName,
            getNameToIdMap: () => mockNameToId,
            getChampionName: (id) => mockIdToName[id],
            getChampionId: (name) => mockNameToId[name],
            loadChampionData: async () => {},
        }
    };

    // Re-require recommend.js so it uses our mocked champions
    delete require.cache[require.resolve('../src/engine/recommend')];
    const { analyzeTeamComposition: freshAnalyzeTeamComposition, initializeEngine: freshInitializeEngine } = require('../src/engine/recommend');

    // 4. Initialize Engine
    freshInitializeEngine({
        idToName: mockIdToName,
        nameToId: mockNameToId,
        tagsMap: mockTags,
    });

    try {
        // Test Case 1: Empty Input
        // No ally picks should result in 'unknown' archetype and 'D' tier
        const emptyResult = freshAnalyzeTeamComposition([]);
        check(emptyResult, {
            archetype: 'unknown',
            name: 'Unknown',
            icon: '❓',
            desc: 'Not enough data',
            confidence: 0,
            tier: 'D',
            championCount: 0
        }, 'Empty input returns unknown archetype');

        // Test Case 2: Invalid IDs / IDs not in map
        // 999 is not in mockIdToName, so it should be filtered out
        const invalidResult = freshAnalyzeTeamComposition([999]);
        check(invalidResult, {
            archetype: 'unknown',
            name: 'Unknown',
            icon: '❓',
            desc: 'Not enough data',
            confidence: 0,
            tier: 'D',
            championCount: 0
        }, 'Invalid ID is ignored');

        // Test Case 3: Mixed Composition (No strong archetype)
        // Annie (poke, teamfight) and Olaf (dive, bruiser)
        // dive requires ['dive'], bonus ['pick', 'bruiser']. Olaf provides 'dive' (3) and 'bruiser' (1) = 4 confidence.
        // It actually matches dive archetype. We'll verify it returns 'dive'.
        const diveResult = freshAnalyzeTeamComposition([1, 2]);
        check(diveResult, {
            archetype: 'dive',
            name: 'Dive / Pick',
            icon: '🗡️',
            desc: 'Aggressive comp that dives the backline',
            requiredRoles: [ 'dive' ],
            bonusRoles: [ 'pick', 'bruiser' ],
            confidence: 4,
            tier: 'B',
            championCount: 2
        }, 'Annie and Olaf result in Dive archetype');

        // Test Case 3b: True Mixed Composition
        // UnknownChamp (no tags)
        const mixedResult = freshAnalyzeTeamComposition([6]);
        check(mixedResult, {
            archetype: 'mixed',
            name: 'Mixed',
            icon: '🔀',
            desc: 'A balanced but unfocused composition',
            confidence: 0,
            tier: 'C',
            championCount: 1
        }, 'No tags return mixed archetype');

        // Test Case 4: Hard Engage Composition
        // Leona (engage, frontline, protect, anti-engage) + Galio (engage, frontline, poke, teamfight)
        // hardEngage requires: ['engage', 'frontline'], bonus: ['teamfight', 'dps']
        // Leona gives 1 engage, 1 frontline
        // Galio gives 1 engage, 1 frontline, 1 teamfight
        // Score: (2 engage * 3) + (2 frontline * 3) + (1 teamfight * 1) = 6 + 6 + 1 = 13
        const hardEngageResult = freshAnalyzeTeamComposition([3, 4]);

        // Assertions for Hard Engage
        assert.strictEqual(hardEngageResult.archetype, 'hardEngage', 'Should be hardEngage archetype');
        assert.strictEqual(hardEngageResult.name, 'Hard Engage');
        assert.strictEqual(hardEngageResult.championCount, 2);
        assert.ok(hardEngageResult.confidence > 0, 'Confidence should be positive');
        console.log(`✅ Hard Engage archetype detected (Confidence: ${hardEngageResult.confidence}) passed`);

        // Test Case 5: Protect the Carry Composition
        // Leona (protect) + Jinx (hypercarry)
        // protect requires: ['protect', 'hypercarry'], bonus: ['anti-engage', 'frontline']
        const protectResult = freshAnalyzeTeamComposition([4, 5]);
        assert.strictEqual(protectResult.archetype, 'protect', 'Should be protect archetype');
        assert.strictEqual(protectResult.championCount, 2);
        console.log(`✅ Protect the Carry archetype detected (Confidence: ${protectResult.confidence}) passed`);

        // Test Case 6: Full Team - Mixed but valid
        const fullResult = freshAnalyzeTeamComposition([1, 2, 3, 4, 5]);
        assert.ok(fullResult.archetype !== 'unknown', 'Full team should not be unknown');
        assert.strictEqual(fullResult.championCount, 5, 'Champion count should be 5');
        console.log(`✅ Full team analyzed (Archetype: ${fullResult.archetype}, Tier: ${fullResult.tier}) passed`);

        console.log('All tests passed!');
    } finally {
        // Restore mocks
        winRateProvider.getChampionStats = originalGetChampionStats;
    }
}

try {
    testAnalyzeTeamComposition();
} catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
}
