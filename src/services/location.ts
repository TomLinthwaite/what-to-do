import type { Coordinates } from '../types'

/** Uses the browser's built-in Geolocation API (no external service). */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Unable to get your location.')),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}
