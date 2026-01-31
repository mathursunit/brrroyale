import './styles/index.css'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
    <div className="app-container">
      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">
          Battle <br /> <span className="highlight-gold">Brrr-oyale</span>
        </h1>
        <p className="hero-subtitle">
          The ultimate snowfall showdown. <br />
          Tracking the top US cities in a fight for the Golden Snowball.
        </p>
      </header>

      {/* Main Content */}
      <main className="container">
        <Leaderboard />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built with ❄️ by Antigravity</p>
      </footer>
    </div>
  )
}

export default App
