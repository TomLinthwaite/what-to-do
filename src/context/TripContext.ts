import { createContext } from 'react'
import type { Coordinates, Forecast, PlanSettings, Preferences, Suggestion, Trip } from '../types'

export interface TripContextValue {
  /** The trip currently being planned (persisted locally, saved to the account on request). */
  trip: Trip
  /** Plan stops in order. */
  stops: Suggestion[]
  origin: Coordinates
  forecast: Forecast | null
  results: Suggestion[] | null
  setResults: (results: Suggestion[] | null) => void
  update: (patch: Partial<Trip>) => void
  setPreferences: (preferences: Preferences) => void
  setPlan: (patch: Partial<PlanSettings>) => void
  toggleShortlist: (suggestion: Suggestion) => void
  removeFromShortlist: (id: string) => void
  togglePlan: (id: string) => void
  setPlanIds: (ids: string[]) => void
  /** Replaces the plan with these stops, adding any missing ones to the shortlist. */
  setPlanStops: (stops: Suggestion[]) => void
  loadTrip: (trip: Trip) => void
  newTrip: () => void
  saveTrip: () => Promise<Trip>
  /** Renames a saved trip (and the open copy, if it's the same trip). */
  renameSavedTrip: (id: string, name: string) => Promise<void>
}

export const TripContext = createContext<TripContextValue | null>(null)
