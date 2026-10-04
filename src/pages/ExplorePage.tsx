import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LocationPicker } from '../components/LocationPicker'
import { PreferencesForm } from '../components/PreferencesForm'
import { SuggestionCard } from '../components/SuggestionCard'
import { WeatherBar } from '../components/WeatherBar'
import { INTERESTS } from '../constants'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import { getSuggestions, isWetDuring } from '../services/suggestions'
import { surpriseStops } from '../utils/plan'

export function ExplorePage() {
  const { trip, update, setPreferences, results, setResults, toggleShortlist, setPlanStops, forecast, origin } = useTrip()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const prefs = trip.preferences
  const shortlistIds = new Set(trip.shortlist.map((s) => s.id))
  const wet = isWetDuring(forecast, prefs)

  async function search() {
    if (!trip.location) return
    setLoading(true)
    setMessage(null)
    try {
      setResults(await getSuggestions(trip.location, prefs, forecast))
    } finally {
      setLoading(false)
    }
  }

  async function surprise() {
    if (!trip.location) return
    setLoading(true)
    setMessage(null)
    try {
      const chosen = prefs.interests.filter((i) => i !== 'food')
      const interests = chosen.length ? chosen : INTERESTS.map((i) => i.value).filter((i) => i !== 'food')
      const [candidates, food] = await Promise.all([
        getSuggestions(trip.location, { ...prefs, interests }, forecast),
        getSuggestions(trip.location, { ...prefs, interests: ['food'], timeWindow: 'all-day', onlyOpen: false }, forecast),
      ])
      const stops = surpriseStops(candidates, food, { origin, preferences: prefs, plan: trip.plan, forecast })
      if (!stops.length) {
        setMessage("Couldn't find enough to build a plan — try widening the distance or loosening filters.")
        return
      }
      setPlanStops(stops)
      navigate('/plan')
    } finally {
      setLoading(false)
    }
  }

  async function saveDefaults() {
    await updateUser({ defaultPreferences: prefs })
    setMessage('Saved as your default settings.')
  }

  return (
    <main className="layout">
      <aside className="sidebar">
        <LocationPicker
          location={trip.location}
          date={trip.date}
          onChange={(location) => update({ location })}
          onDateChange={(date) => update({ date })}
        />
        <PreferencesForm value={prefs} onChange={setPreferences} />
        <div className="sidebar-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={search} disabled={!trip.location || loading}>
            {trip.location ? 'Find things to do' : 'Choose a location first'}
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={surprise} disabled={!trip.location || loading}>
            🎲 Surprise me — plan my day
          </button>
          {user && (
            <button type="button" className="link" onClick={saveDefaults}>
              Save these settings as my defaults
            </button>
          )}
        </div>
      </aside>

      <div className="results">
        <WeatherBar forecast={forecast} wet={wet} />
        {message && <p className="notice">{message}</p>}
        {loading ? (
          <p className="status">Finding things to do…</p>
        ) : results === null ? (
          <p className="status">Pick a location and hit “Find things to do” — or let us surprise you.</p>
        ) : results.length === 0 ? (
          <p className="status">Nothing matched — try widening the distance or changing your filters.</p>
        ) : (
          <section>
            <h2 className="section-title">
              {results.length} suggestion{results.length === 1 ? '' : 's'}
            </h2>
            <div className="results-grid">
              {results.map((s) => (
                <SuggestionCard
                  key={s.id}
                  suggestion={s}
                  preferences={prefs}
                  shortlisted={shortlistIds.has(s.id)}
                  onToggleShortlist={toggleShortlist}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
