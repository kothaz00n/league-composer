const assert = require('assert');
const path = require('path');
const winRateProvider = require(path.join(__dirname, '../src/data/winRateProvider.js'));

function runTest(name, fn) {
    try {
        console.log(`Running test: ${name}`);
        fn();
        console.log(`PASS: ${name}`);
    } catch (e) {
        console.error(`FAIL: ${name}`);
        console.error(e);
        process.exit(1);
    }
}

// Test Case 1: Initial State / Empty Data
runTest('Initial State / Empty Data', () => {
    // Reset state first just in case
    winRateProvider.loadWinRates(null);

    // Should start empty/static
    const ds = winRateProvider.getDataSource();
    assert.strictEqual(ds, 'static', 'Initial dataSource should be static');
    const queues = winRateProvider.getAvailableQueues();
    assert.strictEqual(queues.length, 0, 'Initial queues should be empty');

    // Test explicitly loading empty object
    winRateProvider.loadWinRates({});
    assert.strictEqual(winRateProvider.getDataSource(), 'static', 'DataSource should be "static" for empty input');
    assert.strictEqual(winRateProvider.getAvailableQueues().length, 0, 'Should have no imported queues');
});

// Test Case 2: Legacy Format Migration
runTest('Legacy Format Migration (Roles -> SoloQ)', () => {
    // Input: Object with roles as keys
    const legacyData = {
        top: {
            Garen: { winRate: 0.52, matches: 1000 }
        },
        mid: {
            Ahri: { winRate: 0.50, matches: 800 }
        }
    };

    winRateProvider.loadWinRates(legacyData);

    // Verify dataSource
    assert.strictEqual(winRateProvider.getDataSource(), 'imported', 'DataSource should be "imported"');

    // Verify queue availability (legacy migrates to soloq)
    const queues = winRateProvider.getAvailableQueues();
    assert.ok(queues.includes('soloq'), 'Should include "soloq" queue');
    assert.strictEqual(queues.length, 1, 'Should only have "soloq" queue');

    // Verify data access
    const garenStats = winRateProvider.getChampionStats('Garen', 'top', 'soloq');
    assert.strictEqual(garenStats.winRate, 0.52, 'Garen winRate mismatch');
    assert.strictEqual(garenStats.matches, 1000, 'Garen matches mismatch');

    const ahriStats = winRateProvider.getChampionStats('Ahri', 'mid', 'soloq');
    assert.strictEqual(ahriStats.winRate, 0.50, 'Ahri winRate mismatch');
});

// Test Case 3: New Format (Queues -> Roles)
runTest('New Format (Queues -> Roles)', () => {
    const newData = {
        soloq: {
            top: { Darius: { winRate: 0.51, matches: 500 } }
        },
        flex: {
            adc: { Jinx: { winRate: 0.49, matches: 600 } }
        }
    };

    winRateProvider.loadWinRates(newData);

    // Verify dataSource
    assert.strictEqual(winRateProvider.getDataSource(), 'imported', 'DataSource should be "imported"');

    // Verify queues
    const queues = winRateProvider.getAvailableQueues();
    assert.ok(queues.includes('soloq'), 'Should include "soloq"');
    assert.ok(queues.includes('flex'), 'Should include "flex"');

    // Verify data access
    const dariusStats = winRateProvider.getChampionStats('Darius', 'top', 'soloq');
    assert.strictEqual(dariusStats.winRate, 0.51, 'Darius winRate mismatch');

    const jinxStats = winRateProvider.getChampionStats('Jinx', 'adc', 'flex');
    assert.strictEqual(jinxStats.winRate, 0.49, 'Jinx winRate mismatch');

    // Verify missing data
    const missing = winRateProvider.getWinRate('NonExistent', 'mid', 'flex');
    assert.strictEqual(missing, 0, 'Missing data should return 0 winrate');
});

// Test Case 4: Flat Format
runTest('Flat Format (Static Override)', () => {
    const flatData = {
        Aatrox: 0.55,
        Ahri: { winRate: 0.52 }
    };
    winRateProvider.loadWinRates(flatData);

    assert.strictEqual(winRateProvider.getDataSource(), 'static', 'Flat format should result in static source');
    // Verify retrieval behavior - current implementation returns 0 for static if dataSource is static but requesting specific role?
    // Actually static data is stored in STATIC_WIN_RATES but getWinRate only checks imported queueData if dataSource is imported.
    // So getWinRate returns 0.
    assert.strictEqual(winRateProvider.getWinRate('Aatrox', 'top', 'soloq'), 0, 'Static data should not be accessible via queue retrieval');
});

// Test Case 5: Get Imported Champions
runTest('Get Imported Champions', () => {
    const queueData = {
        soloq: {
            top: { Aatrox: {}, Darius: {} },
            mid: { Ahri: {} }
        }
    };
    winRateProvider.loadWinRates(queueData);

    const topChamps = winRateProvider.getImportedChampions('soloq', 'top');
    assert.strictEqual(topChamps.length, 2, 'Should find 2 top champs');
    assert.ok(topChamps.includes('Aatrox'));
    assert.ok(topChamps.includes('Darius'));

    const midChamps = winRateProvider.getImportedChampions('soloq', 'mid');
    assert.strictEqual(midChamps.length, 1, 'Should find 1 mid champ');
    assert.ok(midChamps.includes('Ahri'));

    const allChamps = winRateProvider.getImportedChampions('soloq');
    assert.strictEqual(allChamps.length, 3, 'Should find 3 total champs');
});

console.log('All tests passed successfully!');
