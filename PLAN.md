# The Battle Brrr-oyale: Implementation Plan

## 1. Project Overview
"The Battle Brrr-oyale" is a gamified weather tracking web application that ranks cities based on their snowfall totals. The app adds a competitive "Battle Royale" twist to weather tracking, focusing on the top 50 US cities and the top 10 cities in New York State.

### Core Goals
- **Automated Data Collection**: Self-updating snowfall statistics.
- **Historical Analysis**: 20-year history for context and trends.
- **Engagement**: Fun, game-like atmosphere with contests and rankings.
- **Accessibility**: Hosted freely on GitHub Pages.

---

## 2. Architecture & Technology Stack

### Frontend
- **Framework**: React (built with Vite for speed and simplicity).
- **Styling**: Vanilla CSS (CSS Modules or standard CSS) to create a custom, high-end "frosty" aesthetic without framework constraints.
- **Visualization**: Chart.js or Recharts for historical data graphs.
- **State Management**: React Context or Zustand (lightweight).

### Data & Backend (Serverless)
Since the app is hosted on GitHub Pages (static hosting), we cannot have a running backend server. We will use a **"Static Data" approach** with automation:
- **Source**: Open-Meteo API (Free, requires no API key, excellent historical data) or NOAA API.
- **Automation**: A **GitHub Actions Workflow** scheduled to run daily (e.g., at 6 AM EST).
    - *Step 1*: Runs a script (Node.js or Python) to fetch latest snowfall data for all 60 cities.
    - *Step 2*: Updates a structured JSON file (`data/season_current.json`).
    - *Step 3*: Commits the updated data to the repository.
    - *Step 4*: Triggers a rebuild/deploy of the GitHub Pages site.
- **Storage**: JSON files in the repository serve as the "database".

### Hosting
- **Platform**: GitHub Pages.
- **Deployment**: Automated via GitHub Actions on push to `main` (and after the daily data update).

---

## 3. Data Strategy

### City Selection
We will maintain a `cities.json` configuration file containing:
- **Top 50 US Cities**: Selected by population or known snowy reputation (e.g., Buffalo, Syracuse, Denver, Anchorage).
- **Top 10 NY Cities**: Specific focus group (e.g., NYC, Albany, Rochester, Binghamton).
- **Metadata**: Name, State, Coordinates (Lat/Lon), Population (for tier weighting if desired).

### Data Structure
1.  **`history.json`**: Pre-fetched 20-season historical data (static, updated once annually).
    ```json
    {
      "Syracuse, NY": {
        "2004-2005": 110.5,
        "2005-2006": 98.2,
        ...
      }
    }
    ```
2.  **`leaderboard.json`** (Daily Updated):
    ```json
    {
      "last_updated": "2026-01-30T12:00:00Z",
      "rankings": [
        { "rank": 1, "city": "Buffalo, NY", "total_snow": 85.4, "last_24h": 4.2 },
        { "rank": 2, "city": "Erie, PA", "total_snow": 82.1, "last_24h": 0.0 }
      ]
    }
    ```

---

## 4. User Experience (UX) & Design
*Theme: "Winter Warzone" meets "Friendly Competition"*

### Visual Language
- **Palette**: Icy blues, deep navy, crisp whites, and "warning" oranges/reds for storm alerts.
- **Typography**: Bold, impactful headers (like a sports scoreboard) paired with clean readable sans-serif.
- **Effects**:
    - *Glassmorphism*: Translucent UI cards on frosted backgrounds.
    - *Micro-animations*: Subtle falling snow in the background; shivering animations for cities with active snowfall.

### Key Pages/Views
1.  **The Arena (Homepage)**:
    - **Live Leaderboard**: The main event. A dynamic list ranking cities #1 to #60.
    - **"The Podium"**: Top 3 cities displayed prominently with medals/crowns.
    - **"Snow-news Ticker"**: Scrolling marquee showing recent big dumps (e.g., "Syracuse just got 6 inches!").
2.  **City Dossier (Detail View)**:
    - Drill down into a specific city.
    - Show current season progress vs. historical average (Line chart).
    - "Badges": Award badges like "Snow Globe" (Consistent snow) or "Blizzard King" (Huge single-day totals).
3.  **The Archives (History)**:
    - Interactive comparison tool.
    - "Year-over-Year" battle: Compare the current season to the legendary "Winter of '15".
4.  **Contests (Gamification)**:
    - **"Golden Snowball" Prediction**: Users vote on who will win the week/season. (Note: Requires local storage or a simple BaaS like Firebase if we want global user stats, otherwise we can do "Browser-based" personal scorecards).

---

## 5. Development Roadmap

### Phase 1: Foundation (Days 1-2)
- [ ] Initialize React + Vite project.
- [ ] Configure `cities.json` with lat/lon for all 60 targets.
- [ ] Create the data-fetching script (Python/Node) to pull measurements from Open-Meteo.
- [ ] Setup GitHub Action to test the data fetch.

### Phase 2: Core UI (Days 3-4)
- [ ] Build the "Frosty" Design System (CSS variables, base styles).
- [ ] Implement the Main Leaderboard component.
- [ ] Connect frontend to the local JSON data (mocked initially).

### Phase 3: History & Charts (Days 5-6)
- [ ] Ingest 20 years of historical data (one-time script).
- [ ] Build Chart components for City Details.
- [ ] Add "Versus" mode (City vs City comparison).

### Phase 4: Automation & Polish (Day 7)
- [ ] Finalize GitHub Action for daily updates.
- [ ] Add animations (falling snow, ranking swaps).
- [ ] SEO Optimization (Meta tags for sharing).
- [ ] Deploy to GitHub Pages.

---

## 6. Future Expansion Ideas
- **"Storm Watch"**: Real-time alerts using NWS severe weather feeds.
- **User Accounts**: Let users "reside" in a city and contribute to a "Spirit Score".
- **Global Expansion**: Add Canadian or European snow capitals.
