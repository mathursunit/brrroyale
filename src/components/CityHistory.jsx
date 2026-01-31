import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/index.css';
import historyData from '../../public/data/history.json'; // Direct import for now

const CityHistory = ({ cityId, onClose }) => {
    const [chartData, setChartData] = useState([]);
    const [cityMeta, setCityMeta] = useState(null);

    useEffect(() => {
        // The cityId passed from Leaderboard is like "syracuse_ny" (from cities.json).
        // public/data/history.json keys are also like "syracuse_ny".
        // HOWEVER, we need to make sure they match exactly.

        let dataKey = cityId;

        // Debug check: console.log('Looking for history for:', cityId);

        if (historyData.cities && historyData.cities[dataKey]) {
            const rawSeasons = historyData.cities[dataKey];
            const processed = Object.keys(rawSeasons).map(year => ({
                year,
                snow: rawSeasons[year]
            }));
            setChartData(processed);
        } else {
            console.warn(`No history found for ID: ${cityId}`);
            // Fallback: try finding by name if IDs drifted? (Not needed if cities.json IDs are stable)
        }
    }, [cityId]);

    if (!chartData.length) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        Snowfall History
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        ✕ Close
                    </button>
                </div>

                <div style={{ height: '400px' }} className="w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                            <XAxis dataKey="year" stroke="#475569" fontSize={12} tick={{ fill: '#475569' }} />
                            <YAxis stroke="#475569" fontSize={12} tick={{ fill: '#475569' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#0284c7' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey="snow"
                                name="Total Snowfall (in)"
                                stroke="#0284c7"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#0284c7' }}
                                activeDot={{ r: 6, stroke: '#e0f2fe', strokeWidth: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 text-sm text-slate-500 text-center">
                    20-Year Historical Data from Open-Meteo Archive
                </div>
            </div>
        </div>
    );
};

export default CityHistory;
