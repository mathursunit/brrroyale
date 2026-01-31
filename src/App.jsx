import { useState, useEffect } from 'react'
import './styles/index.css'
import Leaderboard from './components/Leaderboard'

const DynamicBackground = ({ mode }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const isCold = mode === 'cold';
    const count = isCold ? 40 : 80;
    const p = Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: isCold ? Math.random() * 2 + 0.5 : Math.random() * 4 + 1,
      left: Math.random() * 100,
      duration: isCold ? Math.random() * 20 + 20 : Math.random() * 15 + 15,
      delay: Math.random() * 10,
      opacity: isCold ? 0.2 + Math.random() * 0.3 : 0.4 + Math.random() * 0.4
    }));
    setParticles(p);
  }, [mode]);

  return (
    <div className={`particles-container ${mode}`}>
      {particles.map(p => (
        <div
          key={p.id}
          className={`particle ${mode === 'cold' ? 'frost' : 'snow'}`}
          style={{
            width: mode === 'cold' ? `${p.size}px` : `${p.size}px`,
            height: mode === 'cold' ? `${p.size * 4}px` : `${p.size}px`,
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

  return (
    <div className={`app-container ${dataset}-mode`}>
      <div className="top-banner">
        ❄️ {dataset === 'snow' ? 'SNOWFALL WATCH' : 'DEEP FREEZE ALERT'}: <span>{dataset === 'snow' ? 'RECORD BREAKING ACCUMULATION IN NEW YORK' : 'ARCTIC BLAST SWEEPING THE MIDWEST'}</span> • UPDATED REAL-TIME via NOAA NCEI
      </div>

      <DynamicBackground mode={dataset} />
      <div className={`wallpaper ${dataset}`} />

      {/* Main Content (Centered) */}
      <main className="main-content">
        <header className="hero">
          <img src="assets/logo-banner-trans.png" alt="Battle Brrr-oyale Logo" className="header-logo" />
          <p className="hero-subtitle">
            {dataset === 'snow'
              ? 'The ultimate snowfall showdown. Tracking the top US cities to see who freezes first.'
              : 'The 2025-2026 Deep Freeze. Tracking the coldest temperatures and windchills across America.'}
          </p>
        </header>

        <Leaderboard dataset={dataset} setDataset={setDataset} />

        <footer className="footer">
          <p>Official Weather Data provided by <strong>NOAA National Centers for Environmental Information (NCEI)</strong></p>
          <p className="mt-1 opacity-50">© 2026 Battle Brrr-oyale Dashboard • All Rights Reserved</p>
        </footer>
      </main>
    </div>
  )
}

export default App
