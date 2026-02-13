import { useState } from 'react';
import '../styles/index.css';
import snowyData from '../../public/data/season_current.json';
import snowyNYData from '../../public/data/snowfall_ny.json';
import nyHofData from '../../public/data/ny_hof.json';
import coldData from '../../public/data/coldest_cities.json';
import CityHistory from './CityHistory';
import CityInfoModal from './CityInfoModal';
import Icon from './Icon';

/**
 * Compute trend percentage: how the city's snow pace compares to historical average.
 * Uses fraction of season elapsed (Oct 1 – Apr 30 ≈ 212 days).
 */
const computeTrend = (city) => {
    if (!city.avg_annual || city.avg_annual <= 0) return null;
    const SEASON_DAYS = 212;
    const seasonStart = new Date(new Date().getFullYear(), 9, 1); // Oct 1
    if (new Date() < seasonStart) seasonStart.setFullYear(seasonStart.getFullYear() - 1);
    const daysElapsed = Math.max(1, Math.floor((Date.now() - seasonStart.getTime()) / 86400000));
    const fractionElapsed = Math.min(daysElapsed / SEASON_DAYS, 1);
    const expectedPace = city.avg_annual * fractionElapsed;
    if (expectedPace <= 0) return null;
    return Math.round(((city.total_snow - expectedPace) / expectedPace) * 100);
};

/**
 * Compute rank change delta from previous_rank.
 * Positive = climbed (e.g. was 5, now 3 → +2).
 */
const getRankChange = (city) => {
    if (city.previous_rank == null) return 0;
    return city.previous_rank - city.rank;
};

/** Season progress: total_snow / avg_annual as percentage (capped at 150%) */
const getSeasonProgress = (city) => {
    if (!city.avg_annual || city.avg_annual <= 0) return null;
    return Math.min(Math.round((city.total_snow / city.avg_annual) * 100), 150);
};

/* ─── Sub-components ─── */

const RankChangeBadge = ({ city }) => {
    const delta = getRankChange(city);
    if (delta > 0) {
        return (
            <span className="rank-change rank-up" title={`Up ${delta} spot${delta > 1 ? 's' : ''}`}>
                <Icon name="arrow-up" className="rank-change-icon" />
                {delta}
            </span>
        );
    }
    if (delta < 0) {
        return (
            <span className="rank-change rank-down" title={`Down ${Math.abs(delta)} spot${Math.abs(delta) > 1 ? 's' : ''}`}>
                <Icon name="arrow-down" className="rank-change-icon" />
                {Math.abs(delta)}
            </span>
        );
    }
    return (
        <span className="rank-change rank-flat" title="No change">
            <Icon name="minus" className="rank-change-icon" />
        </span>
    );
};

