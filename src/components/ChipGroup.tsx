interface Option<T> {
  value: T
  label: string
  emoji?: string
}

interface Props<T> {
  name: string
  type: 'radio' | 'checkbox'
  options: Option<T>[]
  isSelected: (value: T) => boolean
  onSelect: (value: T) => void
}

export function ChipGroup<T extends string | number>({ name, type, options, isSelected, onSelect }: Props<T>) {
  return (
    <div className="chip-group">
      {options.map((o) => (
        <label key={o.value} className={`chip ${isSelected(o.value) ? 'active' : ''}`}>
          <input
            type={type}
            name={name}
            checked={isSelected(o.value)}
            onChange={() => onSelect(o.value)}
          />
          {o.emoji && <span aria-hidden="true">{o.emoji}</span>} {o.label}
        </label>
      ))}
    </div>
  )
}
