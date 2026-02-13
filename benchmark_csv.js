
const fs = require('fs');
const vm = require('vm');
const { performance } = require('perf_hooks');

// Load Parser class (This is now the OPTIMIZED version from disk)
const parserCode = fs.readFileSync('parser.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(parserCode + '; this.Parser = Parser;', sandbox);
const OptimizedParserFromDisk = sandbox.Parser;

// OLD Implementation for comparison
class OldParser {
    static splitCSV(line, delimiter) {
        // Optimized CSV splitting using split/rejoin strategy
        // This avoids character-by-character iteration and concatenation
        if (!line) return [''];

        // Fast path: simple split if no quotes are present
        if (line.indexOf('"') === -1) {
            return line.split(delimiter);
        }

        const parts = line.split(delimiter);
        const result = [];
        let current = null;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            // Count quotes in this part
            let quotes = 0;
            for (let j = 0; j < part.length; j++) {
                if (part[j] === '"') quotes++;
            }

            if (current === null) {
                if (quotes % 2 === 0) {
                    // Complete field
                    if (quotes === 0) {
                        result.push(part);
                    } else {
                        result.push(part.replace(/"/g, ''));
                    }
                } else {
                    // Incomplete field (odd quotes), start accumulation
                    current = part;
                }
            } else {
                // Continuation of a field
                current += delimiter + part;
                if (quotes % 2 !== 0) { // Found closing quote (odd + odd = even total)
                    result.push(current.replace(/"/g, ''));
                    current = null;
                }
            }
        }

        // Handle edge case where last field is incomplete
        if (current !== null) {
            result.push(current.replace(/"/g, ''));
        }

        return result;
    }
}

const ITERATIONS = 10000;
const lines = [];
const delimiter = ',';

for (let i = 0; i < ITERATIONS; i++) {
    if (i % 3 === 0) {
        lines.push('Name,Email,Location,Phone1,Phone2,Plan,Income,Age');
    } else if (i % 3 === 1) {
        lines.push('"Doe, John",john@example.com,"New York, NY",1234567890,0987654321,Plan A,1000,30');
    } else {
        lines.push('"Smith, Jane",jane@example.com,"Los Angeles, CA","(555) 123-4567","(555) 987-6543","Plan B, Premium",2000,25');
    }
}

// Verification
console.log("Verifying correctness...");
const testCases = [
    { input: 'A,B,C', expected: ['A', 'B', 'C'] },
    { input: 'A,"B,C",D', expected: ['A', 'B,C', 'D'] },
    { input: 'A,B"C"D,E', expected: ['A', 'BCD', 'E'] },
    { input: 'A,"B', expected: ['A', 'B'] },
    { input: '', expected: [''] }
];

function testImpl(name, func) {
    let passed = true;
    for (const { input, expected } of testCases) {
        const result = func(input, delimiter);
        if (JSON.stringify(result) !== JSON.stringify(expected)) {
            console.error(`${name} failed for input: ${input}`);
            console.error(`Expected: ${JSON.stringify(expected)}`);
            console.error(`Got:      ${JSON.stringify(result)}`);
            passed = false;
        }
    }
    if (passed) console.log(`${name} passed verification.`);
}

testImpl('OldParser', OldParser.splitCSV);
testImpl('OptimizedParserFromDisk', OptimizedParserFromDisk.splitCSV.bind(OptimizedParserFromDisk));

// Benchmark
console.log(`\nBenchmarking splitCSV with ${ITERATIONS} lines...`);

function runBenchmark(name, func) {
    const start = performance.now();
    for (let i = 0; i < lines.length; i++) {
        func(lines[i], delimiter);
    }
    const end = performance.now();
    const totalTime = end - start;
    console.log(`${name}: ${totalTime.toFixed(2)}ms`);
    return totalTime;
}

const t1 = runBenchmark('OldParser', OldParser.splitCSV);
const t2 = runBenchmark('OptimizedParserFromDisk', OptimizedParserFromDisk.splitCSV.bind(OptimizedParserFromDisk));

console.log(`\nSpeedup: ${(t1 / t2).toFixed(2)}x`);
