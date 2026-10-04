import { useMemo, useState } from 'react'
import type { TransportInfo } from '../constants'
import { useLeaveReminders } from '../hooks/useLeaveReminders'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useNow } from '../hooks/useNow'
import { departures, liveStatus, type Departure } from '../utils/live'
import type { Itinerary } from '../utils/plan'
import { formatDuration, formatTime } from '../utils/time'

interface Props {
  itinerary: Itinerary
  transport: TransportInfo
}

/** Shown on the day of the trip: what's happening now, what's next, and leave reminders. */
export function LiveBanner({ itinerary, transport }: Props) {
  const now = useNow()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  // Keyed on content so reminder timers aren't reset every time the itinerary object is rebuilt.
  const depsKey = JSON.stringify(departures(itinerary))
  const deps = useMemo(() => JSON.parse(depsKey) as Departure[], [depsKey])
  const [enabled, setEnabled] = useLocalStorage('wtd:reminders', false)
  const [permission, setPermission] = useState(() => ('Notification' in window ? Notification.permission : 'denied'))
  useLeaveReminders(deps, enabled && permission === 'granted', transport)

  const status = liveStatus(itinerary, nowMins)
  const inMins = (at: number) => (at - nowMins <= 0 ? 'now' : `in ${formatDuration(at - nowMins)}`)

  async function toggleReminders() {
    if (enabled) {
      setEnabled(false)
      return
    }
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
    setEnabled(result === 'granted')
  }

  let headline: string
  let detail: string | null = null
  switch (status.kind) {
    case 'before':
      headline = `Leave ${inMins(status.next.at)} for ${status.next.toName}`
      detail = `${transport.emoji} ${formatDuration(status.next.travelMins)} ${transport.verb} · set off at ${formatTime(status.next.at)}`
      break
    case 'travelling':
      headline = `On your way to ${status.next.toName}`
      detail = `Arriving about ${formatTime(status.next.arrive)}`
      break
    case 'waiting':
      headline = `You're at ${status.name}`
      detail = `It opens/starts at ${formatTime(status.startsAt)}`
      break
    case 'at':
      headline = `Now: ${status.name} until ${formatTime(status.until)}`
      detail = status.next
        ? `Next: leave ${inMins(status.next.at)} for ${status.next.toName} (${formatDuration(status.next.travelMins)} ${transport.verb})`
        : 'Last stop of the day — enjoy it!'
      break
    default:
      headline = "That's your day done 🎉"
      detail = 'Remember to rate the places you visited.'
  }

  return (
    <section className="live" aria-live="polite">
      <div>
        <span className="live-badge">● Today</span>
        <strong className="live-headline">{headline}</strong>
        {detail && <span className="live-detail">{detail}</span>}
      </div>
      {status.kind !== 'done' && 'Notification' in window && (
        <button type="button" className={`btn btn-small ${enabled ? 'btn-primary' : 'btn-secondary'}`} onClick={toggleReminders} disabled={permission === 'denied'}>
          {permission === 'denied' ? '🔕 Notifications blocked' : enabled ? '🔔 Reminders on' : '🔔 Remind me when to leave'}
        </button>
      )}
    </section>
  )
}
