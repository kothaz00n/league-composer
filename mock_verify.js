const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(moduleName) {
    if (moduleName === 'axios') {
        return { get: async () => ({ data: { data: {
            "Amumu": { id: "Amumu", key: "32", tags: ["Tank", "Mage"] },
            "Annie": { id: "Annie", key: "1", tags: ["Mage"] },
            "Zac": { id: "Zac", key: "154", tags: ["Tank", "Fighter"] }
        } } }) };
    }
    return originalRequire.apply(this, arguments);
};

require('./src/data/verify-data.js');
