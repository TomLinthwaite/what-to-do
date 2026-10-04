import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import { getJourneyOptions, getParking, parkingCost } from '../services/journeys'
import type { JourneyMode, JourneyOption, ParkingOption } from '../types'
import { describeOption, journeyCost, journeyEmoji, JOURNEY_MODES, optionFare } from '../utils/journey'
import { formatTime } from '../utils/time'
import { ChipGroup } from './ChipGroup'

interface Props {
  /** When your plan in the area starts and ends (minutes since midnight). */
  dayStart: number
  dayEnd: number
}

export function JourneyPanel({ dayStart, dayEnd }: Props) {
  const { trip, update, setPlan, origin } = useTrip()
  const { user } = useAuth()
  const journey = trip.journey
  const [from, setFrom] = useState(journey?.from ?? user?.home ?? '')
  const [mode, setMode] = useState<JourneyMode>(journey?.mode ?? 'train')
  const [options, setOptions] = useState<{ outbound: JourneyOption[]; return: JourneyOption[] } | null>(null)
  const [parking, setParking] = useState<ParkingOption[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(!journey)
  const prefs = trip.preferences
  const destination = trip.location?.label ?? 'your destination'

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!from.trim()) return
    setLoading(true)
    try {
      const [found, parks] = await Promise.all([
        getJourneyOptions({ from, to: destination, date: trip.date, mode, arriveBy: dayStart, departAfter: dayEnd }),
        mode === 'car' ? getParking(origin) : Promise.resolve(null),
      ])
      setOptions(found)
      setParking(parks)
      update({ journey: { from: from.trim(), mode } })
    } finally {
      setLoading(false)
    }
  }

  function chooseOutbound(o: JourneyOption) {
    update({ journey: { ...(journey ?? { from, mode }), outbound: o } })
    // Start exploring 10 minutes after arriving (rounded to 5 min).
    setPlan({ startTime: formatTime(Math.ceil((o.arrive + 10) / 5) * 5) })
  }

  function chooseReturn(o: JourneyOption) {
    update({ journey: { ...(journey ?? { from, mode }), return: o } })
    setPlan({ finishBy: formatTime(Math.floor((o.depart - 15) / 5) * 5) })
  }

  function chooseParking(p: ParkingOption) {
    update({ journey: { ...(journey ?? { from, mode }), parking: p } })
  }

  const stayMins = journey?.outbound && journey.return ? journey.return.depart - journey.outbound.arrive : dayEnd - dayStart
  const complete = journey?.outbound && journey.return && (journey.mode !== 'car' || journey.parking)

  return (
    <section className="panel">
      <div className="panel-title-row">
        <h2 className="section-title">Getting there & back</h2>
        {journey && !editing && (
          <button type="button" className="link" onClick={() => setEditing(true)}>
            Change
          </button>
        )}
      </div>

      {!editing && journey ? (
        <div className="journey-summary">
          {journey.outbound && (
            <JourneyLine label="There" option={journey.outbound} fare={optionFare(journey.outbound, prefs)} />
          )}
          {journey.return && <JourneyLine label="Back" option={journey.return} fare={optionFare(journey.return, prefs)} />}
          {journey.parking && (
            <p className="journey-line">
              🅿️ {journey.parking.name} · £{parkingCost(journey.parking, stayMins)} ·{' '}
              <a href={journey.parking.bookingUrl} target="_blank" rel="noreferrer">
                Book
              </a>
            </p>
          )}
          {!complete && <p className="hint">Pick the rest of your journey to complete this.</p>}
          <p className="journey-total">
            Travel total: <strong>£{journeyCost(journey, prefs)}</strong>
          </p>
          <button type="button" className="link danger" onClick={() => update({ journey: null })}>
            Remove journey
          </button>
        </div>
      ) : (
        <>
          <form className="journey-form" onSubmit={search}>
            <label className="field">
              Travelling from
              <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Town or station" required />
            </label>
            <ChipGroup name="journeyMode" type="radio" options={JOURNEY_MODES} isSelected={(v) => v === mode} onSelect={setMode} />
            <button type="submit" className="btn btn-secondary btn-block" disabled={loading || !trip.location}>
              {loading ? 'Searching…' : trip.location ? 'Find journeys' : 'Choose a location first'}
            </button>
          </form>

          {options && (
            <div className="journey-options">
              <h3>Outbound — arrive before {formatTime(dayStart)}</h3>
              {options.outbound.map((o) => (
                <OptionButton key={o.id} option={o} fare={optionFare(o, prefs)} selected={journey?.outbound?.id === o.id} onSelect={chooseOutbound} />
              ))}
              <h3>Return — after {formatTime(dayEnd)}</h3>
              {options.return.map((o) => (
                <OptionButton key={o.id} option={o} fare={optionFare(o, prefs)} selected={journey?.return?.id === o.id} onSelect={chooseReturn} />
              ))}
              {parking && (
                <>
                  <h3>Parking</h3>
                  {parking.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`journey-option ${journey?.parking?.id === p.id ? 'selected' : ''}`}
                      onClick={() => chooseParking(p)}
                      aria-pressed={journey?.parking?.id === p.id}
                    >
                      <strong>{p.name}</strong>
                      <span className="shortlist-meta">
                        {p.distanceKm} km away · £{p.pricePerHour}/hr (max £{p.maxDayPrice}) · ~£{parkingCost(p, stayMins)} for your stay
                        {p.evCharging && ' · ⚡ EV charging'}
                      </span>
                    </button>
                  ))}
                </>
              )}
              <button type="button" className="btn btn-primary btn-small" onClick={() => setEditing(false)} disabled={!journey?.outbound}>
                Done
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function OptionButton({ option, fare, selected, onSelect }: { option: JourneyOption; fare: number; selected: boolean; onSelect: (o: JourneyOption) => void }) {
  return (
    <button type="button" className={`journey-option ${selected ? 'selected' : ''}`} onClick={() => onSelect(option)} aria-pressed={selected}>
      <strong>
        {journeyEmoji(option.mode)} {describeOption(option)}
      </strong>
      <span className="shortlist-meta">
        {option.operator}
        {option.mode !== 'car' && ` · £${fare} for your group`}
        {option.note && ` · ${option.note}`}
      </span>
    </button>
  )
}

function JourneyLine({ label, option, fare }: { label: string; option: JourneyOption; fare: number }) {
  return (
    <p className="journey-line">
      <strong>{label}:</strong> {journeyEmoji(option.mode)} {describeOption(option)} · {option.operator}
      {option.mode !== 'car' && ` · £${fare}`}
      {option.bookingUrl && (
        <>
          {' '}·{' '}
          <a href={option.bookingUrl} target="_blank" rel="noreferrer">
            Book
          </a>
        </>
      )}
    </p>
  )
}
