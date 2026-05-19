const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
    if (id === 'axios') {
        return {
            get: async () => ({ data: {} })
        };
    }
    return originalRequire.apply(this, arguments);
};
