import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CITIES_PATH = path.join(__dirname, '../src/data/cities.json');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'history.json');

// 20 Seasons: 2005-2006 to 2024-2025
// Note: Season "2025" implies the season ending in 2025 (Winter 2024-25).
const START_YEAR = 2005;
const END_YEAR = 2025;

// Start Date: Sept 1, 2004 (Start of Season ending in 2005)
const API_START_DATE = '2004-09-01';
const API_END_DATE = '2025-06-30';

async function fetchHistory() {
    console.log('📜 Starting Historical Snowfall Data Collection (20 Years)...');

    // 1. Ensure output directory exists
    try {
        await fs.mkdir(OUTPUT_DIR, { recursive: true });
    } catch (err) {
        console.error('Failed to create output directory:', err);
    }

    // 2. Read Cities
    let cities;
    try {
        const rawData = await fs.readFile(CITIES_PATH, 'utf-8');
        cities = JSON.parse(rawData);
        console.log(`Loaded ${cities.length} cities.`);
    } catch (err) {
        console.error('Error reading cities.json:', err);
        process.exit(1);
    }

    const historyData = {
        meta: {
            generated_at: new Date().toISOString(),
            start_season: START_YEAR,
            end_season: END_YEAR
        },
        cities: {}
    };

    // 3. Fetch Data for each city
    for (const city of cities) {
        console.log(`Fetching history for ${city.name} (${city.state})...`);

        // We fetch the entire range in one go. Open-Meteo handles multi-year requests well for daily data.
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${API_START_DATE}&end_date=${API_END_DATE}&daily=snowfall_sum&timezone=America%2FNew_York&precipitation_unit=inch`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const dailySnow = data.daily.snowfall_sum;
            const dates = data.daily.time;

            if (!dailySnow || dailySnow.length !== dates.length) {
                console.warn(`Mismatch or missing data for ${city.name}`);
                continue;
            }

            // Process into Seasons
            // Season 2005 = Sept 2004 to June 2005
            const seasons = {};

            // Initialize buckets
            for (let y = START_YEAR; y <= END_YEAR; y++) {
                seasons[y] = 0;
            }

            dates.forEach((dateStr, index) => {
                const snow = dailySnow[index];
                if (snow === null || snow === undefined) return;

                const date = new Date(dateStr);
                const month = date.getMonth() + 1; // 1-12
                const year = date.getFullYear();

                // Determine Season Year
                // If Month is 9-12 (Sep-Dec), it belongs to the NEXT year's season.
                // e.g. Dec 2004 -> Season 2005
                // If Month is 1-6 (Jan-Jun), it belongs to the CURRENT year's season.
                // e.g. Feb 2005 -> Season 2005
                // We ignore July/August (months 7, 8) as off-season for this logic, or count them towards the starting season.

                let seasonYear;
                if (month >= 9) {
                    seasonYear = year + 1;
                } else if (month <= 6) {
                    seasonYear = year;
                } else {
                    // July/Aug - slight edge case, usually 0 snow. map to coming season (year+1)?
                    // Let's ignore summer snow for simplicity or map to year+1
                    seasonYear = year + 1;
                }

                if (seasons[seasonYear] !== undefined) {
                    seasons[seasonYear] += snow;
                }
            });

            // Round totals
            for (const y in seasons) {
                seasons[y] = parseFloat(seasons[y].toFixed(1));
            }

            historyData.cities[city.id] = seasons;

            // Rate limit niceness: 3.5 seconds required to avoid hitting hourly/minute minute
            await new Promise(r => setTimeout(r, 3500));

        } catch (err) {
            console.error(`Failed to fetch history for ${city.name}:`, err.message);
            // Simple retry once after long delay
            await new Promise(r => setTimeout(r, 10000));
            try {
                console.log(`Retrying ${city.name}...`);
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const dailySnow = data.daily.snowfall_sum;
                    const dates = data.daily.time;

                    // Process only if valid
                    if (dailySnow && dailySnow.length === dates.length) {
                        const seasons = {};
                        for (let y = START_YEAR; y <= END_YEAR; y++) seasons[y] = 0;
                        dates.forEach((dateStr, index) => {
                            const snow = dailySnow[index];
                            if (snow != null) {
                                const date = new Date(dateStr);
                                const month = date.getMonth() + 1;
                                const year = date.getFullYear();
                                let seasonYear = month >= 9 ? year + 1 : (month <= 6 ? year : year + 1);
                                if (seasons[seasonYear] !== undefined) seasons[seasonYear] += snow;
                            }
                        });
                        for (const y in seasons) seasons[y] = parseFloat(seasons[y].toFixed(1));
                        historyData.cities[city.id] = seasons;
                        console.log(`Retry successful for ${city.name}`);
                    }
                }
            } catch (retryErr) {
                console.error(`Retry failed for ${city.name}:`, retryErr.message);
            }
        }
    }

    // 4. Save to File
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(historyData, null, 2));
    console.log(`Successfully wrote historical data to ${OUTPUT_PATH}`);
}

fetchHistory();
