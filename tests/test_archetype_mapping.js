const { getArchetypeFitBonus } = require('../src/data/archetypeMapping.cjs');
const assert = require('assert');

function check(result, expected, msg) {
    try {
        assert.strictEqual(result, expected);
        console.log(`✅ ${msg} passed`);
    } catch (e) {
        console.error(`❌ ${msg} failed`);
        console.error('Expected:', expected);
        console.error('Actual:', result);
        throw e;
    }
}

function testGetArchetypeFitBonus() {
    console.log('Testing getArchetypeFitBonus...');

    // Test Case 1: 'Tank' tag with 'hardEngage' archetype
    // 'hardEngage' req: ['engage', 'frontline']
    // 'Tank' -> ['engage', 'frontline']
    // Both required roles match. 3 + 3 = 6. Capped at 5.
    check(getArchetypeFitBonus(['Tank'], 'hardEngage'), 5, 'Tank fits hardEngage (capped)');

    // Test Case 2: 'Mage' tag with 'hardEngage' archetype
    // 'hardEngage' bonus: ['teamfight']
    // 'Mage' -> ['poke', 'teamfight']
    // 'teamfight' matches bonus (+1). Total 1.
    check(getArchetypeFitBonus(['Mage'], 'hardEngage'), 1, 'Mage fits hardEngage (bonus)');

    // Test Case 3: 'Support' tag with 'hardEngage' archetype
    // 'hardEngage' req: ['engage', 'frontline'], bonus: ['teamfight', 'dps']
    // 'Support' -> ['protect', 'anti-engage']
    // No matches. Total 0.
    check(getArchetypeFitBonus(['Support'], 'hardEngage'), 0, 'Support fits hardEngage (none)');

    // Test Case 4: 'Marksman' tag with 'poke' archetype
    // 'poke' req: ['poke', 'dps'], bonus: ['anti-engage']
    // 'Marksman' -> ['hypercarry', 'dps']
    // 'dps' matches req (+3). Total 3.
    check(getArchetypeFitBonus(['Marksman'], 'poke'), 3, 'Marksman fits poke (req)');

    // Test Case 5: Invalid archetype key
    check(getArchetypeFitBonus(['Tank'], 'invalidKey'), 0, 'Invalid archetype key');

    // Test Case 6: Null tags
    check(getArchetypeFitBonus(null, 'hardEngage'), 0, 'Null tags');

    // Test Case 7: Empty tags
    check(getArchetypeFitBonus([], 'hardEngage'), 0, 'Empty tags');

    // Test Case 8: Mixed tags
    // 'Fighter' -> ['dive', 'bruiser']
    // 'dive' req: ['dive'], bonus: ['pick', 'bruiser']
    // 'dive' matches req (+3). 'bruiser' matches bonus (+1). Total 4.
    check(getArchetypeFitBonus(['Fighter'], 'dive'), 4, 'Fighter fits dive (req + bonus)');

    console.log('All tests passed!');
}

try {
    testGetArchetypeFitBonus();
} catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
}
