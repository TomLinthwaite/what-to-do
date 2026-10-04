interface Props {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export function Stepper({ label, value, min = 0, max = 20, onChange }: Props) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <div className="stepper-controls">
        <button type="button" className="icon-btn" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          −
        </button>
        <span className="stepper-value" aria-live="polite">
          {value}
        </span>
        <button type="button" className="icon-btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          +
        </button>
      </div>
    </div>
  )
}
