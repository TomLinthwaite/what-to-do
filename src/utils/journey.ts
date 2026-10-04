import type { Journey, JourneyMode, JourneyOption, Preferences } from '../types'
import { parkingCost } from '../services/journeys'
import { formatDuration, formatTime } from './time'

export const JOURNEY_MODES: { value: JourneyMode; label: string; emoji: string }[] = [
  { value: 'train', label: 'Train', emoji: '🚆' },
  { value: 'coach', label: 'Coach', emoji: '🚌' },
  { value: 'car', label: 'Car', emoji: '🚗' },
]

export function journeyEmoji(mode: JourneyMode): string {
  return JOURNEY_MODES.find((m) => m.value === mode)?.emoji ?? '🚆'
}

export function describeOption(o: JourneyOption): string {
  const changes = o.mode === 'car' ? '' : o.changes ? ` · ${o.changes} change` : ' · direct'
  return `${formatTime(o.depart)} → ${formatTime(o.arrive)} · ${formatDuration(o.arrive - o.depart)}${changes}`
}

export function optionFare(o: JourneyOption, prefs: Preferences): number {
  return Math.round((o.pricePerAdult * prefs.adults + o.pricePerChild * prefs.kids.length) * 100) / 100
}

/** Total cost of getting there and back (fares for the group, or parking for the time you're there). */
export function journeyCost(journey: Journey | null, prefs: Preferences): number {
  if (!journey) return 0
  let total = 0
  if (journey.outbound) total += optionFare(journey.outbound, prefs)
  if (journey.return) total += optionFare(journey.return, prefs)
  if (journey.parking && journey.outbound && journey.return) {
    total += parkingCost(journey.parking, journey.return.depart - journey.outbound.arrive)
  }
  return Math.round(total * 100) / 100
}
