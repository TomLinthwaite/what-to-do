import type { PlaceEntry } from '../types'
import { delay, readJson, writeJson } from './mockBackend'

/**
 * MOCK PLACE LIBRARY — favourites, visits, ratings and notes, stored per owner in localStorage.
 * `ownerId` is the user's id, or 'guest' when logged out. Replace with a `place_entries` table
 * (owner_id, place_id, data) in your backend, keeping the same signatures.
 */

export type Library = Record<string, PlaceEntry>

const key = (ownerId: string) => `wtd:mock:library:${ownerId}`

export async function getLibrary(ownerId: string): Promise<Library> {
  await delay(100)
  return readJson<Library>(key(ownerId), {})
}

export async function saveEntry(ownerId: string, entry: PlaceEntry): Promise<void> {
  const library = readJson<Library>(key(ownerId), {})
  library[entry.place.id] = entry
  writeJson(key(ownerId), library)
}

export async function removeEntry(ownerId: string, placeId: string): Promise<void> {
  const library = readJson<Library>(key(ownerId), {})
  delete library[placeId]
  writeJson(key(ownerId), library)
}

/** Moves anything saved while logged out into the user's account. */
export async function mergeGuestLibrary(userId: string): Promise<Library> {
  const guest = readJson<Library>(key('guest'), {})
  const user = readJson<Library>(key(userId), {})
  for (const [id, entry] of Object.entries(guest)) {
    if (!user[id] || user[id].updatedAt < entry.updatedAt) user[id] = entry
  }
  writeJson(key(userId), user)
  localStorage.removeItem(key('guest'))
  return user
}

export async function deleteLibrary(ownerId: string): Promise<void> {
  localStorage.removeItem(key(ownerId))
}
