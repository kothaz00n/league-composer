const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    if (id === 'axios') {
        return { get: () => Promise.resolve({ data: {} }) };
    }
    return originalRequire.apply(this, arguments);
};

const { getCompositionAnalysis, initializeEngine } = require('../src/engine/recommend.js');
const ch = require('../src/data/champions.js');
const wp = require('../src/data/winRateProvider.js');

// Mock data
const mockIdToName = {};
const mockNameToId = {};
for (let i = 1; i <= 160; i++) {
    mockIdToName[i] = `Champ${i}`;
    mockNameToId[`Champ${i}`] = i;
}

initializeEngine({
    idToName: mockIdToName,
    nameToId: mockNameToId,
    countersDB: {}
});

wp.getChampionStats = (name, role, queue) => ({
    winRate: 0.48, // Less than 0.52 to trigger substitution
    matches: 100,
    hasData: true
});

ch.getChampionTags = (name) => ['Mage'];
ch.getIdToNameMap = () => mockIdToName;

const teamRoles = {
    top: 'Champ1',
    jungle: 'Champ2',
    mid: 'Champ3',
    adc: 'Champ4',
    support: 'Champ5'
};

const iterations = 50000;
const start = process.hrtime.bigint();
for (let i = 0; i < iterations; i++) {
    getCompositionAnalysis(teamRoles);
}
const end = process.hrtime.bigint();

console.log(`Execution time: ${Number(end - start) / 1e6} ms`);
