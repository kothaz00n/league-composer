/**
 * ugg.js - Scraper for U.GG champion data
 */
const puppeteer = require('puppeteer');

/**
 * Scrapes U.GG for champion win rates and stats for all roles.
 * Returns data in the format expected by winRateProvider:
 * {
 *   soloq: {
 *     top: { "Aatrox": { winRate: 0.52, ... }, ... },
 *     jungle: { ... },
 *     ...
 *   }
 * }
 * 
 * @param {function} onProgress - Callback for logging progress messages
 */
async function scrapeUGGChampions(onProgress = (msg) => console.log(msg), queueType = 'soloq', nameMap = {}) {
    onProgress(`Launching browser for ${queueType}...`);
    const browser = await puppeteer.launch({
        headless: true, // Run invisibly in background
        defaultViewport: null, // Full page
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Structure required by winRateProvider.js
    const resultData = {
        [queueType]: {
            top: {},
            jungle: {},
            mid: {},
            adc: {},
            support: {},
            // 'all' key might be useful if provider supports it, or we allow selecting it.
            // winRateProvider usually expects standard roles, but let's scrape it anyway.
            // We'll call it 'all' internally.
            all: {}
        }
    };

    try {
        const page = await browser.newPage();

        // Anti-bot: Set a realistic User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set a large viewport to ensure we see desktop layout
        await page.setViewport({ width: 1920, height: 1080 });

        const queueParam = queueType === 'flex' ? '?queueType=ranked_flex_sr' : '';

        // Define all role pages to scrape
        const roleUrls = [
            { url: `https://u.gg/lol/top-lane-tier-list${queueParam}`, role: 'top' },
            { url: `https://u.gg/lol/jungle-tier-list${queueParam}`, role: 'jungle' },
            { url: `https://u.gg/lol/mid-lane-tier-list${queueParam}`, role: 'mid' },
            { url: `https://u.gg/lol/adc-tier-list${queueParam}`, role: 'adc' },
            { url: `https://u.gg/lol/support-tier-list${queueParam}`, role: 'support' },
            // Add "All Roles" page
            { url: `https://u.gg/lol/tier-list${queueParam}`, role: 'all' },
        ];

        for (const { url, role } of roleUrls) {
            onProgress(`Scraping ${role}...`);

            try {
                // Navigate to the role-specific page
                // metadata: using domcontentloaded is faster/safer than networkidle2 for ad-heavy sites
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Wait for the table to load with flexible selector
                try {
                    // Increased timeout to 20s
                    await page.waitForSelector('div[role="row"]', { timeout: 20000 });
                } catch (selectorError) {
                    onProgress(`  - Waiting for table content (${role})...`);
                    try {
                        // Try waiting for any table-like structure
                        await page.waitForSelector('div[class*="rt-tr"], div[role="cell"], table', { timeout: 15000 });
                    } catch (retryError) {
                        // CAPTURE SCREENSHOT ON ERROR
                        const time = Date.now();
                        const screenshotPath = require('path').join(__dirname, `../../../error_${role}_${time}.png`);
                        await page.screenshot({ path: screenshotPath });
                        onProgress(`  ! Error scraping ${role}. Screenshot saved to: ${screenshotPath}`);
                        throw retryError;
                    }
                }

                // Scroll to bottom to trigger lazy loading
                onProgress(`  - Scrolling to load all champions...`);
                await autoScroll(page);

                // Wait a bit more for lazy-loaded content
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Extract champion data for this role
                // Pass nameMap to evaluate context
                const championData = await page.evaluate((nameMap) => {
                    const rows = document.querySelectorAll('div[role="row"]');
                    const champions = {};

                    rows.forEach(row => {
                        try {
                            // Get champion name from href
                            // href format: /lol/champions/aatrox/build/top
                            const championLink = row.querySelector('a[href*="/lol/champions/"]');
                            if (!championLink) return;

                            const href = championLink.getAttribute('href');
                            const slug = href.split('/')[3];
                            if (!slug) return;

                            // Normalize name using provided map or fallback
                            let championName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
                            // Simple check for map presence (slug is usually lowercase clean)
                            // "missfortune" -> "MissFortune"
                            if (nameMap && nameMap[slug]) {
                                championName = nameMap[slug];
                            }

                            // Get win rate
                            // Look for div with winrate class, then span > b inside it
                            const winrateDiv = row.querySelector('div[class*="winrate"]');
                            if (!winrateDiv) return;

                            const winrateSpan = winrateDiv.querySelector('span b');
                            const winrateText = winrateSpan ? winrateSpan.textContent.trim() : null; // "53.76%"

                            if (winrateText && winrateText.includes('%')) {
                                const winRateVal = parseFloat(winrateText.replace('%', ''));

                                // Get tier (optional)
                                const tierDiv = row.querySelector('div[class*="tier"]');
                                const tier = tierDiv ? tierDiv.textContent.trim() : '';

                                // Get matches count (optional, can be tricky to parse "12,345 Matches")
                                const matchesDiv = row.querySelector('div[class*="matches"]');
                                let matches = 0;
                                if (matchesDiv) {
                                    const matchesText = matchesDiv.textContent.replace(/,/g, '').replace(' Matches', '').trim();
                                    matches = parseInt(matchesText) || 0;
                                }

                                // Get pick rate
                                const pickRateDiv = row.querySelector('div[class*="pickrate"]');
                                const pickRateText = pickRateDiv ? pickRateDiv.textContent.trim() : null;
                                let pickRateVal = 0;
                                if (pickRateText && pickRateText.includes('%')) {
                                    pickRateVal = parseFloat(pickRateText.replace('%', '')) / 100;
                                }

                                // Get ban rate
                                const banRateDiv = row.querySelector('div[class*="banrate"]');
                                const banRateText = banRateDiv ? banRateDiv.textContent.trim() : null;
                                let banRateVal = 0;
                                if (banRateText && banRateText.includes('%')) {
                                    banRateVal = parseFloat(banRateText.replace('%', '')) / 100;
                                }

                                // Get counters (worst matchups)
                                const againstDiv = row.querySelector('div[class*="against"]');
                                const counters = {};
                                if (againstDiv) {
                                    const counterLinks = againstDiv.querySelectorAll('a[href*="/lol/champions/"]');
                                    let count = 0;
                                    counterLinks.forEach(a => {
                                        if (count >= 3) return;
                                        const href = a.getAttribute('href');
                                        const counterSlug = href.split('/')[3];
                                        if (counterSlug) {
                                            let counterName = counterSlug.charAt(0).toUpperCase() + counterSlug.slice(1).toLowerCase();
                                            if (nameMap && nameMap[counterSlug]) {
                                                counterName = nameMap[counterSlug];
                                            }
                                            // Ignore if it's the champion itself (view more link)
                                            if (counterName !== championName) {
                                                // Assign a bad winrate (< 0.5) to indicate it's a counter
                                                counters[counterName] = 0.47;
                                                count++;
                                            }
                                        }
                                    });
                                }

                                champions[championName] = {
                                    winRate: winRateVal / 100, // Store as 0.5376
                                    pickRate: pickRateVal,
                                    banRate: banRateVal,
                                    matches: matches,
                                    tier: tier,
                                    slug: slug,
                                    counters: counters
                                };
                            }
                        } catch (err) {
                            // skip row
                        }
                    });

                    return champions;
                }, nameMap);

                // Assign to our result structure
                resultData[queueType][role] = championData; // Use dynamic queueType key
                onProgress(`  - Found ${Object.keys(championData).length} champions for ${role}.`);

                // Polite delay
                await new Promise(resolve => setTimeout(resolve, 3500));

            } catch (roleError) {
                onProgress(`  ! Error scraping ${role}: ${roleError.message}`);
                // Continue to next role
            }
        }

        onProgress('Scraping complete.');
        return resultData;

    } catch (error) {
        onProgress(`Fatal error: ${error.message}`);
        throw error;
    } finally {
        await browser.close();
    }
}

// Helper to scroll page
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports = { scrapeUGGChampions };
