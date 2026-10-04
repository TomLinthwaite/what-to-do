import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import * as libraryService from '../services/library'
import type { PlaceEntry, Suggestion } from '../types'
import { todayISO } from '../utils/trip'
import { LibraryContext, type LibraryContextValue } from './LibraryContext'

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const ownerId = user?.id ?? 'guest'
  const [loaded, setLoaded] = useState<{ ownerId: string; library: libraryService.Library } | null>(null)
  const library = useMemo(() => (loaded?.ownerId === ownerId ? loaded.library : {}), [loaded, ownerId])

  useEffect(() => {
    if (loading) return
    let cancelled = false
    const load = user ? libraryService.mergeGuestLibrary(user.id) : libraryService.getLibrary('guest')
    load.then((lib) => {
      if (!cancelled) setLoaded({ ownerId, library: lib })
    })
    return () => {
      cancelled = true
    }
  }, [user, loading, ownerId])

  const save = useCallback(
    (entry: PlaceEntry | null, placeId: string) => {
      setLoaded((prev) => {
        const next = { ...(prev?.ownerId === ownerId ? prev.library : {}) }
        if (entry) next[placeId] = entry
        else delete next[placeId]
        return { ownerId, library: next }
      })
      if (entry) libraryService.saveEntry(ownerId, entry)
      else libraryService.removeEntry(ownerId, placeId)
    },
    [ownerId],
  )

  const value = useMemo<LibraryContextValue>(() => {
    const upsert = (place: Suggestion, patch: Partial<PlaceEntry>) => {
      const base: Omit<PlaceEntry, 'place' | 'updatedAt'> = library[place.id] ?? { favourite: false }
      const entry: PlaceEntry = { ...base, ...patch, place, updatedAt: new Date().toISOString() }
      // Drop entries that no longer hold anything.
      const empty = !entry.favourite && !entry.visitedAt && !entry.rating && !entry.note
      save(empty ? null : entry, place.id)
    }

    return {
      entries: Object.values(library).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      get: (id) => library[id],
      toggleFavourite: (place) => upsert(place, { favourite: !library[place.id]?.favourite }),
      review: (place, { visited, rating, note }) =>
        upsert(place, {
          visitedAt: visited ? (library[place.id]?.visitedAt ?? todayISO()) : undefined,
          rating,
          note: note?.trim() || undefined,
        }),
      remove: (id) => save(null, id),
    }
  }, [library, save])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
