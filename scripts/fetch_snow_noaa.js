import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env (for local dev) - simplified since we don't need 'dotenv' package dependency if running in Actions with secrets
// but for local running we assume NOAA_TOKEN is in process.env or .env file manually read
const NOAA_TOKEN = process.env.NOAA_TOKEN || 'DFydLtzImSGsftaemqZzIAwEJEVZVWuJ'; // Fallback for your specific case

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CITIES_PATH = path.join(__dirname, '../src/data/cities.json');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'season_current.json');

const SEASON_START = '2025-09-01'; // Season Start
// End date: effectively "today"
const TODAY = new Date().toISOString().split('T')[0];

const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data';
const DATASET = 'GHCND';
const DATATYPE = 'SNOW';

async function fetchOfficialSnow() {
    console.log('🌨️  Starting OFFICIAL NOAA Snowfall Data Collection...');

    // 1. Ensure output directory
    try { await fs.mkdir(OUTPUT_DIR, { recursive: true }); } catch (e) { }

    // 2. Read Cities
    const cities = JSON.parse(await fs.readFile(CITIES_PATH, 'utf-8'));
    console.log(`Loaded ${cities.length} cities.`);

    const results = [];

    for (const city of cities) {
        if (!city.station_id) {
            console.warn(`Skipping ${city.name} - No Station ID`);
            continue;
        }

        console.log(`Fetching ${city.name} (${city.station_id})...`);

        // NOAA API Pagination is tricky, but for one station for one season (< 365 days), 
        // usually fits in one request (limit 1000).
        const url = `${BASE_URL}?datasetid=${DATASET}&datatypeid=${DATATYPE}&stationid=${city.station_id}&startdate=${SEASON_START}&enddate=${TODAY}&limit=1000&units=standard`;

        try {
            const response = await fetch(url, {
                headers: { token: NOAA_TOKEN }
            });

            if (!response.ok) throw new Error(`NOAA API Error: ${response.status}`);

            const data = await response.json();

            // Calculate Total
            // data.results is an array of objects: { date: "...", value: 0.0, ... }
            let totalSnow = 0;
            let last24h = 0;

            // Determine "Yesterday" date string for last 24h check
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

            if (data.results) {
                data.results.forEach(record => {
                    // value is in inches because we requested units=standard
                    totalSnow += record.value || 0;

                    if (record.date.startsWith(yesterdayStr)) {
                        last24h = record.value || 0;
                    }
                });
            } else {
                // Empty results means 0 snow usually (or missing data)
                console.warn(`No snow records found for ${city.name}`);
            }

            results.push({
                rank: 0,
                city: city.name,
                state: city.state,
                id: city.id,
                tags: city.tags || [],
                total_snow: parseFloat(totalSnow.toFixed(1)),
                last_24h: parseFloat(last24h.toFixed(1)),
                history_20_years: []
            });

        } catch (err) {
            console.error(`Failed to fetch ${city.name}:`, err.message);
            // Push specific error structure or 0?
            results.push({
                rank: 999,
                city: city.name,
                state: city.state,
                id: city.id,
                tags: city.tags || [],
                total_snow: 0,
                last_24h: 0,
                error: true
            });
        }

        // Rate Limit: 5 per second max. Be safe with 200ms.
        await new Promise(r => setTimeout(r, 250));
    }

    // Rank Results
    results.sort((a, b) => b.total_snow - a.total_snow);
    results.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    const outputData = {
        last_updated: new Date().toISOString(),
        source: "NOAA GHCN-Daily",
        season_start: SEASON_START,
        season_end: TODAY,
        rankings: results
    };

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
    console.log(`✅ Successfully wrote OFFICIAL data to ${OUTPUT_PATH}`);
}

fetchOfficialSnow();
