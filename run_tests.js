const fs = require('fs');
const { execSync } = require('child_process');

const files = fs.readdirSync('tests').filter(f => f.startsWith('test_') && f.endsWith('.js'));
for (const file of files) {
  try {
    console.log(`Running tests/${file}`);
    execSync(`node tests/${file}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed ${file}`);
  }
}
