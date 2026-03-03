const assert = require('assert');
const path = require('path');
const Module = require('module');

const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
    if (request === 'axios') {
        return {
            get: async (url) => {
                if (url.endsWith('versions.json')) {
                    return { data: ['14.3.1'] };
                }
                if (url.endsWith('champion.json')) {
                    return {
                        data: {
                            data: {
                                "Aatrox": {
                                    key: "266",
                                    tags: ["Fighter", "Tank"]
                                },
                                "Ahri": {
                                    key: "103",
                                    tags: ["Mage", "Assassin"]
                                },
                                "NoTags": {
                                    key: "999"
                                    // Missing tags intentionally
                                }
                            }
                        }
                    };
                }
                throw new Error('Not mocked');
            }
        };
    }
    return originalRequire.apply(this, arguments);
};

const champions = require('../src/data/champions.js');

async function runTests() {
    console.log('Testing getChampionTags...');

    // 1. Data not loaded yet
    console.log('  Running test: Data not loaded');
    assert.deepStrictEqual(champions.getChampionTags('Aatrox'), [], 'Should return empty array before load');
    assert.deepStrictEqual(champions.getChampionTags(266), [], 'Should return empty array before load');

    // Load mock data
    await champions.loadChampionData();

    // 2. By Name
    console.log('  Running test: By Name');
    assert.deepStrictEqual(champions.getChampionTags('Aatrox'), ['Fighter', 'Tank'], 'Aatrox tags mismatch');
    assert.deepStrictEqual(champions.getChampionTags('Ahri'), ['Mage', 'Assassin'], 'Ahri tags mismatch');

    // 3. By ID
    console.log('  Running test: By ID');
    assert.deepStrictEqual(champions.getChampionTags(266), ['Fighter', 'Tank'], 'Aatrox (266) tags mismatch');
    assert.deepStrictEqual(champions.getChampionTags(103), ['Mage', 'Assassin'], 'Ahri (103) tags mismatch');

    // 4. No Tags Champion
    console.log('  Running test: No Tags Champion');
    assert.deepStrictEqual(champions.getChampionTags('NoTags'), [], 'NoTags tags mismatch');
    assert.deepStrictEqual(champions.getChampionTags(999), [], 'NoTags (999) tags mismatch');

    // 5. Unknown Champion
    console.log('  Running test: Unknown Champion');
    assert.deepStrictEqual(champions.getChampionTags('Unknown'), [], 'Unknown tags mismatch');
    assert.deepStrictEqual(champions.getChampionTags(1234), [], 'Unknown (1234) tags mismatch');

    // 6. Invalid inputs
    console.log('  Running test: Invalid inputs');
    assert.deepStrictEqual(champions.getChampionTags(null), [], 'null input should return []');
    assert.deepStrictEqual(champions.getChampionTags(undefined), [], 'undefined input should return []');
    assert.deepStrictEqual(champions.getChampionTags({}), [], 'Object input should return []');

    console.log('All tests passed successfully!');
}

runTests().catch(e => {
    console.error('Test Failed:', e.message);
    process.exit(1);
});
