import { ACCESS_NEEDS, DIETARY_OPTIONS, getInterest } from '../constants'
import { useLibrary } from '../hooks/useLibrary'
import type { Preferences, Suggestion } from '../types'
import { openingLabel, priceLabel } from '../utils/format'
import { costFor } from '../utils/plan'
import { formatDuration } from '../utils/time'
import { FavouriteButton } from './FavouriteButton'
import { StarRating } from './StarRating'

interface Props {
  suggestion: Suggestion
  preferences: Preferences
  shortlisted: boolean
  onToggleShortlist: (suggestion: Suggestion) => void
}

export function SuggestionCard({ suggestion: s, preferences, shortlisted, onToggleShortlist }: Props) {
  const interest = getInterest(s.category)
  const dietaryLabels = (s.dietary ?? []).map((d) => DIETARY_OPTIONS.find((o) => o.value === d)?.label ?? d)
  const price = priceLabel(s.priceLevel)
  const groupCost = costFor(s, preferences)
  const entry = useLibrary().get(s.id)

  return (
    <article className={`card ${shortlisted ? 'card-shortlisted' : ''}`}>
      <div className="card-header">
        <span className="card-category">
          {interest.emoji} {interest.label}
        </span>
        <span className="card-header-end">
          <span className="card-distance">{s.distanceKm} km</span>
          <FavouriteButton place={s} />
        </span>
      </div>

      <h3>{s.name}</h3>
      {entry && (entry.visitedAt || entry.rating) && (
        <p className="card-review">
          {entry.visitedAt ? 'You’ve been here' : 'Your rating'} <StarRating value={entry.rating} />
          {entry.note && <span className="review-note"> “{entry.note}”</span>}
        </p>
      )}
      <p className="card-description">{s.description}</p>
      <p className="card-address">{s.address}</p>

      <div className="card-meta">
        {s.rating !== undefined && <span>⭐ {s.rating.toFixed(1)}</span>}
        {price && <span>{price}</span>}
        <span>⏱ {formatDuration(s.durationMins)}</span>
        <span>{openingLabel(s)}</span>
      </div>

      <div className="card-meta card-meta-muted">
        <span>{s.indoor ? '🏠 Indoor' : '🌤️ Outdoor'}</span>
        <span>{groupCost === 0 ? 'Free for your group' : `~£${groupCost} for your group`}</span>
        {s.access.length > 0 && (
          <span title={s.access.map((a) => ACCESS_NEEDS.find((n) => n.value === a)?.label).join(', ')}>
            {s.access.map((a) => ACCESS_NEEDS.find((n) => n.value === a)?.emoji).join(' ')}
          </span>
        )}
      </div>

      <div className="tags">
        {s.bookingRequired && <span className="tag tag-booking">Book ahead</span>}
        {s.kidFriendly && <span className="tag tag-kids">{s.minAge ? `Ages ${s.minAge}+` : 'Kid-friendly'}</span>}
        {dietaryLabels.map((label) => (
          <span key={label} className="tag">
            {label}
          </span>
        ))}
      </div>

      <button
        type="button"
        className={`btn ${shortlisted ? 'btn-primary' : 'btn-secondary'} btn-small`}
        onClick={() => onToggleShortlist(s)}
        aria-pressed={shortlisted}
      >
        {shortlisted ? '★ Shortlisted' : '☆ Add to shortlist'}
      </button>
    </article>
  )
}
