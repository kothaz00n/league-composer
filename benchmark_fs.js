const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const WINRATES_PATH = path.join(__dirname, 'src/data/winrates.json');
const ITERATIONS = 100;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSync() {
    // console.log('Starting SYNC workload...');
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        if (fs.existsSync(WINRATES_PATH)) {
            const raw = fs.readFileSync(WINRATES_PATH, 'utf8');
            JSON.parse(raw);
        }
    }
    const end = performance.now();
    // console.log(`SYNC workload finished in ${(end - start).toFixed(2)}ms`);
}

async function runAsync() {
    // console.log('Starting ASYNC workload...');
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        if (fs.existsSync(WINRATES_PATH)) {
            const raw = await fs.promises.readFile(WINRATES_PATH, 'utf8');
            JSON.parse(raw);
        }
    }
    const end = performance.now();
    // console.log(`ASYNC workload finished in ${(end - start).toFixed(2)}ms`);
}

async function main() {
    console.log(`Benchmarking with ${ITERATIONS} iterations.`);

    // 1. Measure responsiveness during Sync
    console.log('\n--- Sync Test ---');
    let lastTick = performance.now();
    let maxLagSync = 0;
    const timerSync = setInterval(() => {
        const now = performance.now();
        const delta = now - lastTick;
        if (delta > maxLagSync) maxLagSync = delta;
        lastTick = now;
    }, 5);

    await runSync();
    clearInterval(timerSync);

    // Check one last time after loop finishes
    const nowSync = performance.now();
    const deltaSync = nowSync - lastTick;
    if (deltaSync > maxLagSync) maxLagSync = deltaSync;

    console.log(`Max Event Loop Lag (Sync): ${maxLagSync.toFixed(2)}ms`);


    // 2. Measure responsiveness during Async
    console.log('\n--- Async Test ---');
    await sleep(100); // cooldown
    lastTick = performance.now();
    let maxLagAsync = 0;
    const timerAsync = setInterval(() => {
        const now = performance.now();
        const delta = now - lastTick;
        if (delta > maxLagAsync) maxLagAsync = delta;
        lastTick = now;
    }, 5);

    await runAsync();
    clearInterval(timerAsync);

    const nowAsync = performance.now();
    const deltaAsync = nowAsync - lastTick;
    if (deltaAsync > maxLagAsync) maxLagAsync = deltaAsync;

    console.log(`Max Event Loop Lag (Async): ${maxLagAsync.toFixed(2)}ms`);
}

main();
