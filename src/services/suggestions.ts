import { DEFAULT_CENTER, getTimeWindow, KID_AGE_GROUPS, WEATHER } from '../constants'
import { MOCK_EVENTS } from '../data/mockEvents'
import { MOCK_SUGGESTIONS } from '../data/mockSuggestions'
import type { Coordinates, Forecast, Preferences, SearchLocation, Suggestion } from '../types'
import { delay, relocate } from './mockBackend'

export function getOrigin(location: SearchLocation | null): Coordinates {
  return location?.coords ?? DEFAULT_CENTER
}

/**
 * Single entry point for fetching suggestions.
 * Currently returns filtered mock data — replace the body with real API calls
 * (e.g. Google Places + Overpass for places, Ticketmaster / Skiddle for events) when ready.
 */
export async function getSuggestions(
  location: SearchLocation,
  prefs: Preferences,
  forecast?: Forecast | null,
): Promise<Suggestion[]> {
  await delay(400)
  const places = relocate([...MOCK_SUGGESTIONS, ...MOCK_EVENTS], getOrigin(location))
  const wet = isWetDuring(forecast, prefs)

  return places
    .filter((s) => matchesPreferences(s, prefs))
    .sort((a, b) => score(b, prefs, wet) - score(a, prefs, wet))
}

/** Higher is better. Close, well-rated places that suit the group (and the weather) come first. */
function score(s: Suggestion, prefs: Preferences, wet: boolean): number {
  let value = (s.rating ?? 4) - s.distanceKm * 0.3
  if (s.goodFor.includes(prefs.groupType)) value += 0.4
  if (wet) value += s.indoor ? 0.6 : -0.6
  return value
}

export function isWetDuring(forecast: Forecast | null | undefined, prefs: Preferences): boolean {
  if (!forecast) return false
  const slots = prefs.timeWindow === 'all-day' ? (['morning', 'afternoon', 'evening'] as const) : [prefs.timeWindow]
  return slots.some((slot) => WEATHER[forecast.slots[slot].condition].wet)
}

export function matchesPreferences(s: Suggestion, prefs: Preferences): boolean {
  if (prefs.interests.length && !prefs.interests.includes(s.category)) return false
  if (s.distanceKm > prefs.radiusKm) return false
  if (prefs.timeWindow !== 'all-day' && !s.bestTimes.includes(prefs.timeWindow)) return false

  if (prefs.kids.length) {
    if (!s.kidFriendly) return false
    const youngest = Math.min(...prefs.kids.map((k) => KID_AGE_GROUPS.find((g) => g.value === k)?.minAge ?? 0))
    if (s.minAge !== undefined && youngest < s.minAge) return false
  }

  if (!prefs.accessNeeds.every((need) => s.access.includes(need))) return false

  if (prefs.maxPriceLevel < 4 && s.priceLevel !== undefined && s.priceLevel > prefs.maxPriceLevel) {
    return false
  }

  if (prefs.onlyOpen && !isOpenDuringWindow(s, prefs)) return false

  if (s.category === 'food' && prefs.dietary.length) {
    return prefs.dietary.every((d) => s.dietary?.includes(d))
  }
  return true
}

function isOpenDuringWindow(s: Suggestion, prefs: Preferences): boolean {
  const w = getTimeWindow(prefs.timeWindow)
  const start = w.startHour * 60
  const end = w.endHour * 60
  if (s.fixedStart !== undefined) return s.fixedStart >= start && s.fixedStart < end
  if (!s.openingHours) return true
  return s.openingHours.open < end && s.openingHours.close > start
}
