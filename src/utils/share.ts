import type { Trip } from '../types'
import { normaliseTrip, planStops } from './trip'

/**
 * Share links carry the whole plan in the URL hash, so they work without a backend.
 * Once trips are stored server-side, share a trip ID instead.
 */
export function createShareUrl(trip: Trip): string {
  const stops = planStops(trip)
  const payload: Partial<Trip> = {
    name: trip.name,
    date: trip.date,
    location: trip.location,
    preferences: trip.preferences,
    plan: trip.plan,
    journey: trip.journey,
    shortlist: stops,
    planIds: stops.map((s) => s.id),
  }
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const base64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${window.location.origin}/shared#${base64}`
}

export function parseSharedTrip(hash: string): Trip | null {
  try {
    const base64 = hash.replace(/^#/, '').replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as Partial<Trip>
    if (!payload.shortlist?.length) return null
    return normaliseTrip({ ...payload, id: crypto.randomUUID(), savedAt: undefined } as Trip)
  } catch {
    return null
  }
}
