import { getPace, getTimeWindow, MEAL_WINDOWS, WEATHER } from '../constants'
import type { Coordinates, Forecast, PlanSettings, Preferences, Suggestion } from '../types'
import { distanceKm, estimateTravelMins } from './geo'
import { formatDuration, formatTime, parseTime, slotForTime } from './time'

export interface ItineraryOptions {
  origin: Coordinates
  preferences: Preferences
  plan: PlanSettings
  forecast?: Forecast | null
}

export interface ItineraryStop {
  suggestion: Suggestion
  legKm: number
  travelMins: number
  arrive: number
  /** When the visit actually starts (after waiting for opening / event start). */
  start: number
  leave: number
  durationMins: number
  waitMins: number
  warnings: string[]
}

export interface Leg {
  legKm: number
  travelMins: number
}

export interface Itinerary {
  stops: ItineraryStop[]
  returnLeg: Leg | null
  start: number
  end: number
  finishBy: number
  overrunMins: number
  totalTravelMins: number
  cost: number
  bookingCount: number
}

export function visitLength(s: Suggestion, prefs: Preferences, plan: PlanSettings): number {
  const override = plan.durationOverrides[s.id]
  if (override !== undefined) return override
  if (s.fixedStart !== undefined) return s.durationMins
  return Math.max(15, Math.round((s.durationMins * getPace(prefs.pace).durationFactor) / 5) * 5)
}

export function costFor(s: Suggestion, prefs: Preferences): number {
  return s.costPerAdult * prefs.adults + s.costPerChild * prefs.kids.length
}

export function buildItinerary(stops: Suggestion[], opts: ItineraryOptions): Itinerary {
  const { origin, preferences: prefs, plan, forecast } = opts
  const buffer = getPace(prefs.pace).bufferMins
  const start = parseTime(plan.startTime)
  let clock = start
  let from = origin
  let totalTravelMins = 0

  const result = stops.map((s, i): ItineraryStop => {
    const legKm = distanceKm(from, s.coords)
    const travelMins = estimateTravelMins(legKm, prefs.transport)
    const arrive = clock + travelMins + (i > 0 ? buffer : 0)
    const durationMins = visitLength(s, prefs, plan)
    const warnings: string[] = []
    let visitStart = arrive

    if (s.fixedStart !== undefined) {
      if (arrive <= s.fixedStart) visitStart = s.fixedStart
      else warnings.push(`Starts at ${formatTime(s.fixedStart)} — you'd arrive ${formatDuration(arrive - s.fixedStart)} late`)
    } else if (s.openingHours && arrive < s.openingHours.open) {
      visitStart = s.openingHours.open
    }

    const leave = visitStart + durationMins

    if (s.openingHours) {
      const { close } = s.openingHours
      if (visitStart >= close) warnings.push(`Closed by the time you arrive (closes ${formatTime(close)})`)
      else if (leave > close) warnings.push(`Closes at ${formatTime(close)} — you'll only get ${formatDuration(close - visitStart)}`)
    }

    const slot = slotForTime(visitStart)
    if (s.fixedStart === undefined && !s.bestTimes.includes(slot)) {
      warnings.push(`Best visited in the ${s.bestTimes.join(' or ')}`)
    }
    if (!s.indoor && forecast && WEATHER[forecast.slots[slot].condition].wet) {
      warnings.push(`${WEATHER[forecast.slots[slot].condition].emoji} ${forecast.slots[slot].rainChance}% chance of rain — this one's outdoors`)
    }

    clock = leave
    from = s.coords
    totalTravelMins += travelMins
    return { suggestion: s, legKm, travelMins, arrive, start: visitStart, leave, durationMins, waitMins: visitStart - arrive, warnings }
  })

  let returnLeg: Leg | null = null
  if (plan.returnToStart && stops.length) {
    const legKm = distanceKm(from, origin)
    returnLeg = { legKm, travelMins: estimateTravelMins(legKm, prefs.transport) }
    clock += returnLeg.travelMins
    totalTravelMins += returnLeg.travelMins
  }

  const finishBy = parseTime(plan.finishBy)
  return {
    stops: result,
    returnLeg,
    start,
    end: clock,
    finishBy,
    overrunMins: Math.max(0, clock - finishBy),
    totalTravelMins,
    cost: stops.reduce((sum, s) => sum + costFor(s, prefs), 0),
    bookingCount: stops.filter((s) => s.bookingRequired).length,
  }
}

