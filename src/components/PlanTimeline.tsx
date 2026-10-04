import type { ReactNode } from 'react'
import { getInterest, type TransportInfo } from '../constants'
import type { Suggestion } from '../types'
import { formatDuration, formatTime } from '../utils/time'
import type { Itinerary } from '../utils/plan'

interface EditHandlers {
  onMove: (index: number, delta: number) => void
  onRemove: (id: string) => void
  onAdjustDuration: (id: string, deltaMins: number) => void
  onResetDuration: (id: string) => void
  overriddenIds: Set<string>
}

interface Props {
  itinerary: Itinerary
  transport: TransportInfo
  originLabel: string
  edit?: EditHandlers
  /** Extra content under each stop (e.g. favourite / review controls). */
  renderStopExtras?: (suggestion: Suggestion) => ReactNode
  /** Optional line shown above the start (e.g. how you're arriving). */
  arrival?: ReactNode
  /** Optional line shown at the end (e.g. your journey home). */
  departure?: ReactNode
}

export function PlanTimeline({ itinerary, transport, originLabel, edit, renderStopExtras, arrival, departure }: Props) {
  const count = itinerary.stops.length

  return (
    <ol className="timeline">
      {arrival && <li className="timeline-journey">{arrival}</li>}
      <li className="timeline-start">
        <span className="timeline-time">{formatTime(itinerary.start)}</span>
        <span>
          📍 Start from <strong>{originLabel}</strong>
        </span>
      </li>

      {itinerary.stops.map((stop, i) => {
        const s = stop.suggestion
        const interest = getInterest(s.category)
        return (
          <li key={s.id} className="timeline-item">
            <div className="timeline-leg">
              {transport.emoji} {formatDuration(stop.travelMins)} {transport.verb} · {stop.legKm.toFixed(1)} km
              {stop.waitMins > 0 && (
                <span className="timeline-wait">
                  {' '}· ⏳ {formatDuration(stop.waitMins)} wait ({s.fixedStart !== undefined ? 'starts' : 'opens'} {formatTime(stop.start)})
                </span>
              )}
            </div>
            <div className={`timeline-stop ${stop.warnings.length ? 'has-warning' : ''}`}>
              <span className="timeline-time">
                {formatTime(stop.start)}
                <small>– {formatTime(stop.leave)}</small>
              </span>
              <div className="timeline-body">
                <strong>
                  {i + 1}. {s.name}
                </strong>
                <span className="shortlist-meta">
                  {interest.emoji} {interest.label} · {s.address}
                </span>
                {edit ? (
                  <span className="duration-edit">
                    ⏱
                    <button type="button" className="icon-btn icon-btn-sm" onClick={() => edit.onAdjustDuration(s.id, -15)} aria-label={`Spend less time at ${s.name}`}>
                      −
                    </button>
                    <span>{formatDuration(stop.durationMins)}</span>
                    <button type="button" className="icon-btn icon-btn-sm" onClick={() => edit.onAdjustDuration(s.id, 15)} aria-label={`Spend more time at ${s.name}`}>
                      +
                    </button>
                    {edit.overriddenIds.has(s.id) && (
                      <button type="button" className="link" onClick={() => edit.onResetDuration(s.id)}>
                        reset
                      </button>
                    )}
                  </span>
                ) : (
                  <span className="shortlist-meta">⏱ {formatDuration(stop.durationMins)}</span>
                )}
                {s.bookingRequired && (
                  <span className="booking">
                    🎫 Booking recommended
                    {s.bookingUrl && (
                      <>
                        {' '}·{' '}
                        <a href={s.bookingUrl} target="_blank" rel="noreferrer">
                          Book now
                        </a>
                      </>
                    )}
                  </span>
                )}
                {stop.warnings.map((w) => (
                  <span key={w} className="warning">
                    ⚠️ {w}
                  </span>
                ))}
                {renderStopExtras?.(s)}
              </div>
              {edit && (
                <div className="timeline-actions">
                  <button type="button" className="icon-btn" onClick={() => edit.onMove(i, -1)} disabled={i === 0} aria-label={`Move ${s.name} earlier`}>
                    ↑
                  </button>
                  <button type="button" className="icon-btn" onClick={() => edit.onMove(i, 1)} disabled={i === count - 1} aria-label={`Move ${s.name} later`}>
                    ↓
                  </button>
                  <button type="button" className="icon-btn" onClick={() => edit.onRemove(s.id)} aria-label={`Remove ${s.name} from plan`}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          </li>
        )
      })}

      {itinerary.returnLeg && (
        <>
          <li className="timeline-leg">
            {transport.emoji} {formatDuration(itinerary.returnLeg.travelMins)} {transport.verb} · {itinerary.returnLeg.legKm.toFixed(1)} km
          </li>
          <li className="timeline-start">
            <span className="timeline-time">{formatTime(itinerary.end)}</span>
            <span>
              🏁 Back at <strong>{originLabel}</strong>
            </span>
          </li>
        </>
      )}
      {departure && <li className="timeline-journey">{departure}</li>}
    </ol>
  )
}
