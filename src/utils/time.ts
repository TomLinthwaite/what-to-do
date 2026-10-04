import type { DaySlot } from '../types'

/** Times are stored as minutes since midnight. */
export function formatTime(mins: number): string {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function parseTime(value: string): number {
  const [h, m] = value.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  if (!h) return `${m} min`
  return m ? `${h}h ${m}m` : `${h}h`
}

export function slotForTime(mins: number): DaySlot {
  if (mins < 12 * 60) return 'morning'
  if (mins < 17 * 60) return 'afternoon'
  return 'evening'
}

export function nowRoundedUp(step = 5): number {
  const d = new Date()
  return Math.ceil((d.getHours() * 60 + d.getMinutes()) / step) * step
}
