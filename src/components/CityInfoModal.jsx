import { createPortal } from 'react-dom';
import '../styles/index.css';

const CityInfoModal = ({ city, onClose }) => {
    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                <div className="modal-header border-b border-indigo-100 pb-4 mb-6 relative">
                    <div>
                        <h2 className="modal-title flex items-center gap-3 text-2xl">
                            {city.city}
                            <span className="text-sm font-normal text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                {city.region}
                            </span>
                        </h2>
                        <div className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                            <span className="font-semibold text-sky-600">{city.season} Season</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close absolute top-0 right-0 p-2 hover:bg-slate-100 rounded-full transition-colors">
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Stats & Facts */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 text-9xl text-blue-100 opacity-50 select-none">❄</div>
                            <div className="relative z-10">
                                <div className="text-sm uppercase tracking-wider font-bold text-blue-400 mb-1">Seasonal Total</div>
                                <div className="text-5xl font-extrabold text-blue-700 tracking-tight">{city.total_snow}"</div>
                                {city.is_state_record && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                                        <span>🏆</span> NY State Record
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <span className="text-xl">☃️</span> Frozen Facts
                            </h3>
                            <ul className="space-y-3">
                                {city.fun_facts && city.fun_facts.map((fact, i) => (
                                    <li key={i} className="flex gap-3 text-slate-600 text-sm leading-relaxed p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                        <span className="text-blue-400 font-bold">•</span>
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Links & Map Graphic Placeholder */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-90 z-0"></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-2">Explore {city.city}</h3>
                                <p className="text-indigo-200 text-sm mb-6">Discover winter adventures, tourism guides, and historical records.</p>

                                <div className="flex flex-col gap-3">
                                    {city.links && city.links.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between bg-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all p-3 rounded-lg border border-white/10 group-hover:border-white/20"
                                        >
                                            <span className="font-medium text-sm">{link.label}</span>
                                            <span className="text-white/50 group-hover:text-white transition-colors">↗</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <h4 className="text-orange-800 font-bold text-sm mb-1 flex items-center gap-2">
                                <span>💡</span> Did You Know?
                            </h4>
                            <p className="text-orange-700/80 text-xs leading-relaxed">
                                {city.region === 'Tug Hill Plateau'
                                    ? 'The Tug Hill Plateau receives some of the most intense snowfall in the entire United States east of the Rockies due to Lake Ontario.'
                                    : 'New York\'s "Golden Snowball" award has been a friendly competition between Upstate cities since the 1970s.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CityInfoModal;
