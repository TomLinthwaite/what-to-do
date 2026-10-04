import { getTransport } from '../constants'
import type { Coordinates, TransportMode } from '../types'

/** Straight-line distances are shorter than real routes; this roughly compensates. */
const ROUTE_FACTOR = 1.3

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Rough estimate until a routing API (e.g. Google Routes) is connected. */
export function estimateTravelMins(km: number, mode: TransportMode): number {
  if (km < 0.05) return 0
  const t = getTransport(mode)
  return Math.max(1, Math.round(((km * ROUTE_FACTOR) / t.speedKmh) * 60 + t.overheadMins))
}
