const assert = require('assert');
const {
    getCompositionRoles,
    detectTeamComposition,
    getCompositionTier,
    getArchetypeFitBonus
} = require('../src/data/archetypeMapping.cjs');

function testGetCompositionRoles() {
    console.log('Testing getCompositionRoles...');

    // Test 1: Single tag mapping
    const roles1 = getCompositionRoles(['Fighter']);
    assert(roles1.includes('dive'), 'Fighter should map to dive');
    assert(roles1.includes('bruiser'), 'Fighter should map to bruiser');
    assert.strictEqual(roles1.length, 2, 'Fighter should map to exactly 2 roles');

    // Test 2: Multiple tags
    const roles2 = getCompositionRoles(['Tank', 'Support']);
    // Tank -> engage, frontline. Support -> protect, anti-engage.
    assert(roles2.includes('engage'));
    assert(roles2.includes('frontline'));
    assert(roles2.includes('protect'));
    assert(roles2.includes('anti-engage'));
    assert.strictEqual(roles2.length, 4);

    // Test 3: Empty/Null input
    assert.deepStrictEqual(getCompositionRoles([]), []);
    assert.deepStrictEqual(getCompositionRoles(null), []);
    assert.deepStrictEqual(getCompositionRoles(undefined), []);

    console.log('getCompositionRoles passed.\n');
}

function testDetectTeamComposition() {
    console.log('Testing detectTeamComposition...');

    // Test 1: Empty team
    const result1 = detectTeamComposition([]);
    assert.strictEqual(result1.archetype, 'unknown');
    assert.strictEqual(result1.confidence, 0);

    // Test 2: Hard Engage (5 Tanks)
    // Tank -> engage, frontline
    // Hard Engage req: engage, frontline. bonus: teamfight, dps.
    // Score: (5*3) + (5*3) = 30.
    const teamHardEngage = Array(5).fill({ tags: ['Tank'] });
    const result2 = detectTeamComposition(teamHardEngage);
    assert.strictEqual(result2.archetype, 'hardEngage');
    assert(result2.confidence > 20, 'Confidence should be high for 5 tanks');

    // Test 3: Protect the Carry (4 Supports + 1 Marksman)
    // Support -> protect, anti-engage
    // Marksman -> hypercarry, dps
    // Protect req: protect, hypercarry. bonus: anti-engage, frontline.
    // protect count: 4. hypercarry count: 1. anti-engage count: 4. frontline: 0.
    // Score: (4*3) + (1*3) + (4*1) = 12 + 3 + 4 = 19.
    const teamProtect = [
        { tags: ['Support'] },
        { tags: ['Support'] },
        { tags: ['Support'] },
        { tags: ['Support'] },
        { tags: ['Marksman'] }
    ];
    const result3 = detectTeamComposition(teamProtect);
    assert.strictEqual(result3.archetype, 'protect');
    assert(result3.confidence > 15, 'Confidence should be decent for protect comp');

    // Test 4: Mixed / Unknown logic (if no archetype dominates sufficiently?)
    // Actually detectTeamComposition returns the *best* score, or 'mixed' if bestArchetype is null.
    // But since scores start at 0, if there's any match it returns it.
    // Only if all scores are 0 (no matching roles) it returns 'mixed'.
    // Let's force a 'mixed' result by passing champions with NO tags mapping to roles.
    // But wait, TAG_TO_COMP_ROLES handles standard tags. What if we pass invalid tags?
    const teamInvalid = [{ tags: ['InvalidTag'] }];
    const result4 = detectTeamComposition(teamInvalid);
    assert.strictEqual(result4.archetype, 'mixed');

    console.log('detectTeamComposition passed.\n');
}

function testGetCompositionTier() {
    console.log('Testing getCompositionTier...');

    // Test 1: Empty -> D
    assert.strictEqual(getCompositionTier([]), 'D');

    // Test 2: High confidence + High Winrate -> S
    // 5 Tanks (Hard Engage score ~30). Max confidence for 5 champs = 5*3*2 = 30.
    // So compFit = 1.0.
    // Winrate 60% (0.60).
    // wrScore = (0.60 - 0.45) / 0.10 = 1.5 -> capped at 1.0.
    // Combined = 50 + 50 = 100. -> S
    const teamGod = Array(5).fill({ tags: ['Tank'], winRate: 0.60 });
    assert.strictEqual(getCompositionTier(teamGod), 'S');

    // Test 3: Low confidence + Low Winrate -> D
    // 1 champ with invalid tag. Confidence 0. Winrate 40%.
    // compFit = 0.
    // wrScore = (0.40 - 0.45) / 0.10 = -0.5 -> capped at 0.
    // Combined = 0. -> D
    const teamBad = [{ tags: ['Invalid'], winRate: 0.40 }];
    assert.strictEqual(getCompositionTier(teamBad), 'D');

    // Test 4: Mid tier
    // A decent team but average winrate.
    // 5 Tanks (conf 30 -> fit 1.0). Winrate 0.45 -> wrScore 0.
    // Combined = 50 + 0 = 50. -> B (>=40)
    const teamMid = Array(5).fill({ tags: ['Tank'], winRate: 0.45 });
    assert.strictEqual(getCompositionTier(teamMid), 'B');

    console.log('getCompositionTier passed.\n');
}

function testGetArchetypeFitBonus() {
    console.log('Testing getArchetypeFitBonus...');

    // Archetype: hardEngage (req: engage, frontline; bonus: teamfight, dps)

    // Case 1: Perfect fit (Tank -> engage, frontline)
    // engage (req) -> +3
    // frontline (req) -> +3
    // Total 6. Capped at 5.
    const bonus1 = getArchetypeFitBonus(['Tank'], 'hardEngage');
    assert.strictEqual(bonus1, 5);

    // Case 2: Partial fit (Fighter -> dive, bruiser)
    // hardEngage doesn't use dive or bruiser?
    // Let's check: hardEngage req [engage, frontline], bonus [teamfight, dps].
    // Fighter -> dive, bruiser. No overlap.
    const bonus2 = getArchetypeFitBonus(['Fighter'], 'hardEngage');
    assert.strictEqual(bonus2, 0);

    // Case 3: Bonus fit (Mage -> poke, teamfight)
    // teamfight is bonus for hardEngage -> +1.
    const bonus3 = getArchetypeFitBonus(['Mage'], 'hardEngage');
    assert.strictEqual(bonus3, 1);

    // Case 4: Invalid inputs
    assert.strictEqual(getArchetypeFitBonus(null, 'hardEngage'), 0);
    assert.strictEqual(getArchetypeFitBonus(['Tank'], 'invalidArchetype'), 0);

    console.log('getArchetypeFitBonus passed.\n');
}

try {
    testGetCompositionRoles();
    testDetectTeamComposition();
    testGetCompositionTier();
    testGetArchetypeFitBonus();
    console.log('All tests passed!');
} catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
}
