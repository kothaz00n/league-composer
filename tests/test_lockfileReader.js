const assert = require('assert');
const { parseLockfile } = require('../src/main/lcu/lockfileReader');

console.log('Testing parseLockfile...');

// Test 1: Happy path
const validLockfile = 'LeagueClient:1234:5678:token123:https';
const result1 = parseLockfile(validLockfile);
assert.deepStrictEqual(result1, {
    processName: 'LeagueClient',
    pid: '1234',
    port: '5678',
    token: 'token123',
    protocol: 'https',
}, 'Should correctly parse a valid lockfile string');

// Test 2: Whitespace around content
const whitespaceLockfile = '   LeagueClient:1234:5678:token123:https   \n';
const result2 = parseLockfile(whitespaceLockfile);
assert.deepStrictEqual(result2, {
    processName: 'LeagueClient',
    pid: '1234',
    port: '5678',
    token: 'token123',
    protocol: 'https',
}, 'Should correctly parse a valid lockfile string with surrounding whitespace');

// Test 3: More than 5 parts
const extraPartsLockfile = 'LeagueClient:1234:5678:token123:https:extra:stuff';
const result3 = parseLockfile(extraPartsLockfile);
assert.deepStrictEqual(result3, {
    processName: 'LeagueClient',
    pid: '1234',
    port: '5678',
    token: 'token123',
    protocol: 'https',
}, 'Should correctly parse a lockfile string with extra parts by ignoring the extras');

// Test 4: Less than 5 parts (Error condition)
const lessPartsLockfile = 'LeagueClient:1234:5678:token123';
assert.throws(() => {
    parseLockfile(lessPartsLockfile);
}, /Invalid lockfile format: expected 5 parts, got 4/, 'Should throw an error when there are less than 5 parts');

// Test 5: Empty string (Error condition)
const emptyLockfile = '';
assert.throws(() => {
    parseLockfile(emptyLockfile);
}, /Invalid lockfile format: expected 5 parts, got 1/, 'Should throw an error when the string is empty');

console.log('All tests passed!');
