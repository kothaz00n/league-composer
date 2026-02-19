const { scrapeUGGChampions } = require('../src/main/scrapers/ugg');

async function run() {
    console.log('--- Starting U.GG Scraper Test ---');
    try {
        // Scrape only 'top' for quick test to avoid full run
        // But the scraper doesn't easily let us filter URLs. It loops over all 6 URLs.
        // Let's just run it, since puppeteer takes time. Actually, if I just want to test, I could run the real scraper.
        const data = await scrapeUGGChampions((msg) => console.log('[Scraper]', msg), 'soloq', {});

        console.log('\n--- Scraping Complete ---');
        // Let's check Singed or Aatrox in Top lane
        const topData = data.soloq.top;
        if (topData) {
            const champs = Object.keys(topData).slice(0, 3);
            for (const c of champs) {
                console.log(`\nChampion: ${c}`);
                console.log('Pick Rate:', topData[c].pickRate);
                console.log('Ban Rate:', topData[c].banRate);
                console.log('Counters:', topData[c].counters);
            }
        } else {
            console.log('No top data found.');
        }
    } catch (e) {
        console.error('Error during scrape:', e);
    }
}
run();
