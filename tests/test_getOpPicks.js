const assert = require('assert');
const path = require('path');
const Module = require('module');

// Mock 'champions.js' before 'recommend.js' is loaded
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
    if (request === '../data/champions') {
        return {
            getIdToNameMap: () => ({
                1: 'Aatrox',
                2: 'Ahri',
                3: 'Akali',
                4: 'Alistar',
                5: 'Amumu',
                6: 'Garen',
                7: 'Miss Fortune',
                8: 'Sett'
            }),
            getNameToIdMap: () => ({
                'Aatrox': 1,
                'Ahri': 2,
                'Akali': 3,
                'Alistar': 4,
                'Amumu': 5,
                'Garen': 6,
                'Miss Fortune': 7,
                'Sett': 8
            }),
            getChampionTags: () => []
        };
    }
    return originalRequire.apply(this, arguments);
};

const { getOpPicks, initializeEngine } = require('../src/engine/recommend');
const winRateProvider = require('../src/data/winRateProvider');

function runTest(name, fn) {
    try {
        console.log(`Running test: ${name}`);
        fn();
        console.log(`✅ PASS: ${name}`);
    } catch (e) {
        console.error(`❌ FAIL: ${name}`);
        console.error(e);
        process.exit(1);
    }
}

function setup() {
    initializeEngine({
        idToName: {
            1: 'Aatrox',
            2: 'Ahri',
            3: 'Akali',
            4: 'Alistar',
            5: 'Amumu',
            6: 'Garen',
            7: 'Miss Fortune',
            8: 'Sett'
        },
        nameToId: {
            'Aatrox': 1,
            'Ahri': 2,
            'Akali': 3,
            'Alistar': 4,
            'Amumu': 5,
            'Garen': 6,
            'Miss Fortune': 7,
            'Sett': 8
        },
        countersDB: {}
    });

    winRateProvider.loadWinRates({
        soloq: {
            top: {
                Aatrox: { winRate: 0.53, matches: 200, pickRate: 0.1, tier: 'S+' },
                Garen: { winRate: 0.54, matches: 300, pickRate: 0.15, tier: 'S+' }, // Higher score than Aatrox
                Sett: { winRate: 0.51, matches: 200, pickRate: 0.05, tier: 'A' } // Test duplicate (OP in mid)
            },
            mid: {
                Ahri: { winRate: 0.51, matches: 150, pickRate: 0.05, tier: 'A' }, // Not OP
                Akali: { winRate: 0.526, matches: 120, pickRate: 0.08, tier: 'B' }, // OP by winrate/matches
                Sett: { winRate: 0.55, matches: 150, pickRate: 0.08, tier: 'S+' } // OP here
            },
            support: {
                Alistar: { winRate: 0.49, matches: 50, pickRate: 0.02, tier: 'C' } // Not OP
            },
            jungle: {
                Amumu: { winRate: 0.54, matches: 80, pickRate: 0.04, tier: 'S' } // OP by tier (matches don't matter for tier S)
            },
            adc: {
                'Miss Fortune': { winRate: 0.53, matches: 50, pickRate: 0.05, tier: 'A' } // Winrate >52.5% but matches < 100, so not OP
            }
        },
        flex: {
            top: {
                Garen: { winRate: 0.55, matches: 150, pickRate: 0.1, tier: 'S+' } // OP in flex
            },
            mid: {
                Ahri: { winRate: 0.48, matches: 100, pickRate: 0.05, tier: 'C' } // Not OP
            }
        }
    });
}

try {
    setup();

    runTest('getOpPicks (soloq) Inclusion & Exclusion Criteria', () => {
        const ops = getOpPicks('soloq');
        const names = ops.map(o => o.name);

        // High Tier (S or S+)
        assert(names.includes('Aatrox'), 'Aatrox should be in OP picks (S+)');
        assert(names.includes('Garen'), 'Garen should be in OP picks (S+)');
        assert(names.includes('Amumu'), 'Amumu should be in OP picks (S with low matches)');

        // High Winrate and Matches (>52.5% and >100)
        assert(names.includes('Akali'), 'Akali should be in OP picks (B tier but 52.6% WR and 120 matches)');

        // Not OP (Fail Criteria)
        assert(!names.includes('Ahri'), 'Ahri should NOT be in OP picks (A tier, <52.5% WR)');
        assert(!names.includes('Alistar'), 'Alistar should NOT be in OP picks (C tier, low WR)');
        assert(!names.includes('Miss Fortune'), 'Miss Fortune should NOT be in OP picks (>52.5% WR but <100 matches)');
    });

    runTest('getOpPicks Sorting logic', () => {
        const ops = getOpPicks('soloq');
        const names = ops.map(o => o.name);

        // Score Calculation:
        // Garen (top): 0.54 * 100 + 0.15 * 10 + 5 = 54 + 1.5 + 5 = 60.5
        // Sett (mid): 0.55 * 100 + 0.08 * 10 + 5 = 55 + 0.8 + 5 = 60.8
        // Aatrox (top): 0.53 * 100 + 0.1 * 10 + 5 = 53 + 1 + 5 = 59.0
        // Amumu (jg): 0.54 * 100 + 0.04 * 10 + 5 = 54 + 0.4 + 5 = 59.4
        // Akali (mid): 0.526 * 100 + 0.08 * 10 + 0 = 52.6 + 0.8 = 53.4

        // Expected Order: Sett, Garen, Amumu, Aatrox, Akali
        assert.deepStrictEqual(names, ['Sett', 'Garen', 'Amumu', 'Aatrox', 'Akali']);
    });

    runTest('getOpPicks Duplicate Filtering', () => {
        const ops = getOpPicks('soloq');

        // Sett exists in Top and Mid.
        // Top Sett: A tier (no +5 bonus), WR 0.51 * 100 + 0.05 * 10 = 51 + 0.5 = 51.5 (Not OP anyway, tier A and <52.5 WR)
        // Mid Sett: S+ tier (+5 bonus), WR 0.55 * 100 + 0.08 * 10 = 55 + 0.8 + 5 = 60.8 (OP)

        const settEntries = ops.filter(o => o.name === 'Sett');
        assert.strictEqual(settEntries.length, 1, 'Sett should only appear once in OP picks');
        assert.strictEqual(settEntries[0].role, 'mid', 'Sett best role should be preserved');
    });

    runTest('getOpPicks Queue Filtering', () => {
        const flexOps = getOpPicks('flex');
        const flexNames = flexOps.map(o => o.name);

        assert(flexNames.includes('Garen'), 'Garen should be OP in flex');
        assert(!flexNames.includes('Ahri'), 'Ahri should not be OP in flex');
        assert(!flexNames.includes('Aatrox'), 'Aatrox should not be OP in flex (no data for flex)');
        assert.strictEqual(flexNames.length, 1, 'Only Garen should be OP in flex');
    });

} finally {
    Module.prototype.require = originalRequire; // Restore original require
}

console.log('All tests passed successfully!');
