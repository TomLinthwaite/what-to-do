import { useState } from 'react'
import { useLibrary } from '../hooks/useLibrary'
import type { PlaceEntry, Suggestion } from '../types'
import { formatDate } from '../utils/trip'
import { StarRating } from './StarRating'

/** Inline "been here?" control: mark visited, rate 1–5 and keep a private note. */
export function PlaceReview({ place }: { place: Suggestion }) {
  const { get, review } = useLibrary()
  const entry = get(place.id)
  const [editing, setEditing] = useState(false)
  const [visited, setVisited] = useState(true)
  const [rating, setRating] = useState<PlaceEntry['rating']>()
  const [note, setNote] = useState('')

  function startEditing() {
    setVisited(entry ? Boolean(entry.visitedAt) : true)
    setRating(entry?.rating)
    setNote(entry?.note ?? '')
    setEditing(true)
  }

  function save() {
    review(place, { visited, rating, note })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="review-form">
        <label className="checkbox-row">
          <input type="checkbox" checked={visited} onChange={(e) => setVisited(e.target.checked)} />
          I've been here
        </label>
        <StarRating value={rating} onChange={setRating} />
        <textarea
          rows={2}
          placeholder="Private notes — what was good, what to order, tips for next time…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label={`Notes about ${place.name}`}
        />
        <div className="button-row">
          <button type="button" className="btn btn-primary btn-small" onClick={save}>
            Save
          </button>
          <button type="button" className="link" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const hasReview = entry && (entry.visitedAt || entry.rating || entry.note)
  if (!hasReview) {
    return (
      <button type="button" className="link review-link" onClick={startEditing}>
        ✍️ Been here? Rate it
      </button>
    )
  }

  return (
    <div className="review-summary">
      {entry.visitedAt && <span className="tag tag-visited">✓ Visited {formatDate(entry.visitedAt)}</span>}
      <StarRating value={entry.rating} />
      {entry.note && <span className="review-note">“{entry.note}”</span>}
      <button type="button" className="link" onClick={startEditing}>
        Edit
      </button>
    </div>
  )
}
