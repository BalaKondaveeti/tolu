import { useState, type FormEvent } from 'react'
import { Segmented } from '../components/Segmented'
import { Sheet } from '../components/Sheet'
import { addQuotes, parseQuotes, updateQuote, type Quote } from '../data/quotes'

type Mode = 'one' | 'many'

export function AddQuotesSheet({ open, onClose, startMany = false }: { open: boolean; onClose: () => void; startMany?: boolean }) {
  return (
    <Sheet open={open} onClose={onClose} title="Add quotes">
      {open && <AddQuotesForm startMany={startMany} onDone={onClose} />}
    </Sheet>
  )
}

function AddQuotesForm({ startMany, onDone }: { startMany: boolean; onDone: () => void }) {
  const [mode, setMode] = useState<Mode>(startMany ? 'many' : 'one')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = mode === 'many' ? parseQuotes(text) : text.trim() ? [text.trim()] : []

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return setError('Type or paste a quote first.')
    setBusy(true)
    setError(null)
    try {
      await addQuotes(items)
      onDone()
    } catch (err) {
      setError(`Couldn't save: ${err instanceof Error ? err.message : err}`)
      setBusy(false)
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <Segmented
        label="How many"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'one', label: 'One quote' },
          { value: 'many', label: 'Paste a list' },
        ]}
      />
      <div className="card">
        <textarea
          className="note__input"
          rows={mode === 'many' ? 9 : 4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === 'many' ? 'One quote per line. Numbers like "1." are removed.' : 'A line that gets you moving'}
          autoFocus
        />
      </div>
      {mode === 'many' && items.length > 0 && (
        <p className="hint hint--flush">
          {items.length} {items.length === 1 ? 'quote' : 'quotes'} will be added.
        </p>
      )}
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn--filled btn--block" disabled={busy || items.length === 0}>
        {busy ? 'Saving…' : items.length > 1 ? `Add ${items.length} quotes` : 'Add quote'}
      </button>
    </form>
  )
}

export function EditQuoteSheet({ quote, onClose }: { quote: Quote | null; onClose: () => void }) {
  return (
    <Sheet open={!!quote} onClose={onClose} title="Edit quote">
      {quote && <EditQuoteForm quote={quote} onDone={onClose} />}
    </Sheet>
  )
}

function EditQuoteForm({ quote, onDone }: { quote: Quote; onDone: () => void }) {
  const [text, setText] = useState(quote.text)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return setError('A quote needs some words.')
    setBusy(true)
    try {
      await updateQuote(quote.id, { text: text.trim() })
      onDone()
    } catch (err) {
      setError(`Couldn't save: ${err instanceof Error ? err.message : err}`)
      setBusy(false)
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <div className="card">
        <textarea className="note__input" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn--filled btn--block" disabled={busy}>
        {busy ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
