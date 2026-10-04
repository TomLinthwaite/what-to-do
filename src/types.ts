export type TimeWindow = 'all-day' | 'morning' | 'afternoon' | 'evening'

export type DaySlot = Exclude<TimeWindow, 'all-day'>

export type Interest =
  | 'food'
  | 'entertainment'
  | 'shopping'
  | 'sightseeing'
  | 'outdoors'
  | 'nightlife'
  | 'events'

export type Dietary = 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten-free'

export type TransportMode = 'walking' | 'public-transport' | 'cycling' | 'driving'

export type GroupType = 'solo' | 'couple' | 'friends' | 'family'

export type KidAgeGroup = 'under-5' | '5-11' | '12-17'

export type Pace = 'relaxed' | 'balanced' | 'packed'

export type AccessFeature = 'wheelchair' | 'step-free' | 'baby-changing'

/** 0 = free, 4 = very expensive (matches Google's price levels). */
export type PriceLevel = 0 | 1 | 2 | 3 | 4

export interface Coordinates {
  lat: number
  lng: number
}

export interface SearchLocation {
  label: string
  coords?: Coordinates
}

export interface Preferences {
  timeWindow: TimeWindow
  interests: Interest[]
  dietary: Dietary[]
  radiusKm: number
  /** Highest price level to include. 4 = any budget. */
  maxPriceLevel: PriceLevel
  /** Total spend for the whole group for the day, in £. null = no limit. */
  dayBudget: number | null
  transport: TransportMode
  groupType: GroupType
  adults: number
  /** One entry per child. */
  kids: KidAgeGroup[]
  accessNeeds: AccessFeature[]
  pace: Pace
  /** Hide places that are closed for the whole of the chosen time window. */
  onlyOpen: boolean
}

export interface OpeningHours {
  /** Minutes since midnight. */
  open: number
  close: number
}

export interface Suggestion {
  id: string
  name: string
  category: Interest
  description: string
  address: string
  coords: Coordinates
  /** Distance from the search location. */
  distanceKm: number
  /** Typical time spent there, used to build the plan. */
  durationMins: number
  rating?: number
  priceLevel?: PriceLevel
  /** Rough cost in £ per person. */
  costPerAdult: number
  costPerChild: number
  bestTimes: DaySlot[]
  /** Undefined = always open (e.g. parks). */
  openingHours?: OpeningHours
  /** Events only: fixed start time in minutes since midnight. */
  fixedStart?: number
  indoor: boolean
  dietary?: Dietary[]
  /** Food places that don't serve proper meals (ice cream, coffee) — skipped for meal breaks. */
  snackOnly?: boolean
  kidFriendly: boolean
  minAge?: number
  access: AccessFeature[]
  goodFor: GroupType[]
  bookingRequired?: boolean
  bookingUrl?: string
  url?: string
}

export interface PlanSettings {
  /** HH:MM */
  startTime: string
  /** HH:MM */
  finishBy: string
  returnToStart: boolean
  /** Per-stop visit length overrides, in minutes. */
  durationOverrides: Record<string, number>
}

export type JourneyMode = 'train' | 'coach' | 'car'

export interface JourneyOption {
  id: string
  mode: JourneyMode
  direction: 'outbound' | 'return'
  /** Minutes since midnight. */
  depart: number
  arrive: number
  changes: number
  operator: string
  /** £ per person (0 for driving). */
  pricePerAdult: number
  pricePerChild: number
  bookingUrl?: string
  note?: string
}

export interface ParkingOption {
  id: string
  name: string
  coords: Coordinates
  distanceKm: number
  pricePerHour: number
  maxDayPrice: number
  evCharging: boolean
  bookingUrl: string
}

export interface Journey {
  from: string
  mode: JourneyMode
  outbound?: JourneyOption
  return?: JourneyOption
  parking?: ParkingOption
}

/** A place in the user's library — favourited and/or visited with a rating and notes. */
export interface PlaceEntry {
  place: Suggestion
  favourite: boolean
  /** ISO date the place was marked as visited. */
  visitedAt?: string
  rating?: 1 | 2 | 3 | 4 | 5
  note?: string
  updatedAt: string
}

export interface Trip {
  id: string
  name: string
  /** YYYY-MM-DD */
  date: string
  location: SearchLocation | null
  preferences: Preferences
  shortlist: Suggestion[]
  planIds: string[]
  plan: PlanSettings
  journey: Journey | null
  createdAt: string
  updatedAt: string
  /** Set once the trip has been saved to an account. */
  savedAt?: string
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  defaultPreferences?: Preferences
  /** Where the user usually travels from (town or station), used to prefill journeys. */
  home?: string
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'showers' | 'rain'

export interface SlotForecast {
  condition: WeatherCondition
  tempC: number
  rainChance: number
}

export interface Forecast {
  date: string
  slots: Record<DaySlot, SlotForecast>
}

export type EssentialType = 'toilets' | 'cash' | 'parking' | 'charging' | 'pharmacy'

export interface Essential {
  id: string
  type: EssentialType
  name: string
  coords: Coordinates
  distanceKm: number
  note?: string
}
