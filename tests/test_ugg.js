const puppeteer = require('puppeteer');
const fs = require('fs');
async function run() {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto('https://u.gg/lol/top-lane-tier-list', {waitUntil: 'domcontentloaded'});
    await page.waitForSelector('div[role="row"]', {timeout: 10000});
    const rows = await page.evaluate(() => {
        const rows = document.querySelectorAll('div[role="row"]');
        if (rows.length > 1) {
            // return the HTML of the first real row (index 1 to skip header usually)
            return rows[1].innerHTML;
        }
        return rows[0].innerHTML;
    });
    fs.writeFileSync('ugg_row.html', rows);
    console.log('Saved row HTML to ugg_row.html');
    await browser.close();
}
run();
