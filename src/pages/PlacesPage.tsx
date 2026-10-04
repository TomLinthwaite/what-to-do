import { useState } from 'react'
import { Link } from 'react-router'
import { FavouriteButton } from '../components/FavouriteButton'
import { PlaceReview } from '../components/PlaceReview'
import { getInterest } from '../constants'
import { useAuth } from '../hooks/useAuth'
import { useLibrary } from '../hooks/useLibrary'
import { useTrip } from '../hooks/useTrip'
import { openingLabel } from '../utils/format'

type Tab = 'favourites' | 'visited' | 'all'

export function PlacesPage() {
  const { entries, remove } = useLibrary()
  const { trip, toggleShortlist } = useTrip()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('favourites')
  const shortlistIds = new Set(trip.shortlist.map((s) => s.id))

  const shown = entries.filter((e) => (tab === 'favourites' ? e.favourite : tab === 'visited' ? e.visitedAt : true))
  const counts = {
    favourites: entries.filter((e) => e.favourite).length,
    visited: entries.filter((e) => e.visitedAt).length,
    all: entries.length,
  }

  return (
    <main className="stack">
      <div className="page-header">
        <h1>My places</h1>
      </div>
      {!user && (
        <p className="notice">
          You're not logged in — places are saved on this device. <Link to="/signup?next=/places">Create an account</Link> to keep them.
        </p>
      )}

      <nav className="steps" aria-label="Filter places">
        {(['favourites', 'visited', 'all'] as Tab[]).map((t) => (
          <button key={t} type="button" className={`step ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} aria-pressed={tab === t}>
            {t === 'favourites' ? '♥ Favourites' : t === 'visited' ? '✓ Visited' : 'All'}
            <span className="step-count">{counts[t]}</span>
          </button>
        ))}
      </nav>

      {shown.length === 0 ? (
        <div className="status">
          <p>
            {tab === 'favourites'
              ? 'Tap ♡ on any place to save it here.'
              : tab === 'visited'
                ? 'Mark places as visited from your plan to build up your history.'
                : 'Nothing saved yet.'}
          </p>
          <Link to="/" className="btn btn-secondary">
            Explore things to do
          </Link>
        </div>
      ) : (
        <div className="results-grid">
          {shown.map(({ place }) => {
            const interest = getInterest(place.category)
            return (
              <article key={place.id} className="card">
                <div className="card-header">
                  <span>
                    {interest.emoji} {interest.label}
                  </span>
                  <FavouriteButton place={place} />
                </div>
                <h3>{place.name}</h3>
                <p className="card-address">
                  {place.address} · {openingLabel(place)}
                </p>
                <PlaceReview place={place} />
                <div className="button-row">
                  <button
                    type="button"
                    className={`btn btn-small ${shortlistIds.has(place.id) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleShortlist(place)}
                    aria-pressed={shortlistIds.has(place.id)}
                  >
                    {shortlistIds.has(place.id) ? '★ In current trip' : '☆ Add to current trip'}
                  </button>
                  <button type="button" className="link danger" onClick={() => remove(place.id)}>
                    Forget
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
