import { useState, useEffect } from 'react';
import '../styles/index.css';
import snowyData from '../../public/data/season_current.json';
import coldData from '../../public/data/coldest_cities.json';
import CityHistory from './CityHistory';

const Leaderboard = () => {
    const [dataset, setDataset] = useState('snow'); // 'snow' or 'cold'
    const [filter, setFilter] = useState('all'); // 'all', 'ny'
    const [selectedCityId, setSelectedCityId] = useState(null);

    const isSnow = dataset === 'snow';
    const data = isSnow ? snowyData : coldData;

    const filteredRankings = data.rankings.filter(city => {
        if (isSnow && filter === 'ny') return city.tags && city.tags.includes('NY_Top10');
        return true;
    });

    return (
        <div className="leaderboard-container glass-panel">
            <div className="lb-header">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 mb-2">
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
                    <h2 className="lb-title">{isSnow ? 'Current Snowfall Standings' : '2025-2026 Season Lows'}</h2>
                    <div className="text-xs text-slate-500 font-medium">
                        Source: NOAA NCEI • Live Data Stream
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
                                key={city.id}
                                className={`${isSnow && index < 3 && filter === 'all' ? 'top-3' : ''} cursor-pointer hover:bg-white/40 transition-colors ${selectedCityId === city.id ? 'selected-row' : ''}`}
                                onClick={() => setSelectedCityId(city.id)}
                            >
                                <td>
                                    <span className={`rank-badge ${city.rank <= 3 ? 'rank-' + city.rank : ''}`}>
                                        {city.rank}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex flex-col">
                                        <span className="city-name">{city.city}</span>
                                        <span className="city-state text-xs opacity-60">
                                            {city.state} {!isSnow && `• ${city.record_date}`}
                                        </span>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <div className="flex flex-col">
                                        <span className={`font-mono font-bold ${!isSnow && 'text-blue-700'}`}>
                                            {isSnow ? `${city.total_snow}"` : `${city.lowest_temp}°F`}
                                        </span>
                                        {!isSnow && city.all_time_low !== undefined && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                Ever: {city.all_time_low}°F
                                            </span>
                                        )}
                                        {isSnow && (() => {
                                            const avg = city.avg_annual;
                                            if (avg > 0) {
                                                const pct = ((city.total_snow / avg) * 100).toFixed(0);
                                                let progressColor = 'text-slate-400';
                                                if (pct >= 100) progressColor = 'text-emerald-600 font-bold';
                                                else if (pct >= 80) progressColor = 'text-sky-600';

                                                return (
                                                    <div className="text-[10px] mt-0.5 font-medium flex justify-end gap-1">
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
                                    {isSnow ? (
                                        city.last_24h > 0 ? (
                                            <span className="font-mono val-recent">+{city.last_24h}"</span>
                                        ) : (
                                            <span className="font-mono val-zero">-</span>
                                        )
                                    ) : (
                                        <span className="font-mono text-blue-900 font-bold">{city.lowest_windchill}°F</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedCityId && (
                <CityHistory
                    cityId={selectedCityId}
                    cityName={data.rankings.find(c => c.id === selectedCityId)?.city}
                    inline={false}
                    onClose={() => setSelectedCityId(null)}
                />
            )}
        </div>
    );
};

export default Leaderboard;
