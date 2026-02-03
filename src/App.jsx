import { useState, useEffect } from 'react'
import './styles/index.css'
import Leaderboard from './components/Leaderboard'

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
    const count = isCold ? 60 : 80;
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
  const [dataset, setDataset] = useState('snow'); // 'snow' or 'cold'
  const [theme, setTheme] = useState('dark');

  // Handle Theme Switch
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Dynamic banner messages
  const bannerMessages = {
    snow: {
      alert: '❄️ SNOWFALL WATCH',
      message: 'RECORD BREAKING ACCUMULATION IN NEW YORK'
    },
    cold: {
      alert: '🥶 DEEP FREEZE ALERT',
      message: 'ARCTIC BLAST SWEEPING THE MIDWEST'
    }
  };

  const currentBanner = bannerMessages[dataset];

  return (
    <div className="app-container">
      {/* Top Alert Banner */}
      <div className="top-banner">
        <div>{currentBanner.alert}: <span>{currentBanner.message}</span> • UPDATED REAL-TIME via NOAA NCEI</div>
        <button
          className="theme-toggle"
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

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
