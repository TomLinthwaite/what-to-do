import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import * as tripsService from '../services/trips'
import type { Trip } from '../types'
import { formatDate, hasUnsavedChanges, planStops } from '../utils/trip'

export function TripsPage() {
  const { user } = useAuth()
  const { trip: current, loadTrip, newTrip, renameSavedTrip } = useTrip()
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const navigate = useNavigate()
  const [trips, setTrips] = useState<Trip[] | null>(null)
  const [version, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    tripsService.listTrips(user.id).then((list) => {
      if (!cancelled) setTrips(list)
    })
    return () => {
      cancelled = true
    }
  }, [user, version])

  function confirmDiscard(): boolean {
    const dirty = current.shortlist.length > 0 && hasUnsavedChanges(current)
    return !dirty || window.confirm('You have unsaved changes in your current trip. Discard them?')
  }

  function open(t: Trip) {
    if (t.id !== current.id && !confirmDiscard()) return
    if (t.id !== current.id) loadTrip(t)
    navigate('/plan')
  }

  async function duplicate(t: Trip) {
    if (!user) return
    const now = new Date().toISOString()
    await tripsService.saveTrip(user.id, { ...t, id: crypto.randomUUID(), name: `${t.name} (copy)`, createdAt: now })
    refresh()
  }

  async function remove(t: Trip) {
    if (!user || !window.confirm(`Delete “${t.name}”?`)) return
    await tripsService.deleteTrip(user.id, t.id)
    refresh()
  }

  async function saveRename(e: React.FormEvent) {
    e.preventDefault()
    if (!renaming?.name.trim()) return
    await renameSavedTrip(renaming.id, renaming.name.trim())
    setRenaming(null)
    refresh()
  }

  function startNew() {
    if (!confirmDiscard()) return
    newTrip()
    navigate('/')
  }

  return (
    <main className="stack">
      <div className="page-header">
        <h1>My trips</h1>
        <button type="button" className="btn btn-primary" onClick={startNew}>
          + Plan a new day
        </button>
      </div>

      {trips === null ? (
        <p className="status">Loading trips…</p>
      ) : trips.length === 0 ? (
        <div className="status">
          <p>No saved trips yet. Plan a day and hit “Save trip”.</p>
          <Link to="/" className="btn btn-secondary">
            Start planning
          </Link>
        </div>
      ) : (
        <div className="results-grid">
          {trips.map((t) => {
            const stops = planStops(t)
            return (
              <article key={t.id} className={`card ${t.id === current.id ? 'card-shortlisted' : ''}`}>
                <div className="card-header">
                  <span>📅 {formatDate(t.date)}</span>
                  {t.id === current.id && <span className="tag">In planner</span>}
                </div>
                {renaming?.id === t.id ? (
                  <form className="rename-form" onSubmit={saveRename}>
                    <input
                      autoFocus
                      value={renaming.name}
                      maxLength={80}
                      onChange={(e) => setRenaming({ id: t.id, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)}
                      aria-label="New trip name"
                    />
                    <button type="submit" className="btn btn-primary btn-small">
                      Save
                    </button>
                    <button type="button" className="link" onClick={() => setRenaming(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <h3 className="trip-card-title">
                    {t.name}
                    <button type="button" className="icon-btn icon-btn-sm" onClick={() => setRenaming({ id: t.id, name: t.name })} aria-label={`Rename ${t.name}`} title="Rename">
                      ✏️
                    </button>
                  </h3>
                )}
                <p className="card-address">📍 {t.location?.label ?? 'No location'}</p>
                <p className="card-description">
                  {stops.length ? stops.map((s) => s.name).join(' → ') : 'No stops planned yet'}
                </p>
                <p className="muted small">Updated {new Date(t.updatedAt).toLocaleString()}</p>
                <div className="button-row">
                  <button type="button" className="btn btn-primary btn-small" onClick={() => open(t)}>
                    Open
                  </button>
                  <button type="button" className="btn btn-secondary btn-small" onClick={() => duplicate(t)}>
                    Duplicate
                  </button>
                  <button type="button" className="link danger" onClick={() => remove(t)}>
                    Delete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
