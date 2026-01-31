import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CITIES_PATH = path.join(__dirname, '../src/data/cities.json');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'season_current.json');

const SEASON_START = '2025-09-01'; // Start of the snow season

async function fetchSnowData() {
  console.log('❄️  Starting Snowfall Data Collection...');
  
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

  // 3. Define Date Range (Yesterday to ensure data availability)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const endDate = yesterday.toISOString().split('T')[0];
  
  // Check if season hasn't started
  if (new Date(endDate) < new Date(SEASON_START)) {
      console.log("Season hasn't started yet!");
      return;
  }

  const results = [];

  // 4. Fetch Data for each city
  // We process sequentially or in small batches to be nice to the API
  for (const city of cities) {
    console.log(`Fetching data for ${city.name} (${city.state})...`);
    
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${SEASON_START}&end_date=${endDate}&daily=snowfall_sum&timezone=America%2FNew_York&precipitation_unit=inch`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Calculate Total Snowfall
      const dailySnow = data.daily?.snowfall_sum || [];
      // Handle nulls (sometimes API returns null for recent hours)
      const totalSnow = dailySnow.reduce((acc, val) => acc + (val || 0), 0);
      
      // Get last 24h (last entry in the array)
      const last24h = dailySnow.length > 0 ? (dailySnow[dailySnow.length - 1] || 0) : 0;

      results.push({
        rank: 0, // Placeholder, calculated below
        city: city.name,
        state: city.state,
        id: city.id,
        tags: city.tags,
        total_snow: parseFloat(totalSnow.toFixed(1)),
        last_24h: parseFloat(last24h.toFixed(1)),
        history_20_years: [] // To be filled later if needed, or separate file
      });

      // Small delay
      await new Promise(r => setTimeout(r, 200));

    } catch (err) {
      console.error(`Failed to fetch ${city.name}:`, err.message);
      // Push specific error structure or skip?
      // We'll skip for now to clean up later or retry
    }
  }

  // 5. Rank Results
  // Sort descending by total_snow
  results.sort((a, b) => b.total_snow - a.total_snow);

  // Assign Ranks
  results.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  // 6. Save to File
  const outputData = {
    last_updated: new Date().toISOString(),
    season_start: SEASON_START,
    season_end: endDate,
    rankings: results
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
  console.log(`Successfully wrote data to ${OUTPUT_PATH}`);
}

fetchSnowData();
