import { DEFAULT_CENTER } from '../constants'
import type { Coordinates } from '../types'
import { distanceKm } from '../utils/geo'

/** Helpers shared by the mock services. Delete this file once real APIs are connected. */

export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/** Moves mock items (positioned around DEFAULT_CENTER) so they sit around `origin`, and adds distanceKm. */
export function relocate<T extends { coords: Coordinates }>(items: T[], origin: Coordinates) {
  const dLat = origin.lat - DEFAULT_CENTER.lat
  const dLng = origin.lng - DEFAULT_CENTER.lng
  return items.map((item) => {
    const coords = { lat: item.coords.lat + dLat, lng: item.coords.lng + dLng }
    return { ...item, coords, distanceKm: Math.round(distanceKm(origin, coords) * 10) / 10 }
  })
}

export function hashString(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}
