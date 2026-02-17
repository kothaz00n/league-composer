const puppeteer = require("puppeteer");

async function scrapeUGGChampions() {
  const browser = await puppeteer.launch({
    headless: true, // Set to true for production
    defaultViewport: null,
    args: ["--start-maximized"], // Start with maximized window
  });

  const page = await browser.newPage();

  // Set a large viewport to ensure we see desktop layout
  await page.setViewport({ width: 1920, height: 1080 });

  // Define all role pages to scrape
  const roleUrls = [
    { url: "https://u.gg/lol/top-lane-tier-list", role: "top" },
    { url: "https://u.gg/lol/jungle-tier-list", role: "jungle" },
    { url: "https://u.gg/lol/mid-lane-tier-list", role: "mid" },
    { url: "https://u.gg/lol/adc-tier-list", role: "adc" },
    { url: "https://u.gg/lol/support-tier-list", role: "support" },
  ];

  let allChampionData = {};

  try {
    for (const { url, role } of roleUrls) {
      console.log(`\nScraping ${role} lane: ${url}`);

      try {
        // Navigate to the role-specific page
        await page.goto(url, {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // Wait for the table to load with more flexible selector
        try {
          await page.waitForSelector('div[role="row"]', { timeout: 15000 });
        } catch (selectorError) {
          console.log(
            `Table rows not found immediately for ${role}, trying alternative approach...`
          );
          // Try waiting for any table-like structure
          await page.waitForSelector(
            'div[class*="rt-tr"], div[role="cell"], table',
            { timeout: 10000 }
          );
        }

        // Scroll to bottom to trigger lazy loading
        console.log(`Scrolling to load all ${role} champions...`);
        try {
          await autoScroll(page);
        } catch (scrollError) {
          console.log(`Scroll error for ${role}:`, scrollError.message);
          console.log(`Attempting manual scroll for ${role}...`);
          // Fallback: simple scroll to bottom
          await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
          });
        }

        // Wait a bit more for lazy-loaded content
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Increased wait time

        // Extract champion data for this role
        const championData = await page.evaluate((currentRole) => {
          const rows = document.querySelectorAll('div[role="row"]');
          const champions = [];

          rows.forEach((row) => {
            try {
              // Get champion name from href
              const championLink = row.querySelector(
                'a[href*="/lol/champions/"]'
              );
              if (!championLink) return;

              const href = championLink.getAttribute("href");
              const championName = href.split("/")[3];

              // Get win rate - look for div with winrate class, then span > b inside it
              const winrateDiv = row.querySelector('div[class*="winrate"]');
              if (!winrateDiv) return;

              const winrateSpan = winrateDiv.querySelector("span b");
              if (!winrateSpan) return;

              const winrate = winrateSpan.textContent.trim();

              // Get counter champions from href attributes
              // Let's debug this step by step
              const counters = [];

              // Debug: Check what we can find in this row
              const allLinks = row.querySelectorAll("a[href]");
              const championFaces = row.querySelectorAll("div._champion-face");
              const buildLinks = row.querySelectorAll('a[href*="/build/"]');
              const championLinks = row.querySelectorAll(
                'a[href*="/lol/champions/"]'
              );

              // Log debug info for first champion only to avoid spam
              if (champions.length === 0) {
                console.log(`\n--- DEBUG for ${championName} ---`);
                console.log(`Total links in row: ${allLinks.length}`);
                console.log(`Champion faces found: ${championFaces.length}`);
                console.log(`Build links found: ${buildLinks.length}`);
                console.log(`Champion links found: ${championLinks.length}`);

                // Log first 10 href attributes we can find
                console.log(`First 10 hrefs:`);
                Array.from(allLinks)
                  .slice(0, 10)
                  .forEach((link, i) => {
                    const href = link.getAttribute("href");
                    console.log(`  ${i}: ${href}`);
                  });

                // Check if there are any elements with "counter" in their class names
                const counterElements = row.querySelectorAll(
                  '[class*="counter"], [class*="against"], [class*="vs"]'
                );
                console.log(
                  `Elements with counter-related classes: ${counterElements.length}`
                );

                // Check for any images or divs that might be champion portraits
                const images = row.querySelectorAll("img");
                const divs = row.querySelectorAll(
                  'div[style*="background-image"]'
                );
                console.log(`Images found: ${images.length}`);
                console.log(`Divs with background images: ${divs.length}`);

                // Log the innerHTML of the row (truncated) to see structure
                const innerHTML = row.innerHTML;
                console.log(`Row HTML length: ${innerHTML.length} characters`);
                console.log(
                  `First 500 chars: ${innerHTML.substring(0, 500)}...`
                );
              }

              // Try multiple approaches to find counters

              // Approach 1: Look for champion faces and get parent links
              championFaces.forEach((counterFace) => {
                const counterLink = counterFace.closest(
                  'a[href*="/lol/champions/"]'
                );
                if (counterLink) {
                  const counterHref = counterLink.getAttribute("href");
                  if (counterHref && counterHref.includes("/build/")) {
                    const counterChampion = counterHref.split("/")[3];
                    if (
                      counterChampion &&
                      counterChampion !== championName &&
                      !counters.includes(counterChampion)
                    ) {
                      counters.push(counterChampion);
                    }
                  }
                }
              });

              // Approach 2: Look for any links with /build/ in href
              buildLinks.forEach((counterLink) => {
                const counterHref = counterLink.getAttribute("href");
                if (counterHref && counterHref.includes("/lol/champions/")) {
                  const counterChampion = counterHref.split("/")[3];
                  if (
                    counterChampion &&
                    counterChampion !== championName &&
                    !counters.includes(counterChampion)
                  ) {
                    counters.push(counterChampion);
                  }
                }
              });

              // Approach 3: Look for links that aren't the main champion link
              championLinks.forEach((counterLink) => {
                const counterHref = counterLink.getAttribute("href");
                if (counterHref) {
                  const parts = counterHref.split("/");
                  if (parts.length >= 4) {
                    const counterChampion = parts[3];
                    // Add if it's different from main champion and contains build
                    if (
                      counterChampion &&
                      counterChampion !== championName &&
                      counterHref.includes("/build/") &&
                      !counters.includes(counterChampion)
                    ) {
                      counters.push(counterChampion);
                    }
                  }
                }
              });

              if (champions.length === 0) {
                console.log(`Counters found: [${counters.join(", ")}]`);
                console.log(`--- END DEBUG ---\n`);
              }

              if (championName && winrate) {
                champions.push({
                  name: championName,
                  winrate: winrate,
                  counters: counters,
                  buildLink: href,
                });
              }
            } catch (error) {
              console.log("Error processing row:", error.message);
            }
          });

          return champions;
        }, role);

        // Add this role's data to the overall dataset
        if (!allChampionData[role]) {
          allChampionData[role] = [];
        }
        allChampionData[role] = championData;

        console.log(`Found ${championData.length} ${role} champions`);

        // Log counter info for debugging
        const championsWithCounters = championData.filter(
          (c) => c.counters && c.counters.length > 0
        );
        console.log(
          `  ${championsWithCounters.length} champions have counter data`
        );

        // Add delay between pages to be respectful to the server
        if (role !== "support") {
          // Don't delay after the last page
          console.log("Waiting 3 seconds before next page...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (roleError) {
        console.error(`Error scraping ${role} page:`, roleError.message);
        console.log(`Skipping ${role} and continuing with next role...`);
        continue;
      }
    }

    // Display all results
    console.log(`\n=== COMPLETE RESULTS ===`);

    let totalChampions = 0;
    Object.values(allChampionData).forEach((champions) => {
      totalChampions += champions.length;
    });

    console.log(`Total champions found: ${totalChampions}\n`);

    // Display results by role
    Object.entries(allChampionData).forEach(([role, champions]) => {
      console.log(`\n${role.toUpperCase()} (${champions.length} champions):`);
      champions.forEach((champion, index) => {
        const counters = champion.counters || [];
        const counterText =
          counters.length > 0
            ? ` (countered by: ${counters.slice(0, 3).join(", ")}${
                counters.length > 3 ? "..." : ""
              })`
            : " (no counter data)";
        console.log(
          `  ${index + 1}. ${champion.name}: ${champion.winrate}${counterText}`
        );
      });
    });

    // Return the data for further processing if needed
    return allChampionData;
  } catch (error) {
    console.error("Error scraping u.gg:", error);
  } finally {
    await browser.close();
  }
}

// Helper function to scroll to bottom and trigger lazy loading
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      let scrollAttempts = 0;
      const maxAttempts = 200; // Prevent infinite loops

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollAttempts++;

        // Stop if we've reached the bottom OR if we've tried too many times
        if (
          totalHeight >= scrollHeight - window.innerHeight ||
          scrollAttempts >= maxAttempts
        ) {
          clearInterval(timer);
          resolve();
        }
      }, 50);
    });
  });
}

// Run the scraper
scrapeUGGChampions()
  .then((data) => {
    if (data && Object.keys(data).length > 0) {
      console.log("\n=== SCRAPING COMPLETED SUCCESSFULLY! ===");

      // Example: Save to JSON file
      const fs = require("fs");
      fs.writeFileSync("champions.json", JSON.stringify(data, null, 2));
      console.log("Data saved to champions.json");

      // Create a summary
      console.log("\nSummary:");
      Object.entries(data).forEach(([role, champions]) => {
        const withCounters = champions.filter(
          (c) => c.counters && c.counters.length > 0
        ).length;
        console.log(
          `  ${role}: ${champions.length} champions (${withCounters} with counter data)`
        );
      });
    }
  })
  .catch((error) => {
    console.error("Script failed:", error);
  });

// Export for use in other modules
module.exports = { scrapeUGGChampions };
