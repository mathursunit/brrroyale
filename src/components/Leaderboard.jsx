import { useState, useEffect } from 'react';
import '../styles/index.css';
import currentSeasonData from '../../public/data/season_current.json';
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
                    <h2 className="lb-title">Current Standings</h2>

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
                                    className={`${index < 3 && filter === 'all' ? 'top-3' : ''} cursor-pointer`}
                                    onClick={() => setSelectedCityId(city.id)}
                                    title="Click to view history"
                                >
                                    <td>
                                        <span className="rank-cell">
                                            {city.rank === 1 && <span className="rank-icon">👑</span>}
                                            {city.rank === 2 && <span className="rank-icon">🥈</span>}
                                            {city.rank === 3 && <span className="rank-icon">🥉</span>}
                                            {city.rank > 3 && <span>#{city.rank}</span>}
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

                <div className="footer" style={{ padding: '1rem 0 0 0', marginTop: 0 }}>
                    Last Updated: {new Date(data.last_updated).toLocaleString()}
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
