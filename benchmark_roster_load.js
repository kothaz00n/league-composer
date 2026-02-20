const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const ROSTER_PATH = path.join(__dirname, 'src/data/roster.json');
const ITERATIONS = 10000; // Increased to make blocking more obvious

function measureLoopLag(ms = 10) {
    let start = performance.now();
    let maxLag = 0;
    let intervalId;

    const promise = new Promise((resolve) => {
        intervalId = setInterval(() => {
            const now = performance.now();
            const elapsed = now - start;
            const lag = elapsed - ms;
            if (lag > maxLag) maxLag = lag;
            start = now;
        }, ms);
    });

    return {
        stop: () => {
            clearInterval(intervalId);
            return maxLag;
        }
    };
}

async function runBenchmark() {
    console.log(`Benchmarking roster load (ITERATIONS=${ITERATIONS})`);

    // warm up
    if (!fs.existsSync(ROSTER_PATH)) {
        fs.writeFileSync(ROSTER_PATH, JSON.stringify({ test: "data" }));
    }
    fs.readFileSync(ROSTER_PATH);

    // Synchronous
    console.log('\n--- Synchronous ---');

    // Start measuring lag
    let start = performance.now();
    let maxLag = 0;

    // We can't use setInterval to measure blocking of the *current* synchronous block easily
    // because the interval callback won't run until the block finishes.
    // Instead, we can infer blocking by the time it takes to complete the block.
    // If the block takes 500ms, the event loop was blocked for 500ms.

    const startSync = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        if (fs.existsSync(ROSTER_PATH)) {
            const data = fs.readFileSync(ROSTER_PATH, 'utf8');
            JSON.parse(data);
        }
    }
    const endSync = performance.now();

    console.log(`Total Time: ${(endSync - startSync).toFixed(2)}ms`);
    console.log(`Avg Time per op: ${((endSync - startSync) / ITERATIONS).toFixed(4)}ms`);
    console.log(`Blocking Duration: ${(endSync - startSync).toFixed(2)}ms (The event loop was frozen for this entire duration)`);

    // Asynchronous
    console.log('\n--- Asynchronous ---');

    // For async, we can measure lag because the event loop turns.
    let maxAsyncLag = 0;
    let lastTime = performance.now();
    const interval = setInterval(() => {
        const now = performance.now();
        const lag = (now - lastTime) - 10;
        if (lag > maxAsyncLag) maxAsyncLag = lag;
        lastTime = now;
    }, 10);

    const startAsync = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        try {
            const data = await fs.promises.readFile(ROSTER_PATH, 'utf8');
            JSON.parse(data);
        } catch (err) {}
    }
    const endAsync = performance.now();

    clearInterval(interval);

    console.log(`Total Time: ${(endAsync - startAsync).toFixed(2)}ms`);
    console.log(`Avg Time per op: ${((endAsync - startAsync) / ITERATIONS).toFixed(4)}ms`);
    console.log(`Max Event Loop Lag: ${maxAsyncLag.toFixed(2)}ms`);
}

runBenchmark();
