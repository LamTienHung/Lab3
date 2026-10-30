import { useState } from 'react'
import { PUBG_VN_SQUADS } from './data/pubgSquads'
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry'
import './App.css'

function App() {
  const [selectedSquadId, setSelectedSquadId] = useState('ces')

  const selectedSquad = PUBG_VN_SQUADS.find(
    (squad) => squad.id === selectedSquadId
  )

  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">KRAFTON PUBG VIETNAM SERIES</p>
        <h1>Live Match Telemetry</h1>
        <p>Real-time squad performance monitoring dashboard</p>
      </header>

      <section className="telemetry-section" aria-label="Match telemetry">
        <h2>PUBG Vietnam Squads</h2>

        <nav className="squad-selector" aria-label="Select PUBG squad">
          {PUBG_VN_SQUADS.map((squad) => (
            <button
              key={squad.id}
              type="button"
              className={`squad-button ${
                selectedSquadId === squad.id ? 'active' : ''
              }`}
              aria-pressed={selectedSquadId === squad.id}
              onClick={() => setSelectedSquadId(squad.id)}
            >
              {squad.name}
            </button>
          ))}
        </nav>

        <p>Currently monitoring: {selectedSquad.name}</p>

        <PubgMatchTelemetry squad={selectedSquad} />
      </section>
    </main>
  )
}

export default App