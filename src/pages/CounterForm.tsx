import { useState, type FormEvent } from 'react'
import { colorVar, PALETTE_SIZE } from '../tools'

export interface CounterFormValues {
  name: string
  value: number
  color: number
}

interface Props {
  initial: CounterFormValues
  submitLabel: string
  onSubmit: (values: CounterFormValues) => Promise<void>
}

const COLOR_NAMES = ['Blue', 'Orange', 'Teal', 'Yellow', 'Pink', 'Green', 'Purple', 'Red']

export function CounterForm({ initial, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial.name)
  const [value, setValue] = useState(String(initial.value))
  const [color, setColor] = useState(initial.color)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number.parseInt(value, 10)
    if (!name.trim()) return setError('Give the counter a name.')
    if (!Number.isFinite(parsed) || Math.abs(parsed) > 2_000_000_000) return setError('Enter a whole number.')
    setBusy(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), value: parsed, color })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="stack">
      <div className="group">
        <label className="field">
          <span className="field__label">Name</span>
          <input
            className="field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Glasses of water"
            maxLength={60}
            autoFocus={!initial.name}
          />
        </label>
        <label className="field">
          <span className="field__label">Value</span>
          <input
            className="field__input field__input--number"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))}
            inputMode="numeric"
            pattern="-?[0-9]*"
          />
        </label>
      </div>

      <div>
        <p className="section-label">Color</p>
        <div className="swatches" role="radiogroup" aria-label="Color">
          {Array.from({ length: PALETTE_SIZE }, (_, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={color === i}
              aria-label={COLOR_NAMES[i]}
              className={`swatch${color === i ? ' is-active' : ''}`}
              style={{ background: colorVar(i) }}
              onClick={() => setColor(i)}
            />
          ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn btn--filled btn--block" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
