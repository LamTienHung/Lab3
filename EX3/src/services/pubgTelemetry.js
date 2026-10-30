import { PUBG_VN_SQUADS } from '../data/pubgSquads'

export function fetchKraftonPubgTelemetry(squadId, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'))
      return
    }

    const delay = 1500 + Math.random() * 1500

    const timerId = window.setTimeout(() => {
      if (Math.random() < 0.35) {
        reject(new Error('Satellite connection timed out'))
        return
      }

      const squad = PUBG_VN_SQUADS.find(
        (item) => item.id === squadId
      )

      if (!squad) {
        reject(new Error('Squad not found'))
        return
      }

      resolve(squad)
    }, delay)

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timerId)
        reject(new DOMException('Request aborted', 'AbortError'))
      },
      { once: true }
    )
  })
}