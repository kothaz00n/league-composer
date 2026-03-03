const assert = require('assert');
const { validateWinRateData } = require('../src/main/inputValidation');

console.log('Running tests for inputValidation.js...');

// Valid Payload
const validData = {
    _queue: 'soloq',
    _roleData: {
        top: {
            Aatrox: { winRate: 0.52, pickRate: 0.1, matches: 100 },
            Garen: { winRate: 0.48 }
        },
        jungle: {
            LeeSin: { winRate: 0.50 }
        },
        all: {
             Yasuo: { winRate: 0.45 }
        }
    }
};

try {
    assert.strictEqual(validateWinRateData(validData), true);
    console.log('PASS: Valid payload');
} catch (e) {
    console.error('FAIL: Valid payload', e);
    process.exit(1);
}

// Invalid Queue
const invalidQueue = { ...validData, _queue: 'ranked_tft' };
try {
    validateWinRateData(invalidQueue);
    console.error('FAIL: Invalid queue should throw');
    process.exit(1);
} catch (e) {
    assert(e.message.includes('Unknown queue'));
    console.log('PASS: Invalid queue detected');
}

// Invalid Role
const invalidRole = {
    _queue: 'soloq',
    _roleData: {
        coach: { Aatrox: { winRate: 0.5 } }
    }
};
try {
    validateWinRateData(invalidRole);
    console.error('FAIL: Invalid role should throw');
    process.exit(1);
} catch (e) {
    assert(e.message.includes('Unknown role'));
    console.log('PASS: Invalid role detected');
}

// Invalid Stats Type
const invalidStats = {
    _queue: 'soloq',
    _roleData: {
        top: {
            Aatrox: { winRate: "high" }
        }
    }
};
try {
    validateWinRateData(invalidStats);
    console.error('FAIL: Invalid stats type should throw');
    process.exit(1);
} catch (e) {
    assert(e.message.includes('must be a number'));
    console.log('PASS: Invalid stats type detected');
}

// Huge Payload (Too many champs)
const hugeData = {
    _queue: 'soloq',
    _roleData: { top: {} }
};
for (let i = 0; i < 600; i++) {
    hugeData._roleData.top[`Champ${i}`] = { winRate: 0.5 };
}
try {
    validateWinRateData(hugeData);
    console.error('FAIL: Huge payload should throw');
    process.exit(1);
} catch (e) {
    assert(e.message.includes('Too many champions'));
    console.log('PASS: Huge payload detected');
}

console.log('All tests passed!');
