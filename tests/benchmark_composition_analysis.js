const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function() {
    if (arguments[0] === 'axios') {
        return {
            get: () => Promise.resolve({ data: {} })
        };
    }
    return originalRequire.apply(this, arguments);
};

// Force clear cache so we can re-require it safely
delete require.cache[require.resolve('../src/engine/recommend.js')];
delete require.cache[require.resolve('../src/data/champions.js')];

const { getCompositionAnalysis } = require('../src/engine/recommend.js');

const teamRoles = {
    top: "Darius",
    jungle: "Lee Sin",
    mid: "Ahri",
    adc: "Ashe",
    support: "Thresh"
};

const iterations = 10000;
const start = performance.now();
for (let i = 0; i < iterations; i++) {
    getCompositionAnalysis(teamRoles);
}
const end = performance.now();

console.log(`Time taken for ${iterations} iterations: ${(end - start).toFixed(2)}ms`);