/** Nearest-neighbour ordering from the start point. Good enough for a handful of stops. */
export function optimiseOrder(stops: Suggestion[], origin: Coordinates): Suggestion[] {
  const remaining = [...stops]
  const ordered: Suggestion[] = []
  let from = origin
  while (remaining.length) {
    let bestIndex = 0
    remaining.forEach((s, i) => {
      if (distanceKm(from, s.coords) < distanceKm(from, remaining[bestIndex].coords)) bestIndex = i
    })
    const [next] = remaining.splice(bestIndex, 1)
    ordered.push(next)
    from = next.coords
  }
  return ordered
}

/**
 * Inserts a lunch and/or dinner stop where the day spans a meal time and there isn't already
 * a food stop then. Picks the nearest suitable candidate to the previous stop.
 */
export function addMealBreaks(
  stops: Suggestion[],
  foodCandidates: Suggestion[],
  opts: ItineraryOptions,
): { stops: Suggestion[]; added: Suggestion[] } {
  let current = [...stops]
  const added: Suggestion[] = []

  for (const meal of MEAL_WINDOWS) {
    const itinerary = buildItinerary(current, opts)
    // Only add a meal if the day is actually under way around that mealtime.
    if (itinerary.start > meal.end - 30 || itinerary.end < meal.start - 45) continue

    const hasMeal = itinerary.stops.some(
      (st) => st.suggestion.category === 'food' && st.start < meal.end && st.leave > meal.start,
    )
    if (hasMeal) continue

    // Insert into the gap between stops that's closest to the ideal mealtime.
    const ideal = meal.start + 30
    const gapTimes = [itinerary.start, ...itinerary.stops.map((st) => st.leave)]
    const insertAt = gapTimes.reduce(
      (best, t, i) => (Math.abs(t - ideal) < Math.abs(gapTimes[best] - ideal) ? i : best),
      0,
    )
    const near = insertAt > 0 ? current[insertAt - 1].coords : opts.origin
    const usedIds = new Set(current.map((s) => s.id))
    const slot = slotForTime(meal.start)

    const choice = foodCandidates
      .filter((c) => !usedIds.has(c.id) && !c.snackOnly && c.bestTimes.includes(slot))
      .filter((c) => !c.openingHours || (c.openingHours.open <= meal.start && c.openingHours.close >= meal.start + 60))
      .sort((a, b) => distanceKm(near, a.coords) - distanceKm(near, b.coords))[0]

    if (choice) {
      current = [...current.slice(0, insertAt), choice, ...current.slice(insertAt)]
      added.push(choice)
    }
  }

  return { stops: current, added }
}

/** Builds a varied plan that roughly fills the time window, then orders it and adds meals. */
export function surpriseStops(
  candidates: Suggestion[],
  foodCandidates: Suggestion[],
  opts: ItineraryOptions,
): Suggestion[] {
  const w = getTimeWindow(opts.preferences.timeWindow)
  const available = (w.endHour - w.startHour) * 60 * 0.7
  const picked: Suggestion[] = []
  const perCategory = new Map<string, number>()
  let used = 0

  for (const c of candidates) {
    if (c.category === 'food' || c.fixedStart !== undefined) continue
    if ((perCategory.get(c.category) ?? 0) >= 2) continue
    const cost = visitLength(c, opts.preferences, opts.plan) + 20
    if (used + cost > available) continue
    picked.push(c)
    used += cost
    perCategory.set(c.category, (perCategory.get(c.category) ?? 0) + 1)
  }

  const ordered = optimiseOrder(picked, opts.origin)
  return addMealBreaks(ordered, foodCandidates, opts).stops
}

export function googleMapsRouteUrl(origin: Coordinates, stops: Suggestion[], googleMode: string, returnToStart = false): string {
  const fmt = (c: Coordinates) => `${c.lat},${c.lng}`
  const points = stops.map((s) => s.coords)
  if (returnToStart) points.push(origin)
  const params = new URLSearchParams({
    api: '1',
    origin: fmt(origin),
    destination: fmt(points[points.length - 1]),
    travelmode: googleMode,
  })
  if (points.length > 1) params.set('waypoints', points.slice(0, -1).map(fmt).join('|'))
  return `https://www.google.com/maps/dir/?${params}`
}

export function defaultPlanSettings(timeWindow: Preferences['timeWindow']): PlanSettings {
  const w = getTimeWindow(timeWindow)
  return {
    startTime: formatTime(w.startHour * 60),
    finishBy: formatTime(w.endHour * 60),
    returnToStart: false,
    durationOverrides: {},
  }
}
