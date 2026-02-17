const express = require("express");
const fs = require("fs");
const { scrapeUGGChampions } = require("./scrape");
const app = express();
const PORT = 3000;
const JSON_FILE_PATH = "champions.json";

let lastUpdated = 0;

app.get("/champion-data", (req, res) => {
  fs.readFile(JSON_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).json({ error: "Failed to retrieve data" });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      res.status(500).json({ error: "Failed to parse JSON data" });
    }
  });
});

app.get("/update", async (req, res) => {
  const timeSinceLastUpdate = Date.now() - lastUpdated;
  const twelveHoursInMs = 12 * 60 * 60 * 1000; // 43200000ms

  // If last update was less than 12 hours ago, return message
  if (timeSinceLastUpdate < twelveHoursInMs && lastUpdated !== 0) {
    const hoursAgo = Math.floor(timeSinceLastUpdate / (60 * 60 * 1000));
    const minutesAgo = Math.floor(
      (timeSinceLastUpdate % (60 * 60 * 1000)) / (60 * 1000)
    );

    return res.status(429).json({
      message: `Data was last updated ${hoursAgo} hours and ${minutesAgo} minutes ago. Updates available every 12 hours.`,
    });
  }

  // Proceed with scraping if more than 12 hours have passed or first run
  try {
    lastUpdated = Date.now(); // Set timestamp before scraping

    const data = await scrapeUGGChampions();

    if (data && Object.keys(data).length > 0) {
      console.log("\n=== SCRAPING COMPLETED SUCCESSFULLY! ===");

      // Save to JSON file
      fs.writeFileSync("champions.json", JSON.stringify(data, null, 2));
      console.log("Data saved to champions.json");

      res.status(200).json({ message: "update success", data });

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
    } else {
      // Reset lastUpdated if scraping failed to get data
      lastUpdated = 0;
      res.status(500).json({ error: "No data retrieved from scraping" });
    }
  } catch (error) {
    console.error("Script failed:", error);
    // Reset lastUpdated if scraping failed
    lastUpdated = 0;
    res.status(500).json({ error: `Scraping failed: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
