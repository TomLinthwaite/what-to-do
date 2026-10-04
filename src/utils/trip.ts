import { DEFAULT_PREFERENCES } from '../constants'
import type { Preferences, Suggestion, Trip } from '../types'
import { defaultPlanSettings } from './plan'

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function createTrip(preferences: Preferences = DEFAULT_PREFERENCES): Trip {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: 'My day out',
    date: todayISO(),
    location: null,
    preferences,
    shortlist: [],
    planIds: [],
    plan: defaultPlanSettings(preferences.timeWindow),
    journey: null,
    createdAt: now,
    updatedAt: now,
  }
}

/** Fills in any fields added since a trip was stored, so older saved trips keep working. */
export function normaliseTrip(trip: Trip): Trip {
  const base = createTrip()
  return {
    ...base,
    ...trip,
    preferences: { ...DEFAULT_PREFERENCES, ...trip.preferences },
    plan: { ...base.plan, ...trip.plan },
  }
}

export function planStops(trip: Trip): Suggestion[] {
  return trip.planIds
    .map((id) => trip.shortlist.find((s) => s.id === id))
    .filter((s): s is Suggestion => s !== undefined)
}

export function hasUnsavedChanges(trip: Trip): boolean {
  return !trip.savedAt || trip.updatedAt > trip.savedAt
}
