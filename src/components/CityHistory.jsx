import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import '../styles/index.css';
import historyData from '../../public/data/history.json';
import cityInfoData from '../../public/data/city_info.json';
import Icon from './Icon';

const CityHistory = ({ cityId, onClose, inline = false, cityName = '' }) => {
    const [chartData, setChartData] = useState([]);
    const [viewMode, setViewMode] = useState('stats'); // 'stats' or 'info'

    useEffect(() => {
        let dataKey = cityId;
        if (historyData.cities && historyData.cities[dataKey]) {
            const rawSeasons = historyData.cities[dataKey];
            const processed = Object.keys(rawSeasons).map(year => ({
                year,
                snow: rawSeasons[year]
            }));
            setChartData(processed);
        } else {
            console.warn(`No history found for ID: ${cityId}`);
        }
    }, [cityId]);

    // Check if we have additional info for this city
    const hasInfo = cityInfoData[cityId];

    // Calculate stats
    const values = chartData.map(d => d.snow);
    const maxSnow = values.length ? Math.max(...values) : 0;
    const maxYear = chartData.find(d => d.snow === maxSnow)?.year;
    const minSnow = values.length ? Math.min(...values) : 0;
    const minYear = chartData.find(d => d.snow === minSnow)?.year;
    const avgSnow = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;

    if (!chartData.length) return null;

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(30, 27, 75, 0.9))',
                    border: '1px solid rgba(125, 211, 252, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    color: '#f0f9ff'
                }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#7dd3fc' }}>
                        {label} Season
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Cinzel, serif' }}>
                        {payload[0].value}"
                    </p>
                </div>
            );
        }
        return null;
    };

    const Content = () => (
        <>
            <div className={`modal-header ${inline ? 'border-0 pb-0 mb-4' : ''}`}>
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-start w-full">
                        <h2 className="modal-title">
                            <Icon name="snow" className="title-icon" /> {cityName ? cityName : (inline ? 'City Analysis' : 'Snowfall History')}
                        </h2>
                        {!inline && (
                            <button onClick={onClose} className="modal-close" aria-label="Close modal">
                                <Icon name="close" className="btn-icon" /> Close
                            </button>
                        )}
                    </div>

                    {/* View Switcher Tabs */}
                    {hasInfo && (
                        <div className="flex gap-2 mt-2 border-b border-slate-200 w-full">
                            <button
                                onClick={() => setViewMode('stats')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${viewMode === 'stats' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Icon name="chart" className="btn-icon" /> Analysis
                            </button>
                            <button
                                onClick={() => setViewMode('info')}
                                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${viewMode === 'info' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Icon name="info" className="btn-icon" /> City Facts
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'stats' ? (
                <>
                    {/* Stats Cards */}
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

                    {/* Chart */}
                    <div style={{ height: inline ? '300px' : '350px' }} className="w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="snowGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(125, 211, 252, 0.15)" />
                                <XAxis
                                    dataKey="year"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tick={{ fill: '#64748b' }}
                                    axisLine={{ stroke: 'rgba(125, 211, 252, 0.2)' }}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={10}
                                    tick={{ fill: '#64748b' }}
                                    width={35}
                                    axisLine={{ stroke: 'rgba(125, 211, 252, 0.2)' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '10px', color: '#93c5fd' }}
                                    formatter={(value) => <span style={{ color: '#93c5fd' }}>{value}</span>}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="snow"
                                    name="Snowfall (in)"
                                    stroke="#7dd3fc"
                                    strokeWidth={3}
                                    fill="url(#snowGradient)"
                                    dot={{ r: 4, fill: '#7dd3fc', stroke: '#0d1b2a', strokeWidth: 2 }}
                                    activeDot={{ r: 6, stroke: '#7dd3fc', strokeWidth: 2, fill: '#0d1b2a' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Source Attribution */}
                    <div className="mt-4 text-xs text-slate-400 text-center flex flex-col gap-1">
                        <p>Source: <a href="https://www.ncdc.noaa.gov/cdo-web/" target="_blank" className="underline hover:text-sky-600">NOAA NCEI</a></p>
                        <p className="opacity-70">Station: {cityId ? historyData.cities[cityId]?.station_id || 'GHCND' : ''}</p>
                    </div>
                </>
            ) : (
                <div className="animate-fade-in p-2">
                    <div className="hof-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {/* Frozen Facts Section */}
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-6">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Icon name="snow" className="inline-icon" /> Frozen Facts
                            </h3>
                            <ul className="space-y-4">
                                {hasInfo.fun_facts.map((fact, i) => (
                                    <li key={i} className="flex gap-3 text-slate-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Explore More Links */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="text-md font-bold text-slate-600 mb-4 uppercase tracking-wider">Explore More</h3>
                            <div className="flex flex-wrap gap-3">
                                {hasInfo.links.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-4 py-3 rounded-lg border border-slate-200 hover:border-sky-200 transition-all shadow-sm font-medium"
                                    >
                                        {link.label}
                                        <Icon name="arrow-up-right" className="inline-icon icon-trailing" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    if (inline) {
        return (
            <div className="glass-panel h-full animate-fade-in">
                <Content />
            </div>
        );
    }

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <Content />
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CityHistory;
