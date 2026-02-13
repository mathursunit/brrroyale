import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// NOAA token must be provided via environment variable (e.g. GitHub Secrets)
const NOAA_TOKEN = process.env.NOAA_TOKEN;
if (!NOAA_TOKEN) {
    console.error('❌ ERROR: NOAA_TOKEN environment variable is required.');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CITIES_PATH = path.join(__dirname, '../src/data/cities.json');
const PUBLIC_DATA_DIR = path.join(__dirname, '../public/data');

const SEASON_START = '2025-09-01';
const TODAY = new Date().toISOString().split('T')[0];
const BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data';

// Storm event threshold (inches in 24h)
const STORM_THRESHOLD = 4.0;

async function fetchNoaaData(stationId, dataType) {
    const url = `${BASE_URL}?datasetid=GHCND&datatypeid=${dataType}&stationid=${stationId}&startdate=${SEASON_START}&enddate=${TODAY}&limit=1000&units=standard`;
    try {
        const response = await fetch(url, { headers: { token: NOAA_TOKEN } });
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
}

/**
 * Read existing rankings from a JSON file to capture previous_rank.
 * Returns a Map of city_id -> rank.
 */
async function readPreviousRanks(filePath) {
    try {
        const raw = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const rankings = raw.rankings || raw.records || [];
        const map = new Map();
        rankings.forEach(r => map.set(r.id, r.rank));
        return map;
    } catch {
        return new Map(); // File doesn't exist yet
    }
}

async function updateAll() {
    console.log('🔄 Starting Full Data Refresh...');

    const cities = JSON.parse(await fs.readFile(CITIES_PATH, 'utf-8'));
    const snowResults = [];
    const coldResults = [];

    for (const city of cities) {
        console.log(`Processing ${city.name}...`);

        // 🌨️ SNOWFALL
        const snowData = await fetchNoaaData(city.station_id, 'SNOW');
        let totalSnow = 0;
        let last24h = 0;
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (snowData?.results) {
            snowData.results.forEach(r => {
                totalSnow += r.value || 0;
                if (r.date.startsWith(yesterdayStr)) last24h = r.value || 0;
            });
        }

        const snowEntry = {
            id: city.id,
            city: city.name,
            state: city.state,
            total_snow: parseFloat(totalSnow.toFixed(1)),
            last_24h: parseFloat(last24h.toFixed(1)),
            avg_annual: city.annual_average || 0,
            tags: city.tags || []
        };
        snowResults.push(snowEntry);

        // 🌡️ TEMPERATURE (TMIN)
        const tempData = await fetchNoaaData(city.station_id, 'TMIN');
        let seasonLow = null;
        let recordDate = '-';

        if (tempData?.results) {
            tempData.results.forEach(r => {
                if (seasonLow === null || r.value < seasonLow) {
                    seasonLow = r.value;
                    recordDate = new Date(r.date.split('T')[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
            });
        }

        if (seasonLow !== null) {
            coldResults.push({
                id: city.id,
                city: city.name,
                state: city.state,
                lowest_temp: seasonLow,
                lowest_windchill: seasonLow - 5, // Simulated windchill offset
                record_date: recordDate,
                all_time_low: city.all_time_low || -40,
                all_time_windchill: (city.all_time_low || -40) - 10,
                tags: city.tags || []
            });
        }

        await new Promise(r => setTimeout(r, 250)); // Rate limit safety
    }

    // Read previous ranks before overwriting
    const prevNational = await readPreviousRanks(path.join(PUBLIC_DATA_DIR, 'season_current.json'));
    const prevNY = await readPreviousRanks(path.join(PUBLIC_DATA_DIR, 'snowfall_ny.json'));
    const prevCold = await readPreviousRanks(path.join(PUBLIC_DATA_DIR, 'coldest_cities.json'));

    // 1. Generate National Snowfall (with previous_rank and storm_events)
    const nationalRankings = [...snowResults]
        .filter(c => c.tags.includes('US_Top10'))
        .sort((a, b) => b.total_snow - a.total_snow)
        .map((c, i) => ({
            ...c,
            rank: i + 1,
            previous_rank: prevNational.get(c.id) || i + 1
        }));

    // Generate storm events from any city with notable 24h snowfall
    const stormEvents = snowResults
        .filter(c => c.last_24h >= STORM_THRESHOLD)
        .sort((a, b) => b.last_24h - a.last_24h)
        .map(c => ({
            city: c.city,
            state: c.state,
            snow_24h: c.last_24h,
            message: `${c.city} just got ${c.last_24h}" of fresh powder!`
        }));

    const nationalSnow = {
        last_updated: new Date().toISOString(),
        storm_events: stormEvents,
        rankings: nationalRankings
    };
    await fs.writeFile(path.join(PUBLIC_DATA_DIR, 'season_current.json'), JSON.stringify(nationalSnow, null, 2));

    // 2. Generate NY Snowfall (with previous_rank)
    const nySnow = {
        last_updated: new Date().toISOString(),
        rankings: [...snowResults]
            .filter(c => c.tags.includes('NY_Top10'))
            .sort((a, b) => b.total_snow - a.total_snow)
            .map((c, i) => ({
                ...c,
                rank: i + 1,
                previous_rank: prevNY.get(c.id) || i + 1
            }))
    };
    await fs.writeFile(path.join(PUBLIC_DATA_DIR, 'snowfall_ny.json'), JSON.stringify(nySnow, null, 2));

    // 3. Generate Coldest Cities (with previous_rank)
    const coldest = {
        last_updated: new Date().toISOString(),
        rankings: [...coldResults]
            .sort((a, b) => a.lowest_temp - b.lowest_temp)
            .slice(0, 20)
            .map((c, i) => ({
                ...c,
                rank: i + 1,
                previous_rank: prevCold.get(c.id) || i + 1
            }))
    };
    await fs.writeFile(path.join(PUBLIC_DATA_DIR, 'coldest_cities.json'), JSON.stringify(coldest, null, 2));

    console.log(`✅ All data files updated! Storm events: ${stormEvents.length}`);
}

updateAll();
