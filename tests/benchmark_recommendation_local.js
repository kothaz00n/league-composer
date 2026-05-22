const assert = require('assert');

function runBench() {
    let score = 0;
    const enemyNames = ['Aatrox', 'Ahri', 'Akali', 'Alistar', 'Amumu'];
    const loops = 100000;

    const champData = { counters: { 'Aatrox': 0.52, 'Ahri': 0.48, 'Akali': 0.55 } };
    const stats = { counters: { 'Ahri': 0.49, 'Amumu': 0.51 } };

    // Original
    const start1 = process.hrtime.bigint();
    for (let i = 0; i < loops; i++) {
        const dynamicCounters = stats.counters || {};
        const mergedCounters = { ...(champData.counters || {}), ...dynamicCounters };

        for (const enemyName of enemyNames) {
            if (mergedCounters[enemyName]) {
                const winrate = mergedCounters[enemyName];
                score += winrate;
            }
        }
    }
    const end1 = process.hrtime.bigint();

    score = 0;

    // Optimized
    const start2 = process.hrtime.bigint();
    for (let i = 0; i < loops; i++) {
        const dynamicCounters = stats.counters || {};
        const staticCounters = champData.counters || {};

        for (const enemyName of enemyNames) {
            let winrate = dynamicCounters[enemyName];
            if (winrate === undefined) winrate = staticCounters[enemyName];

            if (winrate !== undefined) {
                score += winrate;
            }
        }
    }
    const end2 = process.hrtime.bigint();

    console.log(`Original: ${Number(end1 - start1) / 1000000} ms`);
    console.log(`Optimized: ${Number(end2 - start2) / 1000000} ms`);
}

runBench();
