import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/index.css';
import historyData from '../../public/data/history.json'; // Direct import for now

const CityHistory = ({ cityId, onClose }) => {
    const [chartData, setChartData] = useState([]);
    const [cityMeta, setCityMeta] = useState(null);

    useEffect(() => {
        if (historyData.cities[cityId]) {
            // Find city name from the main list (passed or we could look it up)
            // For now, let's just use the ID or look it up if we had the full list here.
            setCityMeta({ name: cityId }); // Placeholder

            const rawSeasons = historyData.cities[cityId];
            const processed = Object.keys(rawSeasons).map(year => ({
                year,
                snow: rawSeasons[year]
            }));
            setChartData(processed);
        }
    }, [cityId]);

    if (!chartData.length) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-display text-white">
                        Snowfall History
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        ✕ Close
                    </button>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#38bdf8' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="snow"
                                name="Total Snowfall (in)"
                                stroke="#38bdf8"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#38bdf8' }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 text-sm text-slate-400 text-center">
                    20-Year Historical Data from Open-Meteo Archive
                </div>
            </div>
        </div>
    );
};

export default CityHistory;
