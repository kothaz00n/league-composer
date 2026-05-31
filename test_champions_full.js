const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(moduleName) {
    if (moduleName === 'axios') {
        return { get: async () => ({ data: { data: {} } }) };
    }
    return originalRequire.apply(this, arguments);
};

// require the test scripts that failed due to module imports
require('./tests/test_analyzeTeamComposition.js');
