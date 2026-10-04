import { useState } from 'react'
import { getCurrentPosition } from '../services/location'
import type { SearchLocation } from '../types'
import { todayISO } from '../utils/trip'

interface Props {
  location: SearchLocation | null
  date: string
  onChange: (location: SearchLocation | null) => void
  onDateChange: (date: string) => void
}

export function LocationPicker({ location, date, onChange, onDateChange }: Props) {
  const [query, setQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function useMyLocation() {
    setError(null)
    setLocating(true)
    try {
      const coords = await getCurrentPosition()
      onChange({
        label: `Current location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
        coords,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to get your location.')
    } finally {
      setLocating(false)
    }
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const label = query.trim()
    if (!label) return
    // TODO: geocode `label` into coordinates once a geocoding API is connected.
    onChange({ label })
  }

  return (
    <section className="panel">
      <h2>Where & when?</h2>

      <button type="button" className="btn btn-secondary" onClick={useMyLocation} disabled={locating}>
        📍 {locating ? 'Locating…' : 'Use my current location'}
      </button>

      <div className="divider">or</div>

      <form className="location-form" onSubmit={submitManual}>
        <input
          type="text"
          placeholder="Search a town, postcode or place"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Location"
        />
        <button type="submit" className="btn btn-secondary">
          Set
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {location && (
        <p className="selected-location">
          <span>
            Exploring: <strong>{location.label}</strong>
          </span>
          <button type="button" className="link" onClick={() => onChange(null)}>
            Clear
          </button>
        </p>
      )}

      <label className="date-field">
        Date
        <input type="date" value={date} min={todayISO()} onChange={(e) => e.target.value && onDateChange(e.target.value)} />
      </label>
    </section>
  )
}
