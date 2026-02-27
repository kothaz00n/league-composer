
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Load Parser class
const parserCode = fs.readFileSync('parser.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(parserCode + '; this.Parser = Parser;', sandbox);
const Parser = sandbox.Parser;

function testSplitCSV() {
    console.log('Testing splitCSV...');

    function check(result, expected, msg) {
        // Convert result to plain array to avoid cross-realm issues
        const plainResult = Array.from(result);
        try {
            assert.deepStrictEqual(plainResult, expected);
            console.log(msg + ' passed');
        } catch (e) {
            console.error(msg + ' failed');
            console.error('Expected:', expected);
            console.error('Actual:', plainResult);
            throw e;
        }
    }

    // Test case 1: Simple CSV
    const result1 = Parser.splitCSV('a,b,c', ',');
    check(result1, ['a', 'b', 'c'], 'Test 1');

    // Test case 2: Quoted fields
    const result2 = Parser.splitCSV('"a","b","c"', ',');
    check(result2, ['a', 'b', 'c'], 'Test 2');

    // Test case 3: Delimiter inside quotes
    const result3 = Parser.splitCSV('"a,b",c', ',');
    check(result3, ['a,b', 'c'], 'Test 3');

    // Test case 4: Mixed quotes
    const result4 = Parser.splitCSV('a,"b,c",d', ',');
    check(result4, ['a', 'b,c', 'd'], 'Test 4');

    // Test case 5: Quotes inside quotes (escaped by double quotes)
    const result5 = Parser.splitCSV('"a""b"', ',');
    check(result5, ['ab'], 'Test 5');

    // Test case 6: Empty line
    const result6 = Parser.splitCSV('', ',');
    check(result6, [''], 'Test 6');

    // Test case 7: Trailing delimiter
    const result7 = Parser.splitCSV('a,b,', ',');
    check(result7, ['a', 'b', ''], 'Test 7');

    console.log('All tests passed!');
}

try {
    testSplitCSV();
} catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
}
