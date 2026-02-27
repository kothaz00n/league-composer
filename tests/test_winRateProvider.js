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

// Test Case 1: Legacy Format Migration
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

// Test Case 2: New Format (Queues -> Roles)
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
});

// Test Case 3: Empty/Static Fallback (sanity check)
runTest('Empty Data / Static Fallback', () => {
    winRateProvider.loadWinRates({});

    // Should revert to static
    assert.strictEqual(winRateProvider.getDataSource(), 'static', 'DataSource should be "static" for empty input');

    // Verify no queues listed as imported
    const queues = winRateProvider.getAvailableQueues();
    assert.strictEqual(queues.length, 0, 'Should have no imported queues');
});

console.log('All tests passed successfully!');
