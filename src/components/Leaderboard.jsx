import { useState, useEffect } from 'react';
import '../styles/index.css';
import currentSeasonData from '../../public/data/season_current.json';
// Helper removed - we now use official NOAA normals from the data property city.avg_annual
import CityHistory from './CityHistory';

const Leaderboard = () => {
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'ny'
    const [selectedCityId, setSelectedCityId] = useState(null);

    useEffect(() => {
        setData(currentSeasonData);
    }, []);

    if (!data) return <div className="loading">Loading Snow Data...</div>;

    const filteredRankings = data.rankings.filter(city => {
        if (filter === 'ny') return city.tags.includes('NY_Top10');
        return true;
    });

    return (
        <>
            <div className="glass-panel">
                <div className="lb-header">
                    <div className="flex flex-col gap-1">
                        <h2 className="lb-title">Current Standings</h2>
                        <div className="text-xs text-slate-500 font-medium">
                            Updated: {new Date(data.last_updated).toLocaleString()}
                        </div>
                    </div>

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
                            New York
                        </button>
                        <button
                            onClick={() => setFilter('history')}
                            className={`filter-btn ${filter === 'history' ? 'active' : ''}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    {filter === 'history' ? (
                        <div className="p-8 text-center text-slate-500">
                            <div className="text-4xl mb-2">📚</div>
                            <h3 className="text-lg font-bold text-slate-700">Historical Archives</h3>
                            <p>Select a city from the main list to view its 20-year history.</p>
                            <button onClick={() => setFilter('all')} className="mt-4 text-sky-600 hover:underline">
                                Back to Leaderboard
                            </button>
                        </div>
                    ) : (
                        <table className="lb-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>City</th>
                                    <th className="text-right">Total Snow</th>
                                    <th className="text-right">Last 24h</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRankings.map((city, index) => (
                                    <tr
                                        key={city.id}
                                        className={`${index < 3 && filter === 'all' ? 'top-3' : ''} cursor-pointer hover:bg-white/40 transition-colors`}
                                        onClick={() => setSelectedCityId(city.id)}
                                        title="Click to view history"
                                    >
                                        <td>
                                            <span className={`rank-badge ${city.rank <= 3 ? 'rank-' + city.rank : ''}`}>
                                                {city.rank}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="city-name">{city.city}</span>
                                            <span className="city-state">{city.state}</span>
                                        </td>
                                        <td className="text-right">
                                            <span className="font-mono val-total">
                                                {city.total_snow}"
                                            </span>
                                            {(() => {
                                                const avg = city.avg_annual;
                                                if (avg > 0) {
                                                    const pct = ((city.total_snow / avg) * 100).toFixed(0);
                                                    let progressColor = 'text-slate-400';
                                                    if (pct >= 100) progressColor = 'text-emerald-600 font-bold';
                                                    else if (pct >= 80) progressColor = 'text-sky-600';

                                                    return (
                                                        <div className="text-xs mt-1 font-medium flex justify-end gap-1">
                                                            <span className="text-slate-500">Avg: {avg}"</span>
                                                            <span className={progressColor}>
                                                                ({pct}%)
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                            })()}
                                        </td>
                                        <td className="text-right">
                                            {city.last_24h > 0 ? (
                                                <span className="font-mono val-recent">+{city.last_24h}"</span>
                                            ) : (
                                                <span className="font-mono val-zero">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedCityId && (
                <CityHistory
                    cityId={selectedCityId}
                    onClose={() => setSelectedCityId(null)}
                />
            )}
        </>
    );
};

export default Leaderboard;
