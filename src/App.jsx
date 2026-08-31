import { useState, useEffect } from 'react'
import './styles/index.css'
import Leaderboard from './components/Leaderboard'
import StormTicker from './components/StormTicker'
import Icon from './components/Icon'

// Aurora Background with multiple animated layers
const AuroraBackground = () => {
  return (
    <>
      <div className="wallpaper">
        <div className="aurora-layer-2" />
        <div className="aurora-layer-3" />
      </div>
    </>
  );
};

// Enhanced Snow/Frost Particles
const DynamicParticles = ({ mode }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const isCold = mode === 'cold';
    // More particles for a magical effect
    const count = isCold ? 40 : 60;
    const p = Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: isCold ? Math.random() * 2 + 1 : Math.random() * 5 + 2,
      left: Math.random() * 100,
      duration: isCold ? Math.random() * 20 + 15 : Math.random() * 15 + 10,
      delay: Math.random() * 15,
      opacity: isCold ? 0.2 + Math.random() * 0.4 : 0.4 + Math.random() * 0.5
    }));
    setParticles(p);
  }, [mode]);

  return (
    <div className="particles-container">
      {particles.map(p => (
        <div
          key={p.id}
          className={`particle ${mode === 'cold' ? 'frost' : 'snow'}`}
          style={{
            width: `${p.size}px`,
            height: mode === 'cold' ? `${p.size * 5}px` : `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity
          }}
        />
      ))}
    </div>
  );
};

function App() {
  // Change 2: Initialize dataset from URL so mode is bookmarkable/shareable
  const [dataset, setDataset] = useState(() => {
    const mode = new URLSearchParams(window.location.search).get('mode');
    return mode === 'cold' ? 'cold' : 'snow';
  });
  const [theme, setTheme] = useState('dark');

  // Change 2: Sync dataset → URL
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    p.set('mode', dataset);
    window.history.replaceState(null, '', `?${p.toString()}`);
  }, [dataset]);

  // Handle Theme Switch
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      {/* Top Alert Banner */}
      <div className="top-banner">
        <div className="banner-content">
          <span className="banner-pill">
            <Icon name="zap" className="btn-icon" />
            {dataset === 'snow' ? 'Snowfall Watch' : 'Deep Freeze Alert'}
          </span>
          <span className="banner-message">
            {dataset === 'snow'
              ? 'Tracking every flake across the frozen frontier'
              : 'Arctic conditions sweeping the northern states'}
          </span>
          <span className="banner-source">Updated via NOAA NCEI</span>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <>
              <Icon name="sun" className="btn-icon" />
              Light
            </>
          ) : (
            <>
              <Icon name="moon" className="btn-icon" />
              Dark
            </>
          )}
        </button>
      </div>

      {/* Storm Ticker — scrolling news marquee */}
      <StormTicker />

      {/* Aurora Borealis Background - Only in Dark Mode */}
      {theme === 'dark' && <AuroraBackground />}

      {/* Dynamic Particles */}
      <DynamicParticles mode={dataset} />

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Header with Ice Crown Logo */}
        <header className="hero">
          <img
            src="assets/logo-banner-trans.png"
            alt="Battle Brrr-oyale - The Ultimate Winter Showdown"
            className="header-logo"
          />
        </header>

        {/* Main Leaderboard */}
        <Leaderboard dataset={dataset} setDataset={setDataset} theme={theme} />

        {/* Footer */}
        <footer className="footer">
          <p>Official Weather Data provided by <strong>NOAA National Centers for Environmental Information (NCEI)</strong></p>
          <p className="mt-1 opacity-50">© 2026 Battle Brrr-oyale • The Frozen Kingdom Dashboard • All Rights Reserved</p>
        </footer>
      </main>
    </div>
  )
}

export default App
