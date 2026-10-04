import { Outlet } from 'react-router'
import { StepTabs } from '../components/StepTabs'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import { formatDate, hasUnsavedChanges } from '../utils/trip'

export function PlannerLayout() {
  const { trip, update, newTrip } = useTrip()
  const { user } = useAuth()
  const unsaved = hasUnsavedChanges(trip)

  function startNewTrip() {
    const hasWork = trip.shortlist.length > 0 && unsaved
    if (hasWork && !window.confirm('Start a new trip? Unsaved changes to this one will be lost.')) return
    newTrip()
  }

  return (
    <>
      <div className="trip-bar">
        <div className="trip-bar-main">
          <label className="trip-name-wrap" title="Click to rename this trip">
            <input
              className="trip-name"
              value={trip.name}
              onChange={(e) => update({ name: e.target.value })}
              onBlur={(e) => !e.target.value.trim() && update({ name: 'My day out' })}
              aria-label="Trip name"
              maxLength={80}
              size={Math.max(8, trip.name.length)}
            />
            <span className="trip-name-icon" aria-hidden="true">
              ✏️
            </span>
          </label>
          <span className="trip-bar-meta">
            📅 {formatDate(trip.date)}
            {trip.location && <> · 📍 {trip.location.label}</>}
            {user && <> · {trip.savedAt ? (unsaved ? 'Unsaved changes' : 'Saved ✓') : 'Not saved yet'}</>}
          </span>
        </div>
        <button type="button" className="btn btn-secondary btn-small" onClick={startNewTrip}>
          + New trip
        </button>
      </div>
      <StepTabs />
      <Outlet />
    </>
  )
}
