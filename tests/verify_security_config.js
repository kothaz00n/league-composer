
const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../src/main/main.js');

try {
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

    // Basic regex check for the configuration
    // Note: This is a simple static analysis. In a real environment, AST parsing would be better,
    // but regex is sufficient for this check.

    // Check for webPreferences block
    const webPreferencesRegex = /webPreferences:\s*{([^}]*)}/s;
    const match = mainJsContent.match(webPreferencesRegex);

    if (!match) {
        console.error('FAIL: webPreferences block not found in src/main/main.js');
        process.exit(1);
    }

    const webPreferencesContent = match[1];

    // Check for required security settings
    const checks = [
        {
            name: 'sandbox: true',
            regex: /sandbox:\s*true/,
            required: true
        },
        {
            name: 'contextIsolation: true',
            regex: /contextIsolation:\s*true/,
            required: true
        },
        {
            name: 'nodeIntegration: false',
            regex: /nodeIntegration:\s*false/,
            required: true
        }
    ];

    let passed = true;

    checks.forEach(check => {
        if (check.regex.test(webPreferencesContent)) {
            console.log(`PASS: ${check.name} found.`);
        } else {
            if (check.required) {
                console.error(`FAIL: ${check.name} NOT found in webPreferences.`);
                passed = false;
            } else {
                console.warn(`WARN: ${check.name} NOT found in webPreferences.`);
            }
        }
    });

    if (passed) {
        console.log('ALL SECURITY CHECKS PASSED');
        process.exit(0);
    } else {
        console.error('SECURITY CHECKS FAILED');
        process.exit(1);
    }

} catch (err) {
    console.error('Error reading file:', err);
    process.exit(1);
}
