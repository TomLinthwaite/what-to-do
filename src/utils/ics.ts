import type { Journey, JourneyOption } from '../types'
import type { Itinerary } from './plan'

function stamp(date: string, mins: number): string {
  const d = new Date(`${date}T00:00:00`)
  d.setMinutes(mins)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (m) => `\\${m}`)
}

/** Builds an .ics calendar file with one event per stop (times are local "floating" times). */
export function buildIcs(tripName: string, date: string, itinerary: Itinerary, journey?: Journey | null): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const travel = (o: JourneyOption, summary: string) =>
    [
      'BEGIN:VEVENT',
      `UID:${crypto.randomUUID()}@what-to-do`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(date, o.depart)}`,
      `DTEND:${stamp(date, o.arrive)}`,
      `SUMMARY:${escape(`${summary} (${o.operator})`)}`,
      `DESCRIPTION:${escape(o.bookingUrl ? `Booking: ${o.bookingUrl}` : '')}`,
      'END:VEVENT',
    ].join('\r\n')
  const journeyEvents = [
    journey?.outbound ? travel(journey.outbound, `Travel to ${tripName}`) : null,
    journey?.return ? travel(journey.return, 'Travel home') : null,
  ].filter((e): e is string => e !== null)
  const events = itinerary.stops.map((stop, i) => {
    const s = stop.suggestion
    const description = [s.description, s.bookingUrl ? `Booking: ${s.bookingUrl}` : ''].filter(Boolean).join('\n')
    return [
      'BEGIN:VEVENT',
      `UID:${crypto.randomUUID()}@what-to-do`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(date, stop.start)}`,
      `DTEND:${stamp(date, stop.leave)}`,
      `SUMMARY:${escape(`${i + 1}. ${s.name} (${tripName})`)}`,
      `LOCATION:${escape(s.address)}`,
      `GEO:${s.coords.lat};${s.coords.lng}`,
      `DESCRIPTION:${escape(description)}`,
      'END:VEVENT',
    ].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//What to do//EN', ...journeyEvents, ...events, 'END:VCALENDAR'].join('\r\n')
}

export function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
