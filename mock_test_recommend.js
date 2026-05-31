const assert = require('assert');
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(moduleName) {
    if (moduleName === 'axios') {
        return { get: async () => ({ data: { data: {} } }) };
    }
    return originalRequire.apply(this, arguments);
};

// Clear caches for a fresh start
try { delete require.cache[require.resolve('./src/data/champions.js')]; } catch(e){}
try { delete require.cache[require.resolve('./src/engine/recommend.js')]; } catch(e){}

const { getRecommendations, initializeEngine } = require('./src/engine/recommend.js');
const wp = require('./src/data/winRateProvider.js');

if (wp.reloadWinRates) {
   wp.reloadWinRates(true, {
       'soloq': {
           "Ahri": {
               "mid": { winRate: 0.51, matches: 100, hasData: true }
           }
       }
   });
}

const countersDB = {
    "Ahri": {
        roles: ["mid"],
        counters: { "Zed": 0.45 },
        synergies: { "Vi": 0.55 }
    },
    "Zed": {
        roles: ["mid"],
        counters: { "Ahri": 0.55 }
    },
    "Vi": {
        roles: ["jungle"],
        synergies: { "Ahri": 0.55 }
    }
};

const idToName = {
    103: "Ahri",
    238: "Zed",
    254: "Vi"
};

const nameToId = {
    "Ahri": 103,
    "Zed": 238,
    "Vi": 254
};

initializeEngine({ idToName, nameToId, countersDB });

const result = getRecommendations({
    role: "all",
    allyPicks: [254], // Vi
    enemyPicks: [238], // Zed
    bannedChampions: []
});

console.log(result);

assert(result.recommendations.length > 0, "Should return recommendations");
const firstRec = result.recommendations[0];
assert(firstRec.name === "Ahri", "Ahri should be recommended");
console.log("Recommend tests passed!");
