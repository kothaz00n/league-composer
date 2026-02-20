const assert = require('assert');
const winRateProvider = require('../src/data/winRateProvider.js');

function testInitialState() {
    console.log('Testing Initial State...');
    // Should start empty/static
    const ds = winRateProvider.getDataSource();
    assert.strictEqual(ds, 'static', 'Initial dataSource should be static');
    const queues = winRateProvider.getAvailableQueues();
    assert.strictEqual(queues.length, 0, 'Initial queues should be empty');
}

function testLoadLegacyFormat() {
    console.log('Testing Legacy Format...');
    // Reset state
    winRateProvider.loadWinRates(null);

    const legacyData = {
        top: {
            Aatrox: { winRate: 0.55, matches: 100 }
        }
    };
    winRateProvider.loadWinRates(legacyData);

    assert.strictEqual(winRateProvider.getDataSource(), 'imported', 'Should be imported');
    assert.strictEqual(winRateProvider.getAvailableQueues().length, 1, 'Should have 1 queue');
    assert.strictEqual(winRateProvider.getAvailableQueues()[0], 'soloq', 'Queue should be soloq');

    const wr = winRateProvider.getWinRate('Aatrox', 'top', 'soloq');
    assert.strictEqual(wr, 0.55, 'Should return correct winRate');

    const stats = winRateProvider.getChampionStats('Aatrox', 'top', 'soloq');
    assert.strictEqual(stats.winRate, 0.55);
    assert.strictEqual(stats.matches, 100);
    assert.strictEqual(stats.hasData, true);
}

function testLoadQueueFormat() {
    console.log('Testing Queue Format...');
    // Reset state
    winRateProvider.loadWinRates(null);

    const queueData = {
        soloq: {
            top: { Aatrox: { winRate: 0.60, matches: 200 } }
        },
        flex: {
            mid: { Ahri: { winRate: 0.52, matches: 150 } }
        }
    };
    winRateProvider.loadWinRates(queueData);

    assert.strictEqual(winRateProvider.getDataSource(), 'imported');
    assert.strictEqual(winRateProvider.getAvailableQueues().length, 2);
    assert(winRateProvider.getAvailableQueues().includes('soloq'));
    assert(winRateProvider.getAvailableQueues().includes('flex'));

    // Test soloq retrieval
    assert.strictEqual(winRateProvider.getWinRate('Aatrox', 'top', 'soloq'), 0.60);

    // Test flex retrieval
    assert.strictEqual(winRateProvider.getWinRate('Ahri', 'mid', 'flex'), 0.52);

    // Test missing role/champ
    assert.strictEqual(winRateProvider.getWinRate('NonExistent', 'mid', 'flex'), 0);
}

function testLoadFlatFormat() {
    console.log('Testing Flat Format...');
    // Reset state
    winRateProvider.loadWinRates(null);

    const flatData = {
        Aatrox: 0.55,
        Ahri: { winRate: 0.52 }
    };
    winRateProvider.loadWinRates(flatData);

    assert.strictEqual(winRateProvider.getDataSource(), 'static');
    // Verify static data is ignored for retrieval as per current implementation
    // (Note: This confirms current behavior, even if it might be considered a bug or feature)
    assert.strictEqual(winRateProvider.getWinRate('Aatrox', 'top', 'soloq'), 0);
}

function testGetImportedChampions() {
    console.log('Testing getImportedChampions...');
    // Reset state
    winRateProvider.loadWinRates(null);

    const queueData = {
        soloq: {
            top: { Aatrox: {}, Darius: {} },
            mid: { Ahri: {} }
        }
    };
    winRateProvider.loadWinRates(queueData);

    const topChamps = winRateProvider.getImportedChampions('soloq', 'top');
    assert.strictEqual(topChamps.length, 2);
    assert(topChamps.includes('Aatrox'));
    assert(topChamps.includes('Darius'));

    const midChamps = winRateProvider.getImportedChampions('soloq', 'mid');
    assert.strictEqual(midChamps.length, 1);
    assert(midChamps.includes('Ahri'));

    const allChamps = winRateProvider.getImportedChampions('soloq');
    // Aatrox, Darius, Ahri
    assert.strictEqual(allChamps.length, 3);
}

function runTests() {
    try {
        testInitialState();
        testLoadLegacyFormat();
        testLoadQueueFormat();
        testLoadFlatFormat();
        testGetImportedChampions();

        console.log('All tests passed!');
    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}

runTests();
