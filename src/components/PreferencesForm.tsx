import {
  ACCESS_NEEDS,
  BUDGETS,
  DIETARY_OPTIONS,
  getTransport,
  INTERESTS,
  PACES,
  TIME_WINDOWS,
  TRANSPORT_MODES,
} from '../constants'
import type { Preferences } from '../types'
import { ChipGroup } from './ChipGroup'
import { PartyPicker } from './PartyPicker'

interface Props {
  value: Preferences
  onChange: (value: Preferences) => void
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export function PreferencesForm({ value, onChange }: Props) {
  const transport = getTransport(value.transport)
  const set = (patch: Partial<Preferences>) => onChange({ ...value, ...patch })

  return (
    <section className="panel">
      <h2>Your plans</h2>

      <fieldset>
        <legend>Who's coming?</legend>
        <PartyPicker value={value} onChange={set} />
      </fieldset>

      <fieldset>
        <legend>How long are you around?</legend>
        <ChipGroup
          name="timeWindow"
          type="radio"
          options={TIME_WINDOWS}
          isSelected={(v) => value.timeWindow === v}
          onSelect={(timeWindow) => set({ timeWindow })}
        />
      </fieldset>

      <fieldset>
        <legend>How are you getting around?</legend>
        <ChipGroup
          name="transport"
          type="radio"
          options={TRANSPORT_MODES}
          isSelected={(v) => value.transport === v}
          onSelect={(mode) => set({ transport: mode, radiusKm: Math.min(value.radiusKm, getTransport(mode).maxRadiusKm) })}
        />
      </fieldset>

      <fieldset>
        <legend>What are you into?</legend>
        <ChipGroup
          name="interests"
          type="checkbox"
          options={INTERESTS}
          isSelected={(v) => value.interests.includes(v)}
          onSelect={(v) => set({ interests: toggle(value.interests, v) })}
        />
      </fieldset>

      <fieldset>
        <legend>Budget per activity</legend>
        <ChipGroup
          name="budget"
          type="radio"
          options={BUDGETS}
          isSelected={(v) => value.maxPriceLevel === v}
          onSelect={(maxPriceLevel) => set({ maxPriceLevel })}
        />
      </fieldset>

      <fieldset>
        <legend>Food requirements</legend>
        <ChipGroup
          name="dietary"
          type="checkbox"
          options={DIETARY_OPTIONS}
          isSelected={(v) => value.dietary.includes(v)}
          onSelect={(v) => set({ dietary: toggle(value.dietary, v) })}
        />
      </fieldset>

      <fieldset>
        <legend>
          Distance: <strong>{value.radiusKm} km</strong>
        </legend>
        <input
          type="range"
          min={0.5}
          max={transport.maxRadiusKm}
          step={0.5}
          value={value.radiusKm}
          onChange={(e) => set({ radiusKm: Number(e.target.value) })}
          aria-label="Search radius in kilometres"
        />
      </fieldset>

      <details className="more-options">
        <summary>More options</summary>

        <fieldset>
          <legend>Accessibility</legend>
          <ChipGroup
            name="access"
            type="checkbox"
            options={ACCESS_NEEDS}
            isSelected={(v) => value.accessNeeds.includes(v)}
            onSelect={(v) => set({ accessNeeds: toggle(value.accessNeeds, v) })}
          />
        </fieldset>

        <fieldset>
          <legend>Pace</legend>
          <ChipGroup
            name="pace"
            type="radio"
            options={PACES}
            isSelected={(v) => value.pace === v}
            onSelect={(pace) => set({ pace })}
          />
        </fieldset>

        <fieldset>
          <legend>Total budget for the day</legend>
          <div className="money-input">
            <span>£</span>
            <input
              type="number"
              min={0}
              step={5}
              placeholder="No limit"
              value={value.dayBudget ?? ''}
              onChange={(e) => set({ dayBudget: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
              aria-label="Total budget for the day in pounds"
            />
          </div>
        </fieldset>

        <label className="checkbox-row">
          <input type="checkbox" checked={value.onlyOpen} onChange={(e) => set({ onlyOpen: e.target.checked })} />
          Only show places open during my time
        </label>
      </details>
    </section>
  )
}
