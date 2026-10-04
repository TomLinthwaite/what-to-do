import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getOrigin } from '../services/suggestions'
import * as tripsService from '../services/trips'
import { getForecast } from '../services/weather'
import type { Forecast, Suggestion, Trip } from '../types'
import { defaultPlanSettings } from '../utils/plan'
import { createTrip, hasUnsavedChanges, normaliseTrip, planStops } from '../utils/trip'
import { TripContext, type TripContextValue } from './TripContext'

export function TripProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [trip, setTrip] = useLocalStorage<Trip>('wtd:draft', () => createTrip(), normaliseTrip)
  const [results, setResults] = useState<Suggestion[] | null>(null)
  const [fetched, setFetched] = useState<{ key: string; forecast: Forecast } | null>(null)

  const originForForecast = getOrigin(trip.location)
  const forecastKey = trip.location ? `${originForForecast.lat},${originForForecast.lng},${trip.date}` : null
  const forecast = forecastKey && fetched?.key === forecastKey ? fetched.forecast : null

  useEffect(() => {
    if (!forecastKey) return
    let cancelled = false
    const [lat, lng, date] = forecastKey.split(',')
    getForecast({ lat: Number(lat), lng: Number(lng) }, date).then((f) => {
      if (!cancelled) setFetched({ key: forecastKey, forecast: f })
    })
    return () => {
      cancelled = true
    }
  }, [forecastKey])

  const update = useCallback(
    (patch: Partial<Trip> | ((t: Trip) => Partial<Trip>)) =>
      setTrip((t) => ({ ...t, ...(typeof patch === 'function' ? patch(t) : patch), updatedAt: new Date().toISOString() })),
    [setTrip],
  )

  const value = useMemo<TripContextValue>(
    () => ({
      trip,
      stops: planStops(trip),
      origin: getOrigin(trip.location),
      forecast,
      results,
      setResults,
      update,
      setPreferences: (preferences) =>
        update((t) => ({
          preferences,
          plan:
            preferences.timeWindow !== t.preferences.timeWindow
              ? { ...defaultPlanSettings(preferences.timeWindow), returnToStart: t.plan.returnToStart, durationOverrides: t.plan.durationOverrides }
              : t.plan,
        })),
      setPlan: (patch) => update((t) => ({ plan: { ...t.plan, ...patch } })),
      toggleShortlist: (s) =>
        update((t) =>
          t.shortlist.some((x) => x.id === s.id)
            ? { shortlist: t.shortlist.filter((x) => x.id !== s.id), planIds: t.planIds.filter((id) => id !== s.id) }
            : { shortlist: [...t.shortlist, s] },
        ),
      removeFromShortlist: (id) =>
        update((t) => ({ shortlist: t.shortlist.filter((x) => x.id !== id), planIds: t.planIds.filter((p) => p !== id) })),
      togglePlan: (id) =>
        update((t) => ({ planIds: t.planIds.includes(id) ? t.planIds.filter((p) => p !== id) : [...t.planIds, id] })),
      setPlanIds: (planIds) => update({ planIds }),
      setPlanStops: (stops) =>
        update((t) => {
          const known = new Set(t.shortlist.map((s) => s.id))
          return { shortlist: [...t.shortlist, ...stops.filter((s) => !known.has(s.id))], planIds: stops.map((s) => s.id) }
        }),
      loadTrip: (next) => {
        setTrip(normaliseTrip(next))
        setResults(null)
      },
      newTrip: () => {
        setTrip(createTrip(user?.defaultPreferences))
        setResults(null)
      },
      saveTrip: async () => {
        if (!user) throw new Error('Log in to save trips.')
        const saved = await tripsService.saveTrip(user.id, trip)
        setTrip(saved)
        return saved
      },
      renameSavedTrip: async (id, name) => {
        if (!user) return
        const existing = (await tripsService.listTrips(user.id)).find((t) => t.id === id)
        if (!existing) return
        const saved = await tripsService.saveTrip(user.id, { ...existing, name })
        setTrip((t) => {
          if (t.id !== id) return t
          // Keep the open copy's "saved" state accurate: clean stays clean, unsaved stays unsaved.
          return hasUnsavedChanges(t)
            ? { ...t, name, updatedAt: new Date().toISOString() }
            : { ...t, name, savedAt: saved.savedAt, updatedAt: saved.updatedAt }
        })
      },
    }),
    [trip, forecast, results, update, setTrip, user],
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}
