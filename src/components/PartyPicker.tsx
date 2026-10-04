import { GROUP_TYPES, KID_AGE_GROUPS } from '../constants'
import type { KidAgeGroup, Preferences } from '../types'
import { ChipGroup } from './ChipGroup'
import { Stepper } from './Stepper'

interface Props {
  value: Preferences
  onChange: (patch: Partial<Preferences>) => void
}

export function PartyPicker({ value, onChange }: Props) {
  function addKid(age: KidAgeGroup) {
    onChange({ kids: [...value.kids, age], groupType: 'family' })
  }

  function removeKid(index: number) {
    onChange({ kids: value.kids.filter((_, i) => i !== index) })
  }

  return (
    <>
      <ChipGroup
        name="groupType"
        type="radio"
        options={GROUP_TYPES}
        isSelected={(v) => value.groupType === v}
        onSelect={(groupType) => onChange({ groupType, adults: groupType === 'solo' ? 1 : Math.max(value.adults, groupType === 'couple' ? 2 : value.adults) })}
      />
      <div className="party">
        <Stepper label="Adults" value={value.adults} min={1} onChange={(adults) => onChange({ adults })} />
        <div className="kids">
          <span>Kids</span>
          <div className="chip-group">
            {value.kids.map((age, i) => (
              <span key={i} className="chip active chip-removable">
                🧒 {KID_AGE_GROUPS.find((g) => g.value === age)?.label}
                <button type="button" onClick={() => removeKid(i)} aria-label={`Remove child aged ${age}`}>
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="add-kids">
            {KID_AGE_GROUPS.map((g) => (
              <button key={g.value} type="button" className="btn btn-secondary btn-small" onClick={() => addKid(g.value)}>
                + {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
