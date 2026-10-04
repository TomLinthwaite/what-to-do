import { createContext } from 'react'
import type { PlaceEntry, Suggestion } from '../types'

export interface LibraryContextValue {
  entries: PlaceEntry[]
  get: (placeId: string) => PlaceEntry | undefined
  toggleFavourite: (place: Suggestion) => void
  /** Marks a place visited (or not) and optionally records a rating and note. */
  review: (place: Suggestion, review: { visited: boolean; rating?: PlaceEntry['rating']; note?: string }) => void
  remove: (placeId: string) => void
}

export const LibraryContext = createContext<LibraryContextValue | null>(null)
