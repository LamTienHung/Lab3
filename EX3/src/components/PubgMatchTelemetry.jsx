export function PubgMatchTelemetry({ squad }) {
  if (!squad) {
    return (
      <section aria-label="Telemetry status">
        <p>Select a squad to view match telemetry.</p>
      </section>
    )
  }

  return (
    <article className="telemetry-card" aria-label={`${squad.name} telemetry`}>
      <header>
        <h3>{squad.name}</h3>
        <p>Live Match Statistics</p>
      </header>

      <dl className="telemetry-stats">
        <dt>Map</dt>
        <dd>{squad.map}</dd>

        <dt>Phase</dt>
        <dd>{squad.phase}</dd>

        <dt>Alive Players</dt>
        <dd>{squad.alive}</dd>

        <dt>Kills</dt>
        <dd>{squad.kills}</dd>

        <dt>WWCD Probability</dt>
        <dd>{squad.wwcdProb}</dd>

        <dt>Status</dt>
        <dd>{squad.status}</dd>
      </dl>
    </article>
  )
}