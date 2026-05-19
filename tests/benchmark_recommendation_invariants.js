require('./mock_axios');
const { getRecommendations, initializeEngine } = require('../src/engine/recommend');

// Create mock data
const idToName = {};
const nameToId = {};
const countersDB = {};

// 160 champions
for (let i = 1; i <= 160; i++) {
    const name = `Champ${i}`;
    idToName[i] = name;
    nameToId[name] = i;
    countersDB[name] = {
        roles: i % 2 === 0 ? ['top', 'mid'] : ['jungle', 'adc', 'support'],
        counters: {},
        synergies: {}
    };
}

initializeEngine({ idToName, nameToId, countersDB });

const targetArchetypeDef = {
    champion_pool: {
        top: ['Champ1', 'Champ2', 'Champ3'],
        jungle: ['Champ4', 'Champ5'],
        mid: ['Champ6', 'Champ7'],
        adc: ['Champ8', 'Champ9'],
        support: ['Champ10']
    }
};

const rosterConfig = {
    roster: {
        top: { favorites: ['Champ1'] },
        jungle: { favorites: ['Champ4'] },
        mid: { favorites: ['Champ6'] }
    },
    gameMode: 'flex',
    myRole: 'top'
};

const allies = [
    { role: 'jungle', championId: 0 },
    { role: 'mid', championId: 0 }
];

console.time('Baseline (10000x)');
for (let i = 0; i < 10000; i++) {
    getRecommendations({
        role: 'top',
        allyPicks: [4, 6],
        enemyPicks: [2, 8],
        targetArchetypeDef,
        rosterConfig,
        allies
    });
}
console.timeEnd('Baseline (10000x)');
