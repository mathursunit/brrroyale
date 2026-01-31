import { useState, useEffect } from 'react';
import '../styles/index.css';
import currentSeasonData from '../../public/data/season_current.json';
import historyData from '../../public/data/history.json'; // Need history for calculation
import CityHistory from './CityHistory';

// Helper: Calculate average snowfall up to today's date across all available years
const getHistoricalComparison = (cityId, currentTotal) => {
    const years = historyData.cities[cityId];
    if (!years) return null;

    const totals = Object.values(years);
    if (totals.length === 0) return null;

    // Use a simple average of total seasonal snowfall (approximation for now as daily history is heavy)
    // A better approach would be "average to date", but we only have season totals in history.json
    // Let's use the season total average as a benchmark for "Pace" or just compare to average season total.

    // Actually, to get "Above/Below Average", we really need "Average FOR THIS DATE".
    // We don't have daily history loaded in the frontend (it's huge). 
    // We only have seasonal totals.
    // So let's show "Season Average" context. e.g. "Avg Season: 90in"

    const sum = totals.reduce((a, b) => a + b, 0);
    const avg = sum / totals.length;

    // Pace calculation: We are roughly 5 months into a 9 month season (Sep-May). 
    // Let's just show the raw Average Season Total for context.

    return {
        avgSeason: avg.toFixed(1),
        diff: (currentTotal - avg).toFixed(1)
    };
};

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
                                                const stats = getHistoricalComparison(city.id, city.total_snow);
                                                if (stats) {
                                                    const diffVal = parseFloat(stats.diff);
                                                    const isAhead = diffVal >= 0;
                                                    const colorClass = isAhead ? 'text-emerald-600' : 'text-rose-500';
                                                    const sign = isAhead ? '+' : '';

                                                    return (
                                                        <div className="text-xs text-slate-500 mt-1 font-medium flex justify-end gap-2">
                                                            <span>Avg: {stats.avgSeason}"</span>
                                                            <span className={colorClass}>
                                                                ({sign}{stats.diff}")
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
