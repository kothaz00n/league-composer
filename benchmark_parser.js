
const fs = require('fs');
const vm = require('vm');
const { performance } = require('perf_hooks');

// Load Parser class
const parserCode = fs.readFileSync('parser.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(parserCode + '; this.Parser = Parser;', sandbox);
const Parser = sandbox.Parser;

// Generate test data
const ITERATIONS = 10000;
const lines = [];
const delimiter = ',';

for (let i = 0; i < ITERATIONS; i++) {
    // Mix of simple and complex lines
    if (i % 3 === 0) {
        lines.push('Name,Email,Location,Phone1,Phone2,Plan,Income,Age');
    } else if (i % 3 === 1) {
        lines.push('"Doe, John",john@example.com,"New York, NY",1234567890,0987654321,Plan A,1000,30');
    } else {
        lines.push('"Smith, Jane",jane@example.com,"Los Angeles, CA","(555) 123-4567","(555) 987-6543","Plan B, Premium",2000,25');
    }
}

// Benchmark
console.log(`Benchmarking splitCSV with ${ITERATIONS} lines...`);
const start = performance.now();

for (let i = 0; i < lines.length; i++) {
    Parser.splitCSV(lines[i], delimiter);
}

const end = performance.now();
const totalTime = end - start;
console.log(`Total time: ${totalTime.toFixed(2)}ms`);
console.log(`Average time per line: ${(totalTime / ITERATIONS).toFixed(4)}ms`);
