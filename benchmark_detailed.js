const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
    if (request === 'axios') return { get: async () => ({ data: {} }) };
    return originalRequire.apply(this, arguments);
};

const { getRecommendations, initializeEngine } = require('./src/engine/recommend');
const fs = require('fs');

async function runBenchmark() {
    // Mock enough data to trigger the slow paths
    const idToName = {};
    const nameToId = {};
    for (let i = 1; i <= 165; i++) {
        idToName[i] = `Champ${i}`;
        nameToId[`Champ${i}`] = i;
    }

    const mockCountersDB = {};
    for (let i = 1; i <= 165; i++) {
        mockCountersDB[`Champ${i}`] = {
            roles: ['top', 'jungle', 'mid', 'adc', 'support'],
            synergies: {},
            counters: {}
        };
        for (let j = 1; j <= 10; j++) {
            mockCountersDB[`Champ${i}`].synergies[`Champ${j}`] = 0.55;
            mockCountersDB[`Champ${i}`].counters[`Champ${j}`] = 0.55;
        }
    }

    initializeEngine({ idToName, nameToId, countersDB: mockCountersDB });

    const targetArchetypeDef = {
        champion_pool: {
            top: ['Champ1', 'Champ2', 'Champ3', 'Champ4'],
            jungle: ['Champ5', 'Champ6', 'Champ7'],
            mid: ['Champ8', 'Champ9', 'Champ10'],
            adc: ['Champ11', 'Champ12', 'Champ13'],
            support: ['Champ14', 'Champ15', 'Champ16']
        }
    };

    const rosterConfig = {
        gameMode: 'flex',
        myRole: 'top',
        roster: {
            top: { favorites: ['Champ1'] },
            jungle: { favorites: ['Champ5'] },
            mid: { favorites: ['Champ8'] },
            adc: { favorites: ['Champ11'] },
            support: { favorites: ['Champ14'] }
        }
    };

    const allies = [
        { role: 'jungle', championId: 0 },
        { role: 'mid', championId: 0 },
        { role: 'adc', championId: 0 },
        { role: 'support', championId: 0 }
    ];

    const iterations = 10000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        getRecommendations({
            role: 'top',
            allyPicks: [5],
            enemyPicks: [8],
            bannedChampions: [14],
            targetArchetypeDef,
            rosterConfig,
            allies
        });
    }

    const end = performance.now();
    console.log(`Time for ${iterations} iterations: ${(end - start).toFixed(2)} ms`);
}

runBenchmark();
