const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
    if (request === 'axios') return { get: async () => ({ data: {} }) };
    return originalRequire.apply(this, arguments);
};

require('./tests/test_analyzeTeamComposition.js');
