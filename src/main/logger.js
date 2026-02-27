const { app } = require('electron');

const isPackaged = app ? app.isPackaged : false;

const logger = {
    log: (...args) => {
        if (!isPackaged) {
            console.log(...args);
        }
    },
    info: (...args) => {
        if (!isPackaged) {
            console.info(...args);
        }
    },
    warn: (...args) => {
        console.warn(...args);
    },
    error: (...args) => {
        console.error(...args);
    }
};

module.exports = logger;
