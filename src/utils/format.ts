import { BUDGETS, getInterest, getPace, getTimeWindow, getTransport, GROUP_TYPES, KID_AGE_GROUPS } from '../constants'
import type { Preferences, PriceLevel, Suggestion } from '../types'
import { formatTime } from './time'

export function priceLabel(level: PriceLevel | undefined): string | null {
  if (level === undefined) return null
  return level === 0 ? 'Free' : '£'.repeat(level)
}

export function openingLabel(s: Suggestion): string {
  if (s.fixedStart !== undefined) return `🎟️ Starts ${formatTime(s.fixedStart)}`
  if (s.openingHours) return `🕘 ${formatTime(s.openingHours.open)}–${formatTime(s.openingHours.close)}`
  return '🕘 Open all day'
}

export function describeParty(p: Preferences): string {
  const adults = `${p.adults} adult${p.adults === 1 ? '' : 's'}`
  if (!p.kids.length) return adults
  const ages = p.kids.map((k) => KID_AGE_GROUPS.find((g) => g.value === k)?.label).join(', ')
  return `${adults}, ${p.kids.length} kid${p.kids.length === 1 ? '' : 's'} (${ages})`
}

/** Short human-readable summary lines, e.g. for showing saved defaults. */
export function describePreferences(p: Preferences): string[] {
  return [
    `${GROUP_TYPES.find((g) => g.value === p.groupType)?.label} · ${describeParty(p)}`,
    `${getTimeWindow(p.timeWindow).label} · ${getTransport(p.transport).label} · ${getPace(p.pace).label} pace`,
    `Into: ${p.interests.length ? p.interests.map((i) => getInterest(i).label).join(', ') : 'anything'}`,
    `Budget: ${BUDGETS.find((b) => b.value === p.maxPriceLevel)?.label} per activity${p.dayBudget !== null ? `, £${p.dayBudget} for the day` : ''}`,
    ...(p.dietary.length ? [`Food: ${p.dietary.join(', ')}`] : []),
    ...(p.accessNeeds.length ? [`Access: ${p.accessNeeds.join(', ')}`] : []),
  ]
}
