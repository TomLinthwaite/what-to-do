import { useEffect } from 'react'
import type { TransportInfo } from '../constants'
import type { Departure } from '../utils/live'
import { formatDuration, formatTime } from '../utils/time'

const LEAD_MINS = 10

async function notify(title: string, body: string) {
  // Android Chrome only allows notifications via a service worker registration.
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration) registration.showNotification(title, { body, icon: '/favicon.svg', tag: title })
  else new Notification(title, { body, icon: '/favicon.svg' })
}

/**
 * Schedules "leave in 10 minutes" notifications while the app is open.
 * Reminders when the app is closed need Web Push from a server — see README.
 */
export function useLeaveReminders(deps: Departure[], enabled: boolean, transport: TransportInfo) {
  useEffect(() => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return
    const midnight = new Date()
    midnight.setHours(0, 0, 0, 0)
    const timers = deps
      .map((d) => {
        const fireAt = midnight.getTime() + (d.at - LEAD_MINS) * 60_000
        const wait = fireAt - Date.now()
        if (wait < 0) return null
        return setTimeout(
          () =>
            notify(`Leave in ${LEAD_MINS} min for ${d.toName}`, `${transport.emoji} ${formatDuration(d.travelMins)} ${transport.verb} · arrive about ${formatTime(d.arrive)}`),
          wait,
        )
      })
      .filter((t): t is ReturnType<typeof setTimeout> => t !== null)
    return () => timers.forEach(clearTimeout)
  }, [deps, enabled, transport])
}
