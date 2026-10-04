import type { Itinerary } from './plan'

export interface Departure {
  /** Minutes since midnight you need to set off. */
  at: number
  toName: string
  travelMins: number
  arrive: number
}

/** Every point in the day where you need to set off for the next stop. */
export function departures(itinerary: Itinerary): Departure[] {
  return itinerary.stops.map((stop, i) => ({
    at: i === 0 ? itinerary.start : itinerary.stops[i - 1].leave,
    toName: stop.suggestion.name,
    travelMins: stop.travelMins,
    arrive: stop.arrive,
  }))
}

export type LiveStatus =
  | { kind: 'before'; next: Departure }
  | { kind: 'travelling'; next: Departure }
  | { kind: 'waiting'; name: string; startsAt: number }
  | { kind: 'at'; name: string; until: number; next?: Departure }
  | { kind: 'done' }

export function liveStatus(itinerary: Itinerary, nowMins: number): LiveStatus {
  const deps = departures(itinerary)
  if (!deps.length) return { kind: 'done' }
  if (nowMins < deps[0].at) return { kind: 'before', next: deps[0] }

  for (let i = 0; i < itinerary.stops.length; i++) {
    const stop = itinerary.stops[i]
    if (nowMins < deps[i].at) continue
    if (nowMins < stop.arrive) return { kind: 'travelling', next: deps[i] }
    if (nowMins < stop.start) return { kind: 'waiting', name: stop.suggestion.name, startsAt: stop.start }
    if (nowMins < stop.leave) return { kind: 'at', name: stop.suggestion.name, until: stop.leave, next: deps[i + 1] }
  }
  return { kind: 'done' }
}
