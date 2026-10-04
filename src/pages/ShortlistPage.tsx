import { Link } from 'react-router'
import { getInterest } from '../constants'
import { useTrip } from '../hooks/useTrip'
import { openingLabel, priceLabel } from '../utils/format'
import { costFor } from '../utils/plan'
import { formatDuration } from '../utils/time'

export function ShortlistPage() {
  const { trip, togglePlan, removeFromShortlist } = useTrip()
  const { shortlist, planIds, preferences } = trip

  if (shortlist.length === 0) {
    return (
      <main className="narrow">
        <div className="status">
          <p>Your shortlist is empty.</p>
          <Link to="/" className="btn btn-secondary">
            Explore things to do
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="narrow">
      <section className="panel">
        <h2 className="section-title">Shortlist</h2>
        <p className="hint">Tick the ones you actually want to do today.</p>

        <ul className="shortlist">
          {shortlist.map((s) => {
            const interest = getInterest(s.category)
            const inPlan = planIds.includes(s.id)
            const price = priceLabel(s.priceLevel)
            const cost = costFor(s, preferences)
            return (
              <li key={s.id} className={`shortlist-item ${inPlan ? 'selected' : ''}`}>
                <label className="shortlist-pick">
                  <input type="checkbox" checked={inPlan} onChange={() => togglePlan(s.id)} />
                  <span>
                    <strong>{s.name}</strong>
                    <span className="shortlist-meta">
                      {interest.emoji} {interest.label} · {s.distanceKm} km · ⏱ {formatDuration(s.durationMins)}
                      {price && ` · ${price}`}
                    </span>
                    <span className="shortlist-meta">
                      {openingLabel(s)} · {cost ? `~£${cost} for your group` : 'Free'}
                      {s.bookingRequired && ' · 🎫 Book ahead'}
                    </span>
                  </span>
                </label>
                <button type="button" className="icon-btn" onClick={() => removeFromShortlist(s.id)} aria-label={`Remove ${s.name} from shortlist`}>
                  ✕
                </button>
              </li>
            )
          })}
        </ul>

        {planIds.length ? (
          <Link to="/plan" className="btn btn-primary btn-block">
            Plan my day with {planIds.length} stop{planIds.length === 1 ? '' : 's'} →
          </Link>
        ) : (
          <button type="button" className="btn btn-primary btn-block" disabled>
            Tick at least one to plan
          </button>
        )}
      </section>
    </main>
  )
}
