const assert = require('assert');
const { validateRosterData } = require('../src/main/validators');

console.log('Testing validateRosterData...');

// Test 1: Valid data
const validData = {
    myRole: 'top',
    gameMode: 'solo',
    roster: {
        top: { favorites: ['Garen', 'Darius'], player: 'Me' },
        jungle: { favorites: [], player: '' },
        mid: { favorites: ['Ahri'] },
        adc: { favorites: [] },
        support: { favorites: [] }
    }
};
assert.strictEqual(validateRosterData(validData), true, 'Valid data should pass');

// Test 2: Invalid top-level fields
assert.strictEqual(validateRosterData(null), false, 'Null should fail');
assert.strictEqual(validateRosterData(undefined), false, 'Undefined should fail');
assert.strictEqual(validateRosterData('string'), false, 'String should fail');
assert.strictEqual(validateRosterData({ myRole: 123 }), false, 'Invalid myRole type should fail');
assert.strictEqual(validateRosterData({ gameMode: 123 }), false, 'Invalid gameMode type should fail');

// Test 3: Missing roster
assert.strictEqual(validateRosterData({ myRole: 'top' }), false, 'Missing roster should fail');

// Test 4: Invalid roster structure
assert.strictEqual(validateRosterData({ roster: 'not-object' }), false, 'Roster as string should fail');
assert.strictEqual(validateRosterData({ roster: { invalidRole: {} } }), false, 'Invalid role key should fail');
assert.strictEqual(validateRosterData({ roster: { top: null } }), false, 'Null role data should fail');
assert.strictEqual(validateRosterData({ roster: { top: { favorites: 'not-array' } } }), false, 'Favorites as string should fail');
assert.strictEqual(validateRosterData({ roster: { top: { favorites: [123] } } }), false, 'Non-string favorite should fail');
assert.strictEqual(validateRosterData({ roster: { top: { favorites: [], player: 123 } } }), false, 'Non-string player should fail');

// Test 5: Length limits
const hugeString = 'a'.repeat(200);
assert.strictEqual(validateRosterData({ myRole: hugeString, roster: {} }), false, 'Huge myRole should fail');
assert.strictEqual(validateRosterData({ roster: { top: { favorites: [hugeString] } } }), false, 'Huge favorite name should fail');

const hugeArray = new Array(300).fill('Champ');
assert.strictEqual(validateRosterData({ roster: { top: { favorites: hugeArray } } }), false, 'Huge favorites array should fail');

console.log('All tests passed!');
