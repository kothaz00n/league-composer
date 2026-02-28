const assert = require('assert');
const Module = require('module');

// Mock 'ws' module before importing LcuWebSocket
const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
    if (request === 'ws') {
        return class MockWebSocket {
            constructor() {}
            on() {}
            send() {}
            close() {}
            removeAllListeners() {}
        };
    }
    return originalRequire.apply(this, arguments);
};

const { LcuWebSocket, CHAMP_SELECT_EVENT } = require('../src/main/lcu/lcuWebSocket');

console.log('Testing LcuWebSocket._handleMessage()...');

function createTestInstance() {
    const ws = new LcuWebSocket();
    // Helper to capture emitted events
    ws.emittedEvents = [];

    // Override emit to capture events
    const originalEmit = ws.emit.bind(ws);
    ws.emit = function(eventName, data) {
        ws.emittedEvents.push({ eventName, data });
        return originalEmit(eventName, data);
    };

    return ws;
}

// Helper to create a WAMP string
function createWampString(opcode, eventName, payload) {
    return JSON.stringify([opcode, eventName, payload]);
}

// Test 1: Invalid JSON
(function testInvalidJson() {
    const ws = createTestInstance();
    // This should be caught and silently ignored without throwing an error
    ws._handleMessage('this is not json');
    assert.strictEqual(ws.emittedEvents.length, 0, 'Invalid JSON should not emit events');
    console.log('✓ Invalid JSON handled correctly');
})();

// Test 2: Valid JSON but not an array
(function testNotArray() {
    const ws = createTestInstance();
    ws._handleMessage(JSON.stringify({ some: 'object' }));
    assert.strictEqual(ws.emittedEvents.length, 0, 'Non-array JSON should not emit events');
    console.log('✓ Non-array JSON handled correctly');
})();

// Test 3: Array length < 3
(function testShortArray() {
    const ws = createTestInstance();
    ws._handleMessage(JSON.stringify([8, CHAMP_SELECT_EVENT]));
    assert.strictEqual(ws.emittedEvents.length, 0, 'Short array should not emit events');
    console.log('✓ Short array handled correctly');
})();

// Test 4: Incorrect opcode
(function testIncorrectOpcode() {
    const ws = createTestInstance();
    const payload = { eventType: 'Create', data: {} };
    ws._handleMessage(createWampString(9, CHAMP_SELECT_EVENT, payload));
    assert.strictEqual(ws.emittedEvents.length, 0, 'Incorrect opcode should not emit events');
    console.log('✓ Incorrect opcode handled correctly');
})();

// Test 5: Incorrect event name
(function testIncorrectEventName() {
    const ws = createTestInstance();
    const payload = { eventType: 'Create', data: {} };
    ws._handleMessage(createWampString(8, 'WrongEventName', payload));
    assert.strictEqual(ws.emittedEvents.length, 0, 'Incorrect event name should not emit events');
    console.log('✓ Incorrect event name handled correctly');
})();

// Test 6: Create event
(function testCreateEvent() {
    const ws = createTestInstance();
    const data = { myTeam: [] };
    const payload = { eventType: 'Create', data };
    ws._handleMessage(createWampString(8, CHAMP_SELECT_EVENT, payload));

    assert.strictEqual(ws.emittedEvents.length, 1);
    assert.strictEqual(ws.emittedEvents[0].eventName, 'champSelectStarted');
    assert.deepStrictEqual(ws.emittedEvents[0].data, data);
    console.log('✓ Create event emitted correct event with data');
})();

// Test 7: Update event
(function testUpdateEvent() {
    const ws = createTestInstance();
    const data = { myTeam: [ { championId: 1 } ] };
    const payload = { eventType: 'Update', data };
    ws._handleMessage(createWampString(8, CHAMP_SELECT_EVENT, payload));

    assert.strictEqual(ws.emittedEvents.length, 1);
    assert.strictEqual(ws.emittedEvents[0].eventName, 'champSelectUpdated');
    assert.deepStrictEqual(ws.emittedEvents[0].data, data);
    console.log('✓ Update event emitted correct event with data');
})();

// Test 8: Delete event
(function testDeleteEvent() {
    const ws = createTestInstance();
    const payload = { eventType: 'Delete', data: {} };
    ws._handleMessage(createWampString(8, CHAMP_SELECT_EVENT, payload));

    assert.strictEqual(ws.emittedEvents.length, 1);
    assert.strictEqual(ws.emittedEvents[0].eventName, 'champSelectEnded');
    // Delete event doesn't pass data in emit
    assert.strictEqual(ws.emittedEvents[0].data, undefined);
    console.log('✓ Delete event emitted correct event');
})();

// Test 9: Unknown eventType
(function testUnknownEventType() {
    const ws = createTestInstance();
    const payload = { eventType: 'UnknownType', data: {} };
    ws._handleMessage(createWampString(8, CHAMP_SELECT_EVENT, payload));

    // In actual use, this hits default: console.log(...) and emits nothing
    assert.strictEqual(ws.emittedEvents.length, 0, 'Unknown event type should not emit events');
    console.log('✓ Unknown event type handled correctly');
})();

console.log('All tests passed!');
