import { PUBG_VN_SQUADS } from './data/pubgSquads'
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry'
import './App.css'

function App() {
  const selectedSquad = PUBG_VN_SQUADS[0]

  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">KRAFTON PUBG VIETNAM SERIES</p>
        <h1>Live Match Telemetry</h1>
        <p>Real-time squad performance monitoring dashboard</p>
      </header>

      <section className="telemetry-section" aria-label="Match telemetry">
        <h2>PUBG Vietnam Squads</h2>

        <p>Currently monitoring: {selectedSquad.name}</p>

        <PubgMatchTelemetry squad={selectedSquad} />
      </section>
    </main>
  )
}

export default App