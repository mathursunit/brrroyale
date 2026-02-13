import Icon from './Icon';
import snowyData from '../../public/data/season_current.json';

const FALLBACK_MESSAGES = [
    '❄️ The Battle Brrr-oyale — tracking every flake across the frozen frontier',
    '🏔️ Syracuse leads the charge as the snowiest major city in America',
    '📊 Season stats updated daily via NOAA NCEI weather stations',
    '🥇 Who will claim the Golden Snowball this winter?',
    '🌨️ Lake-effect snow machine is fueled by the Great Lakes',
];

const StormTicker = () => {
    const storms = snowyData.storm_events || [];
    const hasStorms = storms.length > 0;

    const messages = hasStorms
        ? storms.map(s => `⚡ ${s.message}`)
        : FALLBACK_MESSAGES;

    // Double the messages for seamless loop
    const tickerItems = [...messages, ...messages];

    return (
        <div className="storm-ticker" role="marquee" aria-label="Storm alerts and updates">
            <div className="storm-ticker-track">
                {tickerItems.map((msg, i) => (
                    <span key={i} className="storm-ticker-item">
                        <span className={`ticker-dot ${hasStorms ? 'active' : ''}`} />
                        {msg}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default StormTicker;
