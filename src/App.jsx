import { useState, useEffect } from 'react'
import './styles/index.css'
import Leaderboard from './components/Leaderboard'
import Snowfall from './components/Snowfall'

const DynamicBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const p = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      left: Math.random() * 100,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 10
    }));
    setParticles(p);
  }, []);

  return (
    <div className="particles-container">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};

function App() {
  return (
    <div className="app-container">
      <div className="top-banner">
        ❄️ LIVE SEASON DATA: <span>RECORD BREAKING ACCUMULATION IN NEW YORK</span> • UPDATED REAL-TIME via NOAA NCEI
      </div>

      <Snowfall />
      <DynamicBackground />
      <div className="wallpaper" />

      {/* Main Content (Centered) */}
      <main className="main-content">
        <header className="hero">
          <img src="assets/logo-banner-trans.png" alt="Battle Brrr-oyale Logo" className="header-logo" />
          <p className="hero-subtitle mt-4">
            The ultimate snowfall showdown. Tracking the top US cities to see who freezes first.
          </p>
        </header>

        <Leaderboard />

        <footer className="footer">
          <p>Official Snowfall Data provided by <strong>NOAA National Centers for Environmental Information (NCEI)</strong></p>
          <p className="mt-1 opacity-50">© 2026 Battle Brrr-oyale Dashboard • All Rights Reserved</p>
        </footer>
      </main>
    </div>
  )
}

export default App
