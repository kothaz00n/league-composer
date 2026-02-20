const assert = require('assert');
const { loadWinRates, getWinRate, getChampionStats, getAllWinRates, getImportedChampions, getAvailableQueues } = require('../src/data/winRateProvider');

console.log('--- Verifying winRateProvider.js ---');

// 1. Initial State
console.log('1. Checking initial state...');
const initialAll = getAllWinRates();
assert.deepStrictEqual(initialAll.queueData, {}, 'Initial queueData should be empty');
assert.strictEqual(initialAll.dataSource, 'static', 'Initial dataSource should be static');
console.log('✅ Initial state correct.');

// 2. Load "New Format" Data (Queue-based)
console.log('\n2. Loading queue-based data...');
const mockQueueData = {
    soloq: {
        top: {
            'Aatrox': { winRate: 0.55, matches: 100 }
        }
    },
    flex: {
        mid: {
            'Ahri': { winRate: 0.60, matches: 50 }
        }
    }
};

loadWinRates(mockQueueData);

const afterLoad = getAllWinRates();
assert.strictEqual(afterLoad.dataSource, 'imported', 'DataSource should be imported');
assert.deepStrictEqual(afterLoad.queueData, mockQueueData, 'QueueData should match loaded data');

// Test getWinRate
const wrAatrox = getWinRate('Aatrox', 'top', 'soloq');
assert.strictEqual(wrAatrox, 0.55, 'Aatrox winrate should be 0.55');

const wrAhri = getWinRate('Ahri', 'mid', 'flex');
assert.strictEqual(wrAhri, 0.60, 'Ahri winrate should be 0.60');

const wrMissing = getWinRate('Zed', 'mid', 'soloq');
assert.strictEqual(wrMissing, 0, 'Missing champion winrate should be 0');

console.log('✅ Queue-based data loading and retrieval correct.');

// 3. Load "Legacy Format" (Role-based) - Optional check if we want to support migration
console.log('\n3. Loading legacy role-based data...');
const mockLegacyData = {
    top: {
        'Garen': { winRate: 0.52, matches: 200 }
    }
};

loadWinRates(mockLegacyData);
const legacyCheck = getAllWinRates();
// Expect migration to soloq
assert.strictEqual(legacyCheck.dataSource, 'imported', 'DataSource should be imported');
assert.ok(legacyCheck.queueData.soloq, 'Should have migrated to soloq');
assert.deepStrictEqual(legacyCheck.queueData.soloq.top, mockLegacyData.top, 'Data should be in soloq.top');

const wrGaren = getWinRate('Garen', 'top', 'soloq');
assert.strictEqual(wrGaren, 0.52, 'Garen winrate should be 0.52');

console.log('✅ Legacy data migration correct.');


// 4. Test "Flat Format" (Old Static) - This is what we are removing support for, or checking behavior
console.log('\n4. Testing flat format (expecting it to NOT populate STATIC_WIN_RATES anymore or handle gracefully)...');
// If we remove the logic, this might result in empty queueData or similar.
const mockFlatData = {
    'Annie': 0.54
};

loadWinRates(mockFlatData);
const flatCheck = getAllWinRates();
// Current behavior (before fix): populates STATIC_WIN_RATES, sets dataSource='static'
// After fix: should probably do nothing or log warning, and queueData should be empty?
// Or if we remove the branch, it will fall to the 'else' (empty).

console.log('DataSource after flat load:', flatCheck.dataSource);
// If we remove the support, dataSource should be 'static' and queueData empty.
if (flatCheck.dataSource === 'static') {
     console.log('✅ DataSource is static (as expected if flat format is unsupported/ignored).');
} else {
     console.log('⚠️ DataSource is', flatCheck.dataSource);
}

console.log('\n--- Verification Complete ---');
