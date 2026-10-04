import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { EssentialsPanel } from '../components/EssentialsPanel'
import { FavouriteButton } from '../components/FavouriteButton'
import { JourneyPanel } from '../components/JourneyPanel'
import { LiveBanner } from '../components/LiveBanner'
import { PlaceReview } from '../components/PlaceReview'
import { PlanTimeline } from '../components/PlanTimeline'
import { WeatherBar } from '../components/WeatherBar'
import { getTransport } from '../constants'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import { getSuggestions, isWetDuring } from '../services/suggestions'
import { describeParty } from '../utils/format'
import { buildIcs, downloadFile } from '../utils/ics'
import { describeOption, journeyCost, journeyEmoji } from '../utils/journey'
import { addMealBreaks, buildItinerary, googleMapsRouteUrl, optimiseOrder, visitLength } from '../utils/plan'
import { createShareUrl } from '../utils/share'
import { formatDuration, formatTime, nowRoundedUp } from '../utils/time'
import { todayISO } from '../utils/trip'

export function PlanPage() {
  const { trip, stops, origin, forecast, setPlan, setPlanIds, setPlanStops, togglePlan, saveTrip } = useTrip()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { preferences: prefs, plan } = trip
  const transport = getTransport(prefs.transport)
  const originLabel = trip.location?.label ?? 'your start point'

  if (stops.length === 0) {
    return (
      <main className="narrow">
        <div className="status">
          <p>Nothing in your plan yet — tick some places on your shortlist, or use “Surprise me”.</p>
          <Link to="/shortlist" className="btn btn-secondary">
            Go to shortlist
          </Link>
        </div>
      </main>
    )
  }

  const opts = { origin, preferences: prefs, plan, forecast }
  const itinerary = buildItinerary(stops, opts)
  const travelCost = journeyCost(trip.journey, prefs)
  const totalCost = Math.round((itinerary.cost + travelCost) * 100) / 100
  const overBudget = prefs.dayBudget !== null && totalCost > prefs.dayBudget
  const { outbound, return: inbound } = trip.journey ?? {}

  function move(index: number, delta: number) {
    const ids = stops.map((s) => s.id)
    const [id] = ids.splice(index, 1)
    ids.splice(index + delta, 0, id)
    setPlanIds(ids)
  }

  function adjustDuration(id: string, delta: number) {
    const stop = stops.find((s) => s.id === id)
    if (!stop) return
    const current = visitLength(stop, prefs, plan)
    setPlan({ durationOverrides: { ...plan.durationOverrides, [id]: Math.max(15, current + delta) } })
  }

  function resetDuration(id: string) {
    const rest = { ...plan.durationOverrides }
    delete rest[id]
    setPlan({ durationOverrides: rest })
  }

  async function addMeals() {
    if (!trip.location) return
    setBusy(true)
    try {
      const food = await getSuggestions(trip.location, { ...prefs, interests: ['food'], timeWindow: 'all-day', onlyOpen: false }, forecast)
      const result = addMealBreaks(stops, food, opts)
      if (result.added.length) {
        setPlanStops(result.stops)
        setMessage(`Added ${result.added.map((s) => s.name).join(' and ')}.`)
      } else {
        setMessage('No meal breaks needed — or nothing suitable is open nearby.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!user) {
      navigate('/login?next=/plan')
      return
    }
    setBusy(true)
    try {
      await saveTrip()
      setMessage('Trip saved to your account.')
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    const url = createShareUrl(trip)
    if (navigator.share) {
      try {
        await navigator.share({ title: trip.name, text: `Here's our plan for ${trip.name}`, url })
        return
      } catch {
        // User cancelled or share failed — fall back to copying.
      }
    }
    await navigator.clipboard.writeText(url)
    setMessage('Share link copied to clipboard.')
  }

  function exportCalendar() {
    const slug = trip.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'trip'
    downloadFile(`${slug}.ics`, buildIcs(trip.name, trip.date, itinerary, trip.journey), 'text/calendar')
  }

  return (
    <main className="plan-layout">
      <div className="plan-main">
        {trip.date === todayISO() && <LiveBanner itinerary={itinerary} transport={transport} />}
        <WeatherBar forecast={forecast} wet={isWetDuring(forecast, prefs)} />

        <section className="panel">
          <div className="plan-header">
            <h2 className="section-title">Your day</h2>
            <div className="plan-controls">
              <label className="inline-field">
                Start
                <input type="time" value={plan.startTime} onChange={(e) => setPlan({ startTime: e.target.value })} />
              </label>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => setPlan({ startTime: formatTime(nowRoundedUp()) })}>
                Now
              </button>
              <label className="inline-field">
                Finish by
                <input type="time" value={plan.finishBy} onChange={(e) => setPlan({ finishBy: e.target.value })} />
              </label>
              <label className="inline-field">
                <input type="checkbox" checked={plan.returnToStart} onChange={(e) => setPlan({ returnToStart: e.target.checked })} />
                Return to start
              </label>
            </div>
            <div className="plan-controls">
              <button type="button" className="btn btn-secondary btn-small" onClick={() => setPlanIds(optimiseOrder(stops, origin).map((s) => s.id))} disabled={stops.length < 2}>
                ✨ Shortest route
              </button>
              <button type="button" className="btn btn-secondary btn-small" onClick={addMeals} disabled={busy}>
                🍴 Add meal breaks
              </button>
            </div>
          </div>

          {message && <p className="notice">{message}</p>}

          <PlanTimeline
            itinerary={itinerary}
            transport={transport}
            originLabel={originLabel}
            edit={{
              onMove: move,
              onRemove: togglePlan,
              onAdjustDuration: adjustDuration,
              onResetDuration: resetDuration,
              overriddenIds: new Set(Object.keys(plan.durationOverrides)),
            }}
            renderStopExtras={(s) => (
              <div className="stop-extras">
                <FavouriteButton place={s} />
                <PlaceReview place={s} />
              </div>
            )}
            arrival={
              outbound && (
                <>
                  {journeyEmoji(outbound.mode)} Arrive from {trip.journey?.from}: {describeOption(outbound)} · {outbound.operator}
                </>
              )
            }
            departure={
              inbound && (
                <>
                  {journeyEmoji(inbound.mode)} Head home: {describeOption(inbound)} · {inbound.operator}
                  {inbound.depart < itinerary.end + 10 && <span className="warning"> ⚠️ Leaves before your plan ends</span>}
                </>
              )
            }
          />

          <div className="plan-summary">
            <div className="summary-grid">
              <div>
                <small>Finish</small>
                <strong>{formatTime(itinerary.end)}</strong>
              </div>
              <div>
                <small>Travelling</small>
                <strong>{formatDuration(itinerary.totalTravelMins)}</strong>
              </div>
              <div>
                <small>Est. cost ({describeParty(prefs)})</small>
                <strong className={overBudget ? 'text-warning' : ''}>
                  £{totalCost}
                  {prefs.dayBudget !== null && <span className="muted"> / £{prefs.dayBudget}</span>}
                </strong>
                {travelCost > 0 && <small>incl. £{travelCost} travel</small>}
              </div>
              <div>
                <small>To book</small>
                <strong>{itinerary.bookingCount}</strong>
              </div>
            </div>

            {itinerary.overrunMins > 0 && (
              <p className="warning">
                ⚠️ Runs {formatDuration(itinerary.overrunMins)} past {formatTime(itinerary.finishBy)}. Drop a stop or shorten some visits.
              </p>
            )}
            {overBudget && <p className="warning">⚠️ About £{Math.round(totalCost - (prefs.dayBudget ?? 0))} over your day budget.</p>}

            <div className="plan-actions">
              <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
                {user ? '💾 Save trip' : '💾 Log in to save'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={share}>
                🔗 Share
              </button>
              <button type="button" className="btn btn-secondary" onClick={exportCalendar}>
                📅 Add to calendar
              </button>
              <a className="btn btn-secondary" href={googleMapsRouteUrl(origin, stops, transport.googleMode, plan.returnToStart)} target="_blank" rel="noreferrer">
                🗺️ Open in Google Maps
              </a>
            </div>
            <p className="hint">Travel times, costs and the weather are estimates until real APIs are connected.</p>
          </div>
        </section>
      </div>

      <aside className="plan-side">
        <JourneyPanel key={trip.id} dayStart={itinerary.start} dayEnd={itinerary.end} />
        <EssentialsPanel origin={origin} transport={prefs.transport} />
      </aside>
    </main>
  )
}
