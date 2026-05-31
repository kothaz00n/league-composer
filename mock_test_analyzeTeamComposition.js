const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(moduleName) {
    if (moduleName === 'axios') {
        return { get: async () => ({ data: { data: {} } }) };
    }
    return originalRequire.apply(this, arguments);
};
require('./tests/test_analyzeTeamComposition.js');
