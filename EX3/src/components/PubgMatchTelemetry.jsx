import { useEffect, useState } from 'react'
import { fetchKraftonPubgTelemetry } from '../services/pubgTelemetry'

export function PubgMatchTelemetry({ squadId }) {
  const [view, setView] = useState({
    status: 'IDLE',
    data: null,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    fetchKraftonPubgTelemetry(squadId, {
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) {
          setView({
            status: 'SUCCESS',
            data,
            error: null,
          })
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError' || controller.signal.aborted) {
          return
        }

        setView({
          status: 'ERROR',
          data: null,
          error: error.message,
        })
      })

    return () => {
      controller.abort()
    }
  }, [squadId])

  if (view.status === 'IDLE' || view.status === 'LOADING') {
    return (
      <section aria-busy="true">
        <p>Connecting to KRAFTON satellite...</p>
      </section>
    )
  }

  if (view.status === 'ERROR') {
    return (
      <section role="alert">
        <p>Blue-Zone Link Lost: {view.error}</p>
      </section>
    )
  }

  if (view.status === 'SUCCESS') {
    return (
      <article
        className="telemetry-card"
        aria-label={`${view.data.name} telemetry`}
      >
        <header>
          <h3>{view.data.name}</h3>
          <p>Live Match Statistics</p>
        </header>

        <dl className="telemetry-stats">
          <dt>Map</dt>
          <dd>{view.data.map}</dd>

          <dt>Phase</dt>
          <dd>{view.data.phase}</dd>

          <dt>Alive Players</dt>
          <dd>{view.data.alive}</dd>

          <dt>Kills</dt>
          <dd>{view.data.kills}</dd>

          <dt>WWCD Probability</dt>
          <dd>{view.data.wwcdProb}</dd>

          <dt>Status</dt>
          <dd>{view.data.status}</dd>
        </dl>
      </article>
    )
  }

  return null
}