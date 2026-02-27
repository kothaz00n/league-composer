const assert = require('assert');
const { createLcuClient } = require('../src/main/lcu/lcuClient');

console.log('Testing createLcuClient...');

const mockCredentials = {
    port: '12345',
    token: 'mysecrettoken',
    protocol: 'https'
};

const client = createLcuClient(mockCredentials);

// Test 1: Validate baseURL
assert.strictEqual(client.defaults.baseURL, 'https://127.0.0.1:12345', 'baseURL should match protocol, ip, and port');

// Test 2: Validate timeout
assert.strictEqual(client.defaults.timeout, 5000, 'timeout should be 5000ms');

// Test 3: Validate headers
const expectedAuthString = Buffer.from('riot:mysecrettoken').toString('base64');

assert.strictEqual(client.defaults.headers['Authorization'], `Basic ${expectedAuthString}`, 'Authorization header should be correctly encoded');
assert.strictEqual(client.defaults.headers['Accept'], 'application/json', 'Accept header should be application/json');
assert.strictEqual(client.defaults.headers['Content-Type'], 'application/json', 'Content-Type header should be application/json');

// Test 4: Validate httpsAgent
assert.ok(client.defaults.httpsAgent, 'httpsAgent should be defined');
assert.strictEqual(client.defaults.httpsAgent.options.rejectUnauthorized, false, 'httpsAgent should have rejectUnauthorized set to false');

// Test 5: Validate interceptors
// Axios stores response interceptors in `client.interceptors.response.handlers` array
assert.strictEqual(client.interceptors.response.handlers.length, 1, 'Should have one response interceptor');

console.log('All tests passed!');