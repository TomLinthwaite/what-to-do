import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { PlanTimeline } from '../components/PlanTimeline'
import { getTransport } from '../constants'
import { useTrip } from '../hooks/useTrip'
import { getOrigin } from '../services/suggestions'
import { describeParty } from '../utils/format'
import { describeOption, journeyEmoji } from '../utils/journey'
import { buildItinerary, googleMapsRouteUrl } from '../utils/plan'
import { parseSharedTrip } from '../utils/share'
import { formatDate, hasUnsavedChanges, planStops } from '../utils/trip'
import { formatTime } from '../utils/time'

export function SharedTripPage() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { trip: current, loadTrip } = useTrip()
  const shared = useMemo(() => parseSharedTrip(hash), [hash])

  if (!shared) {
    return (
      <main className="narrow">
        <div className="status">
          <p>This share link is invalid or incomplete.</p>
          <Link to="/" className="btn btn-secondary">
            Plan your own day
          </Link>
        </div>
      </main>
    )
  }

  const stops = planStops(shared)
  const origin = getOrigin(shared.location)
  const transport = getTransport(shared.preferences.transport)
  const itinerary = buildItinerary(stops, { origin, preferences: shared.preferences, plan: shared.plan })

  function copyToPlanner() {
    if (!shared) return
    const dirty = current.shortlist.length > 0 && hasUnsavedChanges(current)
    if (dirty && !window.confirm('Replace your current trip with this one? Unsaved changes will be lost.')) return
    loadTrip(shared)
    navigate('/plan')
  }

  return (
    <main className="narrow stack">
      <div>
        <p className="muted">Shared plan</p>
        <h1>{shared.name}</h1>
        <p className="muted">
          📅 {formatDate(shared.date)} · 📍 {shared.location?.label ?? 'Unknown'} · {describeParty(shared.preferences)} ·{' '}
          {transport.label}
        </p>
      </div>
      <section className="panel">
        <PlanTimeline
          itinerary={itinerary}
          transport={transport}
          originLabel={shared.location?.label ?? 'start'}
          arrival={
            shared.journey?.outbound && (
              <>
                {journeyEmoji(shared.journey.outbound.mode)} Arrive from {shared.journey.from}: {describeOption(shared.journey.outbound)}
              </>
            )
          }
          departure={
            shared.journey?.return && (
              <>
                {journeyEmoji(shared.journey.return.mode)} Head home: {describeOption(shared.journey.return)}
              </>
            )
          }
        />
        <div className="plan-summary">
          <p>
            Finished around <strong>{formatTime(itinerary.end)}</strong> · est. £{itinerary.cost}
          </p>
          <div className="plan-actions">
            <button type="button" className="btn btn-primary" onClick={copyToPlanner}>
              Copy to my planner
            </button>
            <a className="btn btn-secondary" href={googleMapsRouteUrl(origin, stops, transport.googleMode, shared.plan.returnToStart)} target="_blank" rel="noreferrer">
              🗺️ Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
