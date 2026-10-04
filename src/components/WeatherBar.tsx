import { WEATHER } from '../constants'
import type { DaySlot, Forecast } from '../types'

const SLOTS: { value: DaySlot; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
]

export function WeatherBar({ forecast, wet }: { forecast: Forecast | null; wet: boolean }) {
  if (!forecast) return null
  return (
    <div className="weather">
      {SLOTS.map((slot) => {
        const f = forecast.slots[slot.value]
        const info = WEATHER[f.condition]
        return (
          <div key={slot.value} className="weather-slot" title={info.label}>
            <span className="weather-emoji" aria-hidden="true">
              {info.emoji}
            </span>
            <span>
              <strong>{slot.label}</strong>
              <small>
                {f.tempC}°C · {f.rainChance}% rain
              </small>
            </span>
          </div>
        )
      })}
      {wet && <p className="weather-note">Rain is likely, so indoor places are ranked higher.</p>}
    </div>
  )
}
