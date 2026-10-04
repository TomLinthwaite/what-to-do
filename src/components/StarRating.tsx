import type { PlaceEntry } from '../types'

type Rating = NonNullable<PlaceEntry['rating']>

interface Props {
  value?: Rating
  onChange?: (value: Rating | undefined) => void
}

export function StarRating({ value, onChange }: Props) {
  if (!onChange) {
    return value ? (
      <span className="stars" aria-label={`Rated ${value} out of 5`}>
        {'★'.repeat(value)}
        <span className="stars-off">{'★'.repeat(5 - value)}</span>
      </span>
    ) : null
  }

  return (
    <span className="stars stars-input" role="radiogroup" aria-label="Your rating">
      {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          className={value && n <= value ? '' : 'stars-off'}
          onClick={() => onChange(value === n ? undefined : n)}
        >
          ★
        </button>
      ))}
    </span>
  )
}
