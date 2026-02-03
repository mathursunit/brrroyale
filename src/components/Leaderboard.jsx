import { useState, useEffect } from 'react';
import '../styles/index.css';
import snowyData from '../../public/data/season_current.json';
import snowyNYData from '../../public/data/snowfall_ny.json';
import nyHofData from '../../public/data/ny_hof.json';
import coldData from '../../public/data/coldest_cities.json';
import CityHistory from './CityHistory';
import CityInfoModal from './CityInfoModal';

const Leaderboard = ({ dataset, setDataset, theme }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'ny', 'hof'
    const [selectedCityId, setSelectedCityId] = useState(null);

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

    const allRankings = isHof ? data.records : data.rankings;
    const top3 = allRankings.slice(0, 3);
    const rest = allRankings.slice(3);

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
            >
                {theme === 'light' ? (
                    <>
                        <div className="podium-rank-big">{rank}</div>
                        {isFirst && <div className="podium-crown-light">👑</div>}
                        <div className="podium-rank-title">
                            {isFirst ? 'Snowflake Supreme' : (isSecond ? 'Frostbyte' : 'Glacier Guard')}
                        </div>
                    </>
                ) : (
                    <div className="podium-rank-badge">
                        {isFirst && <span className="crown-icon">👑</span>}
                        #{rank}
                    </div>
                )}

                <div className="podium-city-name">{city.city}</div>
                <div className="podium-city-state">{isHof ? city.region : city.state}</div>

                <div className="podium-value-container">
                    <span className="podium-value">
                        {isSnow ? `${city.total_snow}"` : `${city.lowest_temp}°F`}
                    </span>
                    {theme === 'light' ? (
                        <div className={`podium-trend ${isFirst ? 'up' : (isSecond ? 'flat' : 'down')}`}>
                            {isFirst ? '↗ +25%' : (isSecond ? '→ 0%' : '↓ -5%')}
                        </div>
                    ) : (
                        isSnow && !isHof && city.last_24h > 0 && (
                            <div className="podium-recent">+{city.last_24h}"</div>
                        )
                    )}
                </div>

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
                                ❄️ Snowiest
                            </button>
                            <button
                                onClick={() => { setDataset('cold'); setFilter('all'); }}
                                className={`mode-toggle-btn ${!isSnow ? 'active' : ''}`}
                            >
                                🥶 Coldest
                            </button>
                        </div>

                        {/* Live Indicator */}
                        {!isHof && (
                            <div className="live-indicator mb-2">
                                <div className="live-dot"></div>
                                <span>
                                    Live: {new Date(data.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </span>
                            </div>
                        )}

                        {/* Title with Info Tooltip */}
                        <div className="flex items-center gap-2">
                            <h2 className="lb-title">
                                {isHof ? '🏆 Hall of Frost Fame' : (isSnow ? 'Current Snowfall Standings' : 'Season Low Temperatures')}
                            </h2>
                            <div className="info-trigger">
                                <span className="info-icon">ⓘ</span>
                                <div className="info-tooltip">
                                    {isHof
                                        ? 'All-Time Multi-Decadal Records • Updated: 2026'
                                        : `Source: NOAA NCEI • Updated: ${new Date(data.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`}
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
                                🏆 Hall of Fame
                            </button>
                        </div>
                    )}
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
                                <div className="throne-accent">❄</div>
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
                    <table className="lb-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>City</th>
                                <th className="text-right">{isSnow ? 'Total Snow' : 'Low Temp'}</th>
                                <th className="text-right">{isSnow ? 'Last 24h' : 'Windchill'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rest.map((city) => (
                                <tr
                                    key={isHof ? city.rank : city.id}
                                    className={`${selectedCityId === (isHof ? city : city.id) ? 'selected-row' : ''}`}
                                    onClick={() => setSelectedCityId(isHof ? city : city.id)}
                                >
                                    {/* Rank Badge - Simple for list items */}
                                    <td>
                                        <span className="rank-badge-simple">
                                            {city.rank}
                                        </span>
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

                                            {isSnow && !isHof && city.avg_annual > 0 && (
                                                <span className="text-[10px] text-slate-500">
                                                    Avg: {city.avg_annual}"
                                                </span>
                                            )}
                                        </div>
                                    </td>

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
