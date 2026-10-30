import { useEffect, useState } from 'react'
import { fetchKraftonPubgTelemetry } from '../services/pubgTelemetry'

export function PubgMatchTelemetry({ squadId }) {
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const [view, setView] = useState({
    status: 'IDLE',
    data: null,
    error: null,
  })

  useEffect(() => {
  if (!isConnected) return

  const controller = new AbortController()

    fetchKraftonPubgTelemetry(squadId, {
      signal: controller.signal,
    })
      .then((data) => {
        if (controller.signal.aborted) return

        setView({
          status: 'SUCCESS',
          data,
          error: null,
        })
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

    return () => controller.abort()
  }, [squadId, retryCount, isConnected])

  if (view.status === 'IDLE') {
  return (
    <section className="telemetry-card">
      <h3>Satellite Disconnected</h3>
      <p>Select Connect Satellite to start monitoring.</p>

      <button
        type="button"
        className="retry-button"
        onClick={() => {
          setView({
            status: 'LOADING',
            data: null,
            error: null,
          })
          setIsConnected(true)
        }}
      >
        Connect Satellite
      </button>
    </section>
  )
}

  if (view.status === 'LOADING') {
    return (
      <section
        className="telemetry-skeleton"
        aria-label="Loading match telemetry"
        aria-busy="true"
      >
        <p role="status">Connecting to KRAFTON satellite...</p>
        <span className="skeleton-line" aria-hidden="true" />
        <span className="skeleton-line short" aria-hidden="true" />
        <span className="skeleton-line" aria-hidden="true" />
      </section>
    )
  }

  if (view.status === 'ERROR') {
    return (
      <section className="telemetry-error" role="alert">
        <h3>Blue-Zone Link Lost</h3>
        <p>{view.error}</p>

        <button
          type="button"
          className="retry-button"
          onClick={() => {
  setView({
    status: 'LOADING',
    data: null,
    error: null,
  })
  setRetryCount((count) => count + 1)
}}
        >
          Reconnect Satellite
        </button>
      </section>
    )
  }

  if (view.status === 'SUCCESS') {
    const squad = view.data

    return (
      <article
        className="telemetry-card"
        aria-label={`${squad.name} telemetry`}
      >
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

  return null
}