import { createPortal } from 'react-dom';
import '../styles/index.css';

const CityInfoModal = ({ city, onClose }) => {
    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="hof-modal-header">
                    <div>
                        <h2 className="hof-title">
                            👑 {city.city}
                            <span className="hof-region-pill">
                                {city.region}
                            </span>
                        </h2>
                        <div className="hof-subtitle">
                            <span className="hof-season">❄️ {city.season} Season</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-btn">
                        ✕
                    </button>
                </div>

                <div className="hof-grid">
                    {/* Left Column: Stats & Facts */}
                    <div className="hof-column">
                        {/* Giant Snowfall Stat */}
                        <div className="hof-stat-card">
                            <div className="hof-stat-bg-icon">❄</div>
                            <div className="hof-stat-content">
                                <div className="hof-stat-label">Seasonal Total</div>
                                <div className="hof-stat-value">{city.total_snow}"</div>
                                {city.is_state_record && (
                                    <div className="hof-record-badge">
                                        <span>🏆</span> NY State Record
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Frozen Facts */}
                        <div>
                            <h3 className="hof-section-title">
                                <span className="text-xl">☃️</span> Frozen Facts
                            </h3>
                            <ul className="hof-facts-list">
                                {city.fun_facts && city.fun_facts.map((fact, i) => (
                                    <li key={i} className="hof-fact-item">
                                        <span className="hof-bullet">❄</span>
                                        {fact}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Explore & Trivia */}
                    <div className="hof-column">
                        {/* Explore Card */}
                        <div className="hof-explore-card group">
                            <div className="hof-explore-bg"></div>
                            <div className="hof-explore-content">
                                <h3 className="hof-explore-title">🔍 Explore {city.city}</h3>
                                <p className="hof-explore-desc">Discover winter adventures, tourism guides, and historical records from this legendary snow destination.</p>

                                <div className="hof-links-list">
                                    {city.links && city.links.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hof-link-item"
                                        >
                                            <span className="font-medium text-sm">{link.label}</span>
                                            <span className="hof-link-arrow">↗</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Did You Know Trivia */}
                        <div className="hof-trivia-card">
                            <h4 className="hof-trivia-title">
                                <span>💡</span> Did You Know?
                            </h4>
                            <p className="hof-trivia-text">
                                {city.region === 'Tug Hill Plateau'
                                    ? 'The Tug Hill Plateau receives some of the most intense snowfall in the entire United States east of the Rockies due to Lake Ontario\'s legendary lake-effect snow machine.'
                                    : 'New York\'s "Golden Snowball" award has been a friendly competition between Upstate cities since the 1970s, crowning the snowiest city each winter season.'}
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
