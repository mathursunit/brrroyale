import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/index.css';
import historyData from '../../public/data/history.json'; // Direct import for now

const CityHistory = ({ cityId, onClose, inline = false, cityName = '' }) => {
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

    // Calculate stats - added outside useEffect
    const values = chartData.map(d => d.snow);
    const maxSnow = values.length ? Math.max(...values) : 0;
    const maxYear = chartData.find(d => d.snow === maxSnow)?.year;
    const minSnow = values.length ? Math.min(...values) : 0;
    const minYear = chartData.find(d => d.snow === minSnow)?.year;
    const avgSnow = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;

    if (!chartData.length) return null;

    const Content = () => (
        <>
            <div className={`modal-header ${inline ? 'border-0 pb-0 mb-4' : ''}`}>
                <h2 className="modal-title text-xl">
                    {cityName ? `${cityName} Analysis` : (inline ? 'City Analysis' : 'Snowfall History')}
                    <span className="text-slate-400 text-sm font-normal ml-2 block sm:inline">(2005-2025)</span>
                </h2>
                {!inline && (
                    <button onClick={onClose} className="modal-close">
                        ✕ Close
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Record High</div>
                    <div className="stat-value text-high">{maxSnow}"</div>
                    <div className="stat-sub">{maxYear} Season</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Record Low</div>
                    <div className="stat-value text-low">{minSnow}"</div>
                    <div className="stat-sub">{minYear} Season</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">20-Year Avg</div>
                    <div className="stat-value text-avg">{avgSnow}"</div>
                    <div className="stat-sub">Annual</div>
                </div>
            </div>

            <div style={{ height: inline ? '300px' : '350px' }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                        <XAxis dataKey="year" stroke="#475569" fontSize={10} tick={{ fill: '#475569' }} />
                        <YAxis stroke="#475569" fontSize={10} tick={{ fill: '#475569' }} width={30} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: '#0284c7' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line
                            type="monotone"
                            dataKey="snow"
                            name="Snowfall (in)"
                            stroke="#0284c7"
                            strokeWidth={3}
                            dot={{ r: 3, fill: '#0284c7' }}
                            activeDot={{ r: 5, stroke: '#e0f2fe', strokeWidth: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 text-xs text-slate-400 text-center flex flex-col gap-1">
                <p>Source used: <a href="https://www.ncdc.noaa.gov/cdo-web/" target="_blank" className="underline hover:text-sky-600">NOAA NCEI</a></p>
                <p className="opacity-70">Station: {cityId ? historyData.cities[cityId]?.station_id || 'GHCND' : ''}</p>
            </div>
        </>
    );

    if (inline) {
        return (
            <div className="glass-panel h-full animate-fade-in">
                <Content />
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <Content />
            </div>
        </div>
    );
};

export default CityHistory;
