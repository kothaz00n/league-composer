
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Load Parser class
const parserCode = fs.readFileSync('parser.js', 'utf8');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(parserCode + '; this.Parser = Parser;', sandbox);
const Parser = sandbox.Parser;

function testExtractPhoneInfo() {
    console.log('Testing extractPhoneInfo...');

    function check(result, expected, msg) {
        // Convert result to plain object to avoid cross-realm issues from vm
        const plainResult = JSON.parse(JSON.stringify(result));
        try {
            assert.deepStrictEqual(plainResult, expected);
            console.log(msg + ' passed');
        } catch (e) {
            console.error(msg + ' failed');
            console.error('Expected:', JSON.stringify(expected));
            console.error('Actual:', JSON.stringify(result));
            throw e;
        }
    }

    const seenPhones = new Set();

    // 1. Empty/null/undefined input
    check(Parser.extractPhoneInfo('', seenPhones), { type: 'empty' }, 'Test Empty String');
    check(Parser.extractPhoneInfo(null, seenPhones), { type: 'empty' }, 'Test Null');
    check(Parser.extractPhoneInfo(undefined, seenPhones), { type: 'empty' }, 'Test Undefined');

    // 2. Pure text input without digits
    check(Parser.extractPhoneInfo('No phone', seenPhones), { type: 'text', text: 'No phone' }, 'Test Pure Text');
    check(Parser.extractPhoneInfo('   ', seenPhones), { type: 'text', text: '' }, 'Test Whitespace');

    // 3. Input with digits below the length threshold (currently 6)
    check(Parser.extractPhoneInfo('12345', seenPhones), { type: 'text', text: '12345' }, 'Test Short Number');

    // 4. Standard phone numbers meeting the threshold
    check(Parser.extractPhoneInfo('123456', seenPhones), {
        type: 'number',
        number: '123456',
        original: '123456',
        isDuplicate: false,
        extraText: ''
    }, 'Test Standard Number (6 digits)');

    // 5. Detection of duplicates
    check(Parser.extractPhoneInfo('123456', seenPhones), {
        type: 'number',
        number: '123456',
        original: '123456',
        isDuplicate: true,
        extraText: ''
    }, 'Test Duplicate Number');

    // 6. Handling of separators (+, -, (, ), /, ., space)
    seenPhones.clear();
    check(Parser.extractPhoneInfo('+54 (11) 1234-5678', seenPhones), {
        type: 'number',
        number: '541112345678',
        original: '+54 (11) 1234-5678',
        isDuplicate: false,
        extraText: ''
    }, 'Test Number with Separators');

    // 7. Accurate extraction of extra descriptive text when mixed with digits
    check(Parser.extractPhoneInfo('123456789 (Office)', seenPhones), {
        type: 'number',
        number: '123456789',
        original: '123456789 (Office)',
        isDuplicate: false,
        extraText: 'Office'
    }, 'Test Number with Extra Text');

    // 8. Number with just separators as "extra text"
    check(Parser.extractPhoneInfo('123456789 - ', seenPhones), {
        type: 'number',
        number: '123456789',
        original: '123456789 - ',
        isDuplicate: true,
        extraText: ''
    }, 'Test Number with only separators');

    // 9. International formats
    check(Parser.extractPhoneInfo('+1 202 555 0123', seenPhones), {
        type: 'number',
        number: '12025550123',
        original: '+1 202 555 0123',
        isDuplicate: false,
        extraText: ''
    }, 'Test International Format');

    // 10. Mixed text and numbers
    check(Parser.extractPhoneInfo('Call me at 123456789', seenPhones), {
        type: 'number',
        number: '123456789',
        original: 'Call me at 123456789',
        isDuplicate: true,
        extraText: 'Call me at'
    }, 'Test Mixed Text and Numbers');

    console.log('All extractPhoneInfo tests passed!');
}

try {
    testExtractPhoneInfo();
} catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
}
