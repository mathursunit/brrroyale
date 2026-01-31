import './styles/index.css'
import Leaderboard from './components/Leaderboard'
import Snowfall from './components/Snowfall'

function App() {
  return (
    <div className="app-container">
      <Snowfall />

      {/* Main Content (Centered) */}
      <main className="main-content">
        <header className="hero">
          <h1 className="hero-title">
            Battle <br /> <span className="highlight-fun">Brrr-oyale</span>
          </h1>
          <p className="hero-subtitle">
            The ultimate snowfall showdown. <br />
            Tracking the top US cities to see who freezes first.
          </p>
        </header>

        <Leaderboard />

        <footer className="footer">
          <p>Built with ❄️ by Antigravity</p>
        </footer>
      </main>
    </div>
  )
}

export default App
