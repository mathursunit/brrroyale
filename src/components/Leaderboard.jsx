import { useState, useEffect } from 'react';
import '../styles/index.css';
import snowyData from '../../public/data/season_current.json';
import snowyNYData from '../../public/data/snowfall_ny.json';
import nyHofData from '../../public/data/ny_hof.json';
import coldData from '../../public/data/coldest_cities.json';
import CityHistory from './CityHistory';
import CityInfoModal from './CityInfoModal';

const Leaderboard = ({ dataset, setDataset }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'ny'
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

    const filteredRankings = isHof ? data.records : data.rankings;

    return (
        <div className="leaderboard-container glass-panel">
            <div className="lb-header">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3 mb-1">
                        <button
                            onClick={() => { setDataset('snow'); setFilter('all'); }}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${isSnow ? 'bg-sky-600 text-white shadow-lg' : 'bg-white/50 text-slate-600 hover:bg-white/80'}`}
                        >
                            SNOWFALL
                        </button>
                        <button
                            onClick={() => { setDataset('cold'); setFilter('all'); }}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${!isSnow ? 'bg-blue-800 text-white shadow-lg' : 'bg-white/50 text-slate-600 hover:bg-white/80'}`}
                        >
                            COLDEST
                        </button>
                    </div>

                    {!isHof && (
                        <div className="flex items-center gap-1.5 ml-1 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                Live: {new Date(data.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <h2 className="lb-title">
                            {isHof ? 'NY Snowfall Hall of Fame' : (isSnow ? 'Current Snowfall Standings' : '2025-2026 Season Lows')}
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

            <div className="table-container">
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
                        {filteredRankings.map((city, index) => (
                            <tr
                                key={isHof ? city.rank : city.id}
                                className={`${isSnow && index < 3 && filter === 'all' ? 'top-3' : ''} cursor-pointer hover:bg-white/40 transition-colors ${selectedCityId === (isHof ? city : city.id) ? 'selected-row' : ''}`}
                                onClick={() => setSelectedCityId(isHof ? city : city.id)}
                            >
                                <td>
                                    <span className={`rank-badge ${city.rank <= 3 ? 'rank-' + city.rank : ''}`}>
                                        {city.rank}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="city-name">{isHof ? city.city : city.city}</span>
                                        <span className="city-state text-[10px] opacity-60 font-medium lowercase italic">
                                            {isHof ? city.region : (city.state + (!isSnow ? ` • ${city.record_date}` : ''))}
                                        </span>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-mono font-bold ${!isSnow ? 'text-blue-700' : 'val-total'}`}>
                                            {isSnow ? `${city.total_snow}"` : `${city.lowest_temp}°F`}
                                        </span>
                                        {!isSnow && city.all_time_low !== undefined && (
                                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight">
                                                Ever: {city.all_time_low}°F
                                            </span>
                                        )}
                                        {isHof && (
                                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">
                                                {city.is_state_record ? 'Official State Record' : 'Legendary Season'}
                                            </span>
                                        )}
                                        {isSnow && !isHof && (() => {
                                            const avg = city.avg_annual;
                                            if (avg > 0) {
                                                const pct = ((city.total_snow / avg) * 100).toFixed(0);
                                                let progressColor = 'text-slate-400';
                                                if (pct >= 100) progressColor = 'text-emerald-600 font-bold';
                                                else if (pct >= 80) progressColor = 'text-sky-600';

                                                return (
                                                    <div className="text-[10px] mt-0.5 font-semibold uppercase tracking-tight flex justify-end gap-1">
                                                        <span className="text-slate-500">Avg: {avg}"</span>
                                                        <span className={progressColor}>
                                                            ({pct}%)
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        })()}
                                    </div>
                                </td>
                                <td className="text-right">
                                    <div className="flex flex-col items-end">
                                        {isHof ? (
                                            <span className="font-mono text-slate-600 font-bold">{city.season}</span>
                                        ) : (
                                            isSnow ? (
                                                city.last_24h > 0 ? (
                                                    <span className="font-mono val-recent">+{city.last_24h}"</span>
                                                ) : (
                                                    <span className="font-mono val-zero">-</span>
                                                )
                                            ) : (
                                                <>
                                                    <span className="font-mono text-blue-900 font-bold">{city.lowest_windchill}°F</span>
                                                    {city.all_time_windchill !== undefined && (
                                                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-tight">
                                                            Ever: {city.all_time_windchill}°F
                                                        </span>
                                                    )}
                                                </>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
