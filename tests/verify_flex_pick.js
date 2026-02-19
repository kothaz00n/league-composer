const { getRecommendations, initializeEngine } = require('../src/engine/recommend');

// Mock Data
const mockIdToName = {
    1: 'Annie',
    2: 'Olaf',
    3: 'Galio',
    4: 'Twisted Fate',
    79: 'Gragas'
};

const mockNameToId = {
    'Annie': 1,
    'Olaf': 2,
    'Galio': 3,
    'Twisted Fate': 4,
    'Gragas': 79
};

const mockTags = {
    'Annie': ['Mage'],
    'Olaf': ['Fighter'],
    'Galio': ['Tank', 'Mage'],
    'Gragas': ['Fighter', 'Mage']
};

// Mock other modules
const championsMock = {
    getIdToNameMap: () => mockIdToName,
    getNameToIdMap: () => mockNameToId,
    getChampionTags: (name) => mockTags[name] || [],
};

const winRateMock = {
    getChampionStats: (name) => ({ winRate: 0.50, pickRate: 0.10, tier: 'A' }),
};

// We need to inject these mocks into recommend.js or assume recommend.js uses require() which we can't easily intercept here without a test runner.
// However, recommend.js exports initializeEngine which accepts some of these.
// Let's modify recommend.js to allow injecting getChampionStats if it doesn't already?
// Actually recommend.js imports them directly. 
// For this environment, I'll rely on the actual files if possible, or I can try to use proxyquire if I had it.
// Since I don't have proxyquire, I will try to run it with the actual files, assuming they handle missing data gracefully or I can initialize them.

// Let's look at recommend.js again.
// It uses:
// const { loadChampionData, ... } = require('../data/champions');
// const { ... getChampionStats ... } = require('../data/winRateProvider');

// If I run this script using node, it will require those real files.
// `champions.js` needs simplified-champions.json.
// `winRateProvider.js` needs winrates.json.

// I'll try to initialize the engine with the data it expects via `initializeEngine`.
// But `getChampionStats` is imported directly.

// workaround: I will overwrite the methods on the require cache if needed, but that's messy.
// Alternative: Creates a tiny test harness that loads the real recommend.js.

async function runTest() {
    console.log('--- Starting Flex Pick Verification ---');

    // Initialize Engine with our mock maps
    initializeEngine({
        idToName: mockIdToName,
        nameToId: mockNameToId,
        tagsMap: mockTags,
        countersDB: {
            'Gragas': { winRate: 0.51, roles: ['top', 'jungle', 'mid', 'support'] },
            'Olaf': { winRate: 0.50, roles: ['jungle', 'top'] }
        }
    });

    // We need to Monkey-patch the imported functions in recommend.js? 
    // No, `initializeEngine` sets module-level variables for idToName, etc.
    // BUT `getChampionStats` is imported. 
    // Let's assume the real `winRateProvider` works if we don't load data (returns defaults).

    // Define a custom archetype with a Flex Pick
    // Gragas is set as 'top' but marked with '*' -> 'top': 'Gragas*'
    const customArchetypeDef = {
        name: 'Gragas Flex Strat',
        typical_comp: {
            top: 'Gragas*',
            jungle: 'Olaf',
            mid: 'Twisted Fate',
            adc: 'Ezreal',
            support: 'Braum'
        }
    };

    // Case 1: Early Draft (Ally picks = 0). Gragas should have FLEX PRIORITY.
    console.log('\nTest Case 1: Early Draft (0 picks)');
    const result1 = getRecommendations({
        role: 'top',
        allyPicks: [],
        enemyPicks: [],
        bannedChampions: [],
        targetArchetype: 'Gragas Flex Strat',
        targetArchetypeDef: customArchetypeDef,
        allies: [],
    });

    const gragasRec1 = result1.recommendations.find(r => r.name === 'Gragas');
    if (gragasRec1) {
        console.log('Gragas Score:', gragasRec1.score);
        console.log('Gragas Details:', gragasRec1.details);

        const hasPlanned = gragasRec1.details.includes('Planned Pick');
        const hasFlex = gragasRec1.details.includes('★ FLEX PRIORITY');

        if (hasPlanned && hasFlex) {
            console.log('✅ PASS: Gragas identified as Planned Pick AND Flex Priority.');
        } else {
            console.log('❌ FAIL: Missing bonuses. Planned:', hasPlanned, 'Flex:', hasFlex);
        }
    } else {
        console.log('❌ FAIL: Gragas not recommended.');
    }

    // Case 2: Late Draft (Ally picks = 3). Gragas should NOT have FLEX PRIORITY (only Planned Pick).
    console.log('\nTest Case 2: Late Draft (3 picks)');
    const result2 = getRecommendations({
        role: 'top',
        allyPicks: [2, 4, 3], // Olaf, TF, Galio
        enemyPicks: [],
        bannedChampions: [],
        targetArchetype: 'Gragas Flex Strat',
        targetArchetypeDef: customArchetypeDef,
        allies: [],
    });

    const gragasRec2 = result2.recommendations.find(r => r.name === 'Gragas');
    if (gragasRec2) {
        console.log('Gragas Score:', gragasRec2.score);
        console.log('Gragas Details:', gragasRec2.details);

        const hasPlanned = gragasRec2.details.includes('Planned Pick');
        const hasFlex = gragasRec2.details.includes('★ FLEX PRIORITY');

        if (hasPlanned && !hasFlex) {
            console.log('✅ PASS: Gragas has Planned Pick but NO Flex Priority (Correct for late draft).');
        } else {
            console.log('❌ FAIL: Incorrect bonuses. Planned:', hasPlanned, 'Flex:', hasFlex);
        }
    } else {
        console.log('❌ FAIL: Gragas not recommended.');
    }
}

try {
    runTest();
} catch (e) {
    console.error('Test Failed:', e);
}
