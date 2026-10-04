import type {
  AccessFeature,
  Coordinates,
  Dietary,
  EssentialType,
  GroupType,
  Interest,
  KidAgeGroup,
  Pace,
  Preferences,
  PriceLevel,
  TimeWindow,
  TransportMode,
  WeatherCondition,
} from './types'

/** Used when a location has no coordinates yet (e.g. typed in before geocoding is connected). */
export const DEFAULT_CENTER: Coordinates = { lat: 53.4808, lng: -2.2426 }

export const DEFAULT_PREFERENCES: Preferences = {
  timeWindow: 'all-day',
  interests: ['food', 'sightseeing'],
  dietary: [],
  radiusKm: 2,
  maxPriceLevel: 4,
  dayBudget: null,
  transport: 'walking',
  groupType: 'couple',
  adults: 2,
  kids: [],
  accessNeeds: [],
  pace: 'balanced',
  onlyOpen: true,
}

export const TIME_WINDOWS: { value: TimeWindow; label: string; startHour: number; endHour: number }[] = [
  { value: 'all-day', label: 'All day', startHour: 9, endHour: 21 },
  { value: 'morning', label: 'Morning', startHour: 9, endHour: 12 },
  { value: 'afternoon', label: 'Afternoon', startHour: 12, endHour: 17 },
  { value: 'evening', label: 'Evening', startHour: 17, endHour: 23 },
]

export const INTERESTS: { value: Interest; label: string; emoji: string }[] = [
  { value: 'food', label: 'Eat & drink', emoji: '🍽️' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎭' },
  { value: 'events', label: "What's on", emoji: '🎟️' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'sightseeing', label: 'Sightseeing', emoji: '🏛️' },
  { value: 'outdoors', label: 'Outdoors', emoji: '🌳' },
  { value: 'nightlife', label: 'Nightlife', emoji: '🌙' },
]

export const DIETARY_OPTIONS: { value: Dietary; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten-free', label: 'Gluten-free' },
]

export const BUDGETS: { value: PriceLevel; label: string }[] = [
  { value: 0, label: 'Free only' },
  { value: 1, label: '£' },
  { value: 2, label: '££' },
  { value: 3, label: '£££' },
  { value: 4, label: 'Any' },
]

export const GROUP_TYPES: { value: GroupType; label: string; emoji: string }[] = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'friends', label: 'Friends', emoji: '👯' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
]

export const KID_AGE_GROUPS: { value: KidAgeGroup; label: string; minAge: number }[] = [
  { value: 'under-5', label: 'Under 5', minAge: 0 },
  { value: '5-11', label: '5–11', minAge: 5 },
  { value: '12-17', label: '12–17', minAge: 12 },
]

export const ACCESS_NEEDS: { value: AccessFeature; label: string; emoji: string }[] = [
  { value: 'wheelchair', label: 'Wheelchair access', emoji: '♿' },
  { value: 'step-free', label: 'Step-free / pram', emoji: '🚼' },
  { value: 'baby-changing', label: 'Baby changing', emoji: '🍼' },
]

export const PACES: { value: Pace; label: string; durationFactor: number; bufferMins: number }[] = [
  { value: 'relaxed', label: 'Relaxed', durationFactor: 1.25, bufferMins: 15 },
  { value: 'balanced', label: 'Balanced', durationFactor: 1, bufferMins: 5 },
  { value: 'packed', label: 'Packed', durationFactor: 0.8, bufferMins: 0 },
]

export const MEAL_WINDOWS = [
  { label: 'Lunch', start: 12 * 60, end: 14 * 60 },
  { label: 'Dinner', start: 18 * 60, end: 20 * 60 },
]

export const WEATHER: Record<WeatherCondition, { label: string; emoji: string; wet: boolean }> = {
  sunny: { label: 'Sunny', emoji: '☀️', wet: false },
  cloudy: { label: 'Cloudy', emoji: '☁️', wet: false },
  showers: { label: 'Showers', emoji: '🌦️', wet: true },
  rain: { label: 'Rain', emoji: '🌧️', wet: true },
}

export const ESSENTIAL_TYPES: { value: EssentialType; label: string; emoji: string }[] = [
  { value: 'toilets', label: 'Toilets', emoji: '🚻' },
  { value: 'cash', label: 'Cash machine', emoji: '🏧' },
  { value: 'pharmacy', label: 'Pharmacy', emoji: '💊' },
  { value: 'charging', label: 'Phone charging', emoji: '🔋' },
  { value: 'parking', label: 'Parking', emoji: '🅿️' },
]

export interface TransportInfo {
  value: TransportMode
  label: string
  emoji: string
  verb: string
  /** Average door-to-door speed, used for rough travel estimates. */
  speedKmh: number
  /** Fixed extra time per journey (waiting, parking, etc.). */
  overheadMins: number
  maxRadiusKm: number
  /** Value for Google Maps' `travelmode` URL parameter. */
  googleMode: string
}

export const TRANSPORT_MODES: TransportInfo[] = [
  { value: 'walking', label: 'Walking', emoji: '🚶', verb: 'walk', speedKmh: 4.5, overheadMins: 0, maxRadiusKm: 5, googleMode: 'walking' },
  { value: 'public-transport', label: 'Public transport', emoji: '🚌', verb: 'by public transport', speedKmh: 18, overheadMins: 8, maxRadiusKm: 15, googleMode: 'transit' },
  { value: 'cycling', label: 'Cycling', emoji: '🚲', verb: 'cycle', speedKmh: 14, overheadMins: 2, maxRadiusKm: 10, googleMode: 'bicycling' },
  { value: 'driving', label: 'Driving', emoji: '🚗', verb: 'drive', speedKmh: 25, overheadMins: 10, maxRadiusKm: 30, googleMode: 'driving' },
]

export function getTransport(mode: TransportMode): TransportInfo {
  return TRANSPORT_MODES.find((t) => t.value === mode) ?? TRANSPORT_MODES[0]
}

export function getTimeWindow(value: TimeWindow) {
  return TIME_WINDOWS.find((t) => t.value === value) ?? TIME_WINDOWS[0]
}

export function getPace(value: Pace) {
  return PACES.find((p) => p.value === value) ?? PACES[1]
}

export function getInterest(value: Interest) {
  return INTERESTS.find((i) => i.value === value) ?? INTERESTS[0]
}
