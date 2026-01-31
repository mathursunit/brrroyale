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

    // Determine default city (Top Rank)
    const topCityId = filteredRankings.length > 0 ? filteredRankings[0].id : null;

    // Derived state for display
    // For Desktop: If nothing selected, show Top City.
    // For Mobile: If nothing selected, show nothing (Modal closed).
    const desktopDisplayId = selectedCityId || topCityId;

    return (
        <div className="dashboard-grid">
            {/* Left Column: Leaderboard Table */}
            <div className="layout-table glass-panel">
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
                            NY
                        </button>
                    </div>
                </div>

                <div className="table-container">
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
                                    className={`${index < 3 && filter === 'all' ? 'top-3' : ''} cursor-pointer hover:bg-white/40 transition-colors ${selectedCityId === city.id ? 'bg-sky-50' : ''}`}
                                    onClick={() => setSelectedCityId(city.id)}
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
                </div>
            </div>

            {/* Right Column (Desktop Only - Sticky) */}
            <div className="layout-detail hidden lg:block">
                {desktopDisplayId && (
                    <CityHistory
                        cityId={desktopDisplayId}
                        cityName={data.rankings.find(c => c.id === desktopDisplayId)?.city}
                        inline={true}
                        onClose={() => { }}
                    />
                )}
            </div>

            {/* Mobile Modal (Only if selected explicitly) */}
            <div className="block lg:hidden">
                {selectedCityId && (
                    <CityHistory
                        cityId={selectedCityId}
                        cityName={data.rankings.find(c => c.id === selectedCityId)?.city}
                        inline={false}
                        onClose={() => setSelectedCityId(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