const SeasonProgressBar = ({ city }) => {
    const pct = getSeasonProgress(city);
    if (pct == null) return null;
    return (
        <div className="season-progress" title={`${pct}% of seasonal average`}>
            <div className="season-progress-track">
                <div
                    className={`season-progress-fill ${pct >= 100 ? 'over' : pct >= 75 ? 'on-pace' : 'behind'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
            <span className="season-progress-label">{pct}%</span>
        </div>
    );
};

const TrendBadge = ({ city }) => {
    const trend = computeTrend(city);
    if (trend == null) return null;
    const isUp = trend > 5;
    const isDown = trend < -5;
    return (
        <span className={`trend-badge ${isUp ? 'trend-up' : isDown ? 'trend-down' : 'trend-flat'}`}>
            {isUp ? '↑' : isDown ? '↓' : '→'} {trend > 0 ? '+' : ''}{trend}%
        </span>
    );
};

const Leaderboard = ({ dataset, setDataset, theme }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'ny', 'hof'
    const [selectedCityId, setSelectedCityId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    const [limit, setLimit] = useState('all'); // 'all' | 10 | 25

    const isSnow = dataset === 'snow';
    const isHof = isSnow && filter === 'hof';

    // Determine which dataset to use based on mode and filter
    let data;
    if (dataset === 'cold') {
        data = coldData;
    } else if (filter === 'ny') {
        data = snowyNYData;
    } else if (filter === 'hof') {
        data = nyHofData;
    } else {
        data = snowyData;
    }

    const baseRankings = isHof ? data.records : data.rankings;

    const regions = Array.from(new Set(baseRankings.map(r => (isHof ? r.region : r.state)).filter(Boolean))).sort();

    const filteredRankings = baseRankings.filter((city) => {
        const cityName = (city.city || '').toLowerCase();
        const regionName = (isHof ? city.region : city.state || '').toLowerCase();
        const query = searchTerm.trim().toLowerCase();

        const matchesSearch = !query || cityName.includes(query) || regionName.includes(query);
        const matchesRegion = regionFilter === 'all' || regionName === regionFilter.toLowerCase();
        return matchesSearch && matchesRegion;
    });

    const limitedRankings = limit === 'all'
        ? filteredRankings
        : filteredRankings.slice(0, Number(limit));

    const top3 = limitedRankings.slice(0, 3);
    const rest = limitedRankings.slice(3);

    const lastUpdatedText = !isHof
        ? new Date(data.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        : '2026';

    const lastColLabel = isHof ? 'Season' : (isSnow ? 'Last 24h' : 'Windchill');
    const thirdColLabel = isSnow ? 'Total Snow' : 'Low Temp';
    const metricKey = isSnow ? 'total_snow' : 'lowest_temp';
    const metricUnit = isSnow ? '"' : '°F';

    const metricValues = limitedRankings.map(r => Number(r[metricKey]) || 0);
    const metricAvg = metricValues.length ? (metricValues.reduce((a, b) => a + b, 0) / metricValues.length).toFixed(1) : '—';
    const metricMax = metricValues.length ? Math.max(...metricValues).toFixed(1) : '—';
    const metricMin = metricValues.length ? Math.min(...metricValues).toFixed(1) : '—';

    // Podium Card Component
    const PodiumCard = ({ city, rank, onClick }) => {
        const isFirst = rank === 1;
        const isSecond = rank === 2;

        // Dynamic classes based on rank
        const cardClass = isFirst ? 'podium-card-1' : (isSecond ? 'podium-card-2' : 'podium-card-3');
        const delayClass = isFirst ? 'delay-200' : (isSecond ? 'delay-100' : 'delay-300');

        return (
            <div
                className={`podium-card ${cardClass} animate-fade-in ${delayClass}`}
                onClick={onClick}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
                aria-label={`${city.city}, rank ${rank}`}
            >
                {theme === 'light' ? (
                    <>
                        <div className="podium-rank-big">{rank}</div>
                        {isFirst && <div className="podium-crown-light"><Icon name="crown" /></div>}
                        <div className="podium-rank-title">
                            {isFirst ? 'Snowflake Supreme' : (isSecond ? 'Frostbyte' : 'Glacier Guard')}
                        </div>
                    </>
                ) : (
                    <div className="podium-rank-badge">
                        {isFirst && <Icon name="crown" className="crown-icon" />}
                        #{rank}
                    </div>
                )}

                <div className="podium-city-name">{city.city}</div>
                <div className="podium-city-state">{isHof ? city.region : city.state}</div>

                <div className="podium-value-container">
                    <span className="podium-value">
                        {isSnow ? `${city.total_snow}"` : `${city.lowest_temp}°F`}
                    </span>

                    {/* Computed trend replaces old hardcoded values */}
                    {isSnow && !isHof && <TrendBadge city={city} />}

                    {isSnow && !isHof && city.last_24h > 0 && (
                        <div className="podium-recent">+{city.last_24h}"</div>
                    )}
                </div>

                {/* Season progress bar on podium cards */}
                {isSnow && !isHof && <SeasonProgressBar city={city} />}

                {/* Rank change indicator */}
                {!isHof && <RankChangeBadge city={city} />}

                {isHof && (
                    <div className="podium-badge">
                        {city.is_state_record ? 'STATE RECORD' : 'LEGENDARY'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="leaderboard-container">
            <div className="glass-panel">
                {/* Header Section */}
                <div className="lb-header">
                    <div className="flex flex-col gap-0.5">
                        {/* Mode Toggle: Snowiest / Coldest */}
                        <div className="flex items-center gap-3 mb-1">
                            <button
                                onClick={() => { setDataset('snow'); setFilter('all'); }}
                                className={`mode-toggle-btn ${isSnow ? 'active' : ''}`}
                            >
                                <Icon name="snow" className="btn-icon" />
                                Snowiest
                            </button>
                            <button
                                onClick={() => { setDataset('cold'); setFilter('all'); }}
                                className={`mode-toggle-btn ${!isSnow ? 'active' : ''}`}
                            >
                                <Icon name="thermo" className="btn-icon" />
                                Coldest
                            </button>
                        </div>

                        {/* Live Indicator */}
                        {!isHof && (
                            <div className="live-indicator mb-2">
                                <div className="live-dot"></div>
                                <span>
                                    Live: {lastUpdatedText}
                                </span>
                            </div>
                        )}

                        {/* Title with Info Tooltip */}
                        <div className="flex items-center gap-2">
                            <h2 className="lb-title">
                                {isHof ? 'Hall of Frost Fame' : (isSnow ? 'Current Snowfall Standings' : 'Season Low Temperatures')}
                            </h2>
                            <div className="info-trigger">
                                <Icon name="info" className="info-icon" title="Info" />
                                <div className="info-tooltip">
                                    {isHof
                                        ? 'All-Time Multi-Decadal Records • Updated: 2026'
                                        : `Source: NOAA NCEI • Updated: ${lastUpdatedText}`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs (Snow mode only) */}
                    {isSnow && (
                        <div className="filter-group">
                            <button
                                onClick={() => setFilter('all')}
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            >
                                National
                            </button>
                            <button
                                onClick={() => setFilter('ny')}
                                className={`filter-btn ${filter === 'ny' ? 'active' : ''}`}
                            >
                                NY
                            </button>
                            <button
                                onClick={() => setFilter('hof')}
                                className={`filter-btn ${filter === 'hof' ? 'active' : ''}`}
                            >
                                <Icon name="trophy" className="btn-icon" />
                                Hall of Fame
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Bar */}
                <div className="summary-bar">
                    <div className="summary-item">
                        <span className="summary-label">Top City</span>
                        <span className="summary-value">{top3[0]?.city || '—'}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Updated</span>
                        <span className="summary-value">{lastUpdatedText}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">{isHof ? 'Records' : 'Stations'}</span>
                        <span className="summary-value">{baseRankings.length}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Mode</span>
                        <span className="summary-value">{isHof ? 'Hall of Fame' : (isSnow ? 'Snowfall' : 'Cold')}</span>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="controls-row">
                    <div className="search-wrap">
                        <Icon name="search" className="search-icon" />
                        <input
                            className="search-input"
                            placeholder={`Search ${isHof ? 'city or region' : 'city or state'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search cities"
                        />
                        {searchTerm && (
                            <button className="search-clear" onClick={() => setSearchTerm('')} aria-label="Clear search">
                                <Icon name="close" className="btn-icon" />
                            </button>
                        )}
                    </div>
                    <select
                        className="select-input"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        aria-label={isHof ? 'Filter by region' : 'Filter by state'}
                    >
                        <option value="all">{isHof ? 'All Regions' : 'All States'}</option>
                        {regions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    <div className="limit-group">
                        <button className={`limit-btn ${limit === 10 ? 'active' : ''}`} onClick={() => setLimit(10)}>Top 10</button>
                        <button className={`limit-btn ${limit === 25 ? 'active' : ''}`} onClick={() => setLimit(25)}>Top 25</button>
                        <button className={`limit-btn ${limit === 'all' ? 'active' : ''}`} onClick={() => setLimit('all')}>All</button>
                    </div>
                </div>

                {/* Microcards */}
                <div className="microcards-grid">
                    <div className="microcard">
                        <div className="micro-label">Average</div>
                        <div className="micro-value">{metricAvg}{metricUnit}</div>
                        <div className="micro-sub">Across {limitedRankings.length || 0} entries</div>
                    </div>
                    <div className="microcard">
                        <div className="micro-label">Maximum</div>
                        <div className="micro-value">{metricMax}{metricUnit}</div>
                        <div className="micro-sub">Current dataset peak</div>
                    </div>
                    <div className="microcard">
                        <div className="micro-label">Minimum</div>
                        <div className="micro-value">{metricMin}{metricUnit}</div>
                        <div className="micro-sub">Lowest recorded value</div>
                    </div>
                </div>

                {/* PODIUM SECTION */}
                <div className="podium-container">
                    {/* 2nd Place (Left) */}
                    {top3[1] && (
                        <div className="podium-column second">
                            <PodiumCard
                                city={top3[1]}
                                rank={2}
                                onClick={() => setSelectedCityId(isHof ? top3[1] : top3[1].id)}
                            />
                            <div className="podium-block block-2"></div>
                        </div>
                    )}

                    {/* 1st Place (Center - Highest) */}
                    {top3[0] && (
                        <div className="podium-column first">
                            <div className="winner-glow"></div>
                            <PodiumCard
                                city={top3[0]}
                                rank={1}
                                onClick={() => setSelectedCityId(isHof ? top3[0] : top3[0].id)}
                            />
                            <div className="podium-block block-1">
                                <div className="throne-accent"><Icon name="snow" /></div>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place (Right) */}
                    {top3[2] && (
                        <div className="podium-column third">
                            <PodiumCard
                                city={top3[2]}
                                rank={3}
                                onClick={() => setSelectedCityId(isHof ? top3[2] : top3[2].id)}
                            />
                            <div className="podium-block block-3"></div>
                        </div>
                    )}
                </div>

                {/* Data Table for Remainder */}
                <div className="table-container mt-4">
                    {limitedRankings.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-title">No results</div>
                            <div className="empty-subtitle">Try a different search or filter.</div>
                        </div>
                    )}
                    <table className="lb-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>City</th>
                                <th className="text-right">{thirdColLabel}</th>
                                {isSnow && !isHof && <th className="text-right">Progress</th>}
                                <th className="text-right">{lastColLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rest.map((city, idx) => (
                                <tr
                                    key={isHof ? city.rank : city.id}
                                    className={`${selectedCityId === (isHof ? city : city.id) ? 'selected-row' : ''} animate-fade-in`}
                                    style={{ animationDelay: `${idx * 30}ms` }}
                                    onClick={() => setSelectedCityId(isHof ? city : city.id)}
                                    tabIndex={0}
                                    role="button"
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedCityId(isHof ? city : city.id)}
                                >
                                    {/* Rank Badge + Change Indicator */}
                                    <td>
                                        <div className="rank-cell">
                                            <span className="rank-badge-simple">
                                                {city.rank}
                                            </span>
                                            {!isHof && <RankChangeBadge city={city} />}
                                        </div>
                                    </td>

                                    {/* City Name & State */}
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="city-name-sm">{city.city}</span>
                                            <span className="city-state">
                                                {isHof ? city.region : (city.state + (!isSnow ? ` • ${city.record_date}` : ''))}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Total Snow / Low Temp */}
                                    <td className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`font-mono font-bold ${!isSnow ? 'text-blue-700' : 'val-total-sm'}`}>
                                                {isSnow ? `${city.total_snow}"` : `${city.lowest_temp}°F`}
                                            </span>

                                            {isSnow && !isHof && <TrendBadge city={city} />}
                                        </div>
                                    </td>

                                    {/* Season Progress (snow mode only) */}
                                    {isSnow && !isHof && (
                                        <td className="text-right">
                                            <SeasonProgressBar city={city} />
                                        </td>
                                    )}

                                    {/* Last 24h / Windchill */}
                                    <td className="text-right">
                                        <div className="flex flex-col items-end">
                                            {isHof ? (
                                                <span className="font-mono text-slate-600 font-bold text-xs">{city.season}</span>
                                            ) : (
                                                isSnow ? (
                                                    city.last_24h > 0 ? (
                                                        <span className="font-mono val-recent-sm">+{city.last_24h}"</span>
                                                    ) : (
                                                        <span className="font-mono text-slate-400 text-xs">—</span>
                                                    )
                                                ) : (
                                                    <span className="font-mono text-blue-900 font-bold text-xs">{city.lowest_windchill}°F</span>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for City Details */}
            {selectedCityId && (
                isHof ? (
                    <CityInfoModal
                        city={selectedCityId}
                        onClose={() => setSelectedCityId(null)}
                    />
                ) : (
                    <CityHistory
                        cityId={selectedCityId}
                        cityName={data.rankings.find(c => c.id === selectedCityId)?.city}
                        inline={false}
                        onClose={() => setSelectedCityId(null)}
                    />
                )
            )}
        </div>
    );
};

export default Leaderboard;
