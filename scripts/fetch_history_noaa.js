import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN = process.env.NOAA_TOKEN;

if (!TOKEN) {
    console.error("❌ Error: NOAA_TOKEN not found in .env file.");
    process.exit(1);
}

// Configuration
const START_YEAR = 2005;
const END_YEAR = 2025;
const CITIES_PATH = path.join(__dirname, '../src/data/cities.json');
const OUTPUT_PATH = path.join(__dirname, '../public/data/history.json');
const BASE_URL = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data';

// Helper: Delay to respect API rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHistory() {
    console.log("📚 Starting OFFICIAL 20-Year NOAA Snowfall Archive...");

    // Read cities
    const citiesRaw = fs.readFileSync(CITIES_PATH, 'utf8');
    const cities = JSON.parse(citiesRaw);

    const historyData = {
        meta: {
            generated_at: new Date().toISOString(),
            source: "NOAA NCEI (GHCND)",
            start_season: START_YEAR,
            end_season: END_YEAR
        },
        cities: {}
    };

    for (const city of cities) {
        if (!city.station_id) {
            console.warn(`⚠️ Skipping ${city.name} (No Station ID)`);
            continue;
        }

        console.log(`\nProcessing ${city.name} [${city.station_id}]...`);
        const cityHistory = {};

        // Iterate years
        for (let year = START_YEAR; year <= END_YEAR; year++) {
            // Define Season: e.g. "2005" season = July 2004 to June 2005? 
            // Or usually "2004-2005" season.
            // Let's stick to "Season ending in Year X". 
            // So "2005 Season" = Sep 1, 2004 -> Jun 30, 2005.

            const startDate = `${year - 1}-09-01`;
            const endDate = `${year}-06-30`;

            const url = `${BASE_URL}?datasetid=GHCND&datatypeid=SNOW&stationid=${city.station_id}&startdate=${startDate}&enddate=${endDate}&limit=1000&units=standard`;

            try {
                // Retry logic
                let attempts = 0;
                let success = false;
                let data = null;

                while (attempts < 3 && !success) {
                    try {
                        const response = await fetch(url, { headers: { token: TOKEN } });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        data = await response.json();
                        success = true;
                    } catch (e) {
                        attempts++;
                        console.log(`   - Retry ${attempts} for ${year}...`);
                        await delay(2000 * attempts);
                    }
                }

                if (success && data && data.results) {
                    // Sum up snowfall for this season
                    // NOAA 'standard' units for SNOW is Inches. 
                    // However, sometimes values are weird. 
                    // Usually CDO V2 standard = Inches. 
                    let seasonTotal = 0;
                    data.results.forEach(record => {
                        // record.value is the snowfall amount
                        if (record.value && record.value > 0) {
                            seasonTotal += record.value;
                        }
                    });

                    // Store result (rounded to 1 decimal)
                    cityHistory[year] = parseFloat(seasonTotal.toFixed(1));
                    process.stdout.write(` ${year}:${cityHistory[year]}"`);
                } else {
                    // No data found or error (some stations have gaps)
                    cityHistory[year] = 0; // Or null? 0 is safer for charts
                    process.stdout.write(` ${year}:X`);
                }

                // Rate limit niceness (NOAA is 5 req/sec, we are doing serial so we are fine, but be nice)
                await delay(250);

            } catch (err) {
                console.error(`\n❌ Failed year ${year} for ${city.name}: ${err.message}`);
            }
        }

        historyData.cities[city.id] = cityHistory;
    }

    // Save File
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(historyData, null, 2));
    console.log(`\n\n✅ History Archive Saved to ${OUTPUT_PATH}`);
}

fetchHistory();
