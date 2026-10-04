import type { Trip } from '../types'
import { delay, readJson, writeJson } from './mockBackend'

/**
 * MOCK TRIP STORAGE — saved per user in localStorage.
 * Replace with real API calls (e.g. a `trips` table in Supabase/Firestore) keeping the same signatures.
 */

const key = (userId: string) => `wtd:mock:trips:${userId}`

export async function listTrips(userId: string): Promise<Trip[]> {
  await delay(200)
  return readJson<Trip[]>(key(userId), []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function saveTrip(userId: string, trip: Trip): Promise<Trip> {
  await delay(200)
  const trips = readJson<Trip[]>(key(userId), [])
  const now = new Date().toISOString()
  const saved: Trip = { ...trip, updatedAt: now, savedAt: now }
  const index = trips.findIndex((t) => t.id === trip.id)
  if (index === -1) trips.push(saved)
  else trips[index] = saved
  writeJson(key(userId), trips)
  return saved
}

export async function deleteTrip(userId: string, tripId: string): Promise<void> {
  await delay(150)
  writeJson(key(userId), readJson<Trip[]>(key(userId), []).filter((t) => t.id !== tripId))
}
