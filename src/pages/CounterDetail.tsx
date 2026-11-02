import { useEffect, useRef, useState } from 'react'
import { Header } from '../components/Header'
import { ClipboardIcon, MinusIcon, PencilIcon, PlusIcon, ResetIcon } from '../components/Icons'
import { RefreshPill } from '../components/RefreshPill'
import { ConfirmSheet, Sheet } from '../components/Sheet'
import { StatusNotice } from '../components/StatusNotice'
import { updateCounter, type Counter } from '../data/counters'
import { bump, usePending } from '../data/useBump'
import { useCounters } from '../data/useCounters'
import { ago } from '../lib/time'
import { colorVar } from '../tools'
import { CounterForm } from './CounterForm'

const NOTE_SAVE_MS = 700

export function CounterDetail({ id }: { id: string }) {
  const q = useCounters()
  const counter = q.data?.find((c) => c.id === id)

  return (
    <>
      <Header
        title={counter?.name ?? 'Counter'}
        back={{ label: 'Counters', href: '#/counter' }}
        right={<RefreshPill updatedAt={q.updatedAt} loading={q.loading} onRefresh={q.refresh} />}
      />
      <main className="page">
        <StatusNotice error={q.error} hasData={!!q.data} onRetry={q.refresh} />
        {counter ? (
          <CounterBody key={counter.id} counter={counter} />
        ) : q.data ? (
          <div className="empty">
            <p className="empty__title">Counter not found</p>
            <p className="empty__text">It may have been deleted on another device.</p>
            <a className="btn btn--tinted" href="#/counter">
              Back to counters
            </a>
          </div>
        ) : (
          <div className="group skeleton" aria-label="Loading" />
        )}
      </main>
    </>
  )
}

function CounterBody({ counter }: { counter: Counter }) {
  const pending = usePending()
  const value = pending.valueOf(counter)
  const [editing, setEditing] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = async () => {
    setResetting(false)
    try {
      await updateCounter(counter.id, { value: 0 })
      setError(null)
    } catch (err) {
      setError(`Couldn't reset: ${err instanceof Error ? err.message : err}`)
    }
  }

  return (
    <>
      <NoteCard counter={counter} />

      {(error || pending.error) && <div className="notice">{error ?? pending.error}</div>}

      <section className="hero hero--counter" style={{ ['--tint' as string]: colorVar(counter.color) }}>
        <p className="hero__label">{counter.name}</p>
        <p className="hero__number hero__number--xl" aria-live="polite">
          {value.toLocaleString()}
        </p>
        <p className="hero__sub">Updated {ago(counter.updated_at)}</p>
      </section>

      <div className="counter-controls">
        <button type="button" className="counter-btn counter-btn--minus" onClick={() => bump(counter.id, -1)} aria-label="Minus one">
          <MinusIcon width={34} height={34} strokeWidth={2.6} />
          <span>1</span>
        </button>
        <button type="button" className="counter-btn counter-btn--plus" onClick={() => bump(counter.id, 1)} aria-label="Plus one">
          <PlusIcon width={34} height={34} strokeWidth={2.6} />
          <span>1</span>
        </button>
      </div>

      <div className="group">
        <button type="button" className="list-btn" onClick={() => setEditing(true)}>
          <PencilIcon width={20} height={20} />
          <span>Edit name, value or color</span>
        </button>
        <button type="button" className="list-btn list-btn--danger" onClick={() => setResetting(true)} disabled={value === 0}>
          <ResetIcon width={20} height={20} />
          <span>Reset to 0</span>
        </button>
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit counter">
        <CounterForm
          initial={{ name: counter.name, value, color: counter.color }}
          submitLabel="Save"
          onSubmit={async (v) => {
            await updateCounter(counter.id, v)
            setEditing(false)
          }}
        />
      </Sheet>

      <ConfirmSheet
        open={resetting}
        title="Reset to 0?"
        message={`"${counter.name}" is at ${value.toLocaleString()}. This sets it back to 0 on all your devices.`}
        confirmLabel="Reset"
        onConfirm={reset}
        onCancel={() => setResetting(false)}
      />
    </>
  )
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

// The note sits on top of the counter. It autosaves while typing; the server
// copy only replaces what's on screen when you're not editing it.
function NoteCard({ counter }: { counter: Counter }) {
  const [draft, setDraft] = useState<string | null>(null)
  const [save, setSave] = useState<SaveState>('idle')
  const [canPaste] = useState(() => typeof navigator !== 'undefined' && !!navigator.clipboard?.readText)
  const timer = useRef<number | undefined>(undefined)
  const focused = useRef(false)
  const latest = useRef<string | null>(null)

  const text = draft ?? counter.note

  const persist = async (note: string) => {
    window.clearTimeout(timer.current)
    setSave('saving')
    try {
      await updateCounter(counter.id, { note })
      setSave('saved')
      if (!focused.current && latest.current === note) setDraft(null)
    } catch {
      setSave('error')
    }
  }

  const change = (note: string) => {
    latest.current = note
    setDraft(note)
    setSave('idle')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void persist(note), NOTE_SAVE_MS)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const paste = async () => {
    try {
      const clip = await navigator.clipboard.readText()
      if (!clip) return
      const note = text.trim() ? `${text.replace(/\s+$/, '')}\n${clip}` : clip
      latest.current = note
      setDraft(note)
      await persist(note)
    } catch {
      setSave('error')
    }
  }

  const clear = () => {
    latest.current = ''
    setDraft('')
    void persist('')
  }

  const status =
    save === 'saving' ? 'Saving…' : save === 'saved' ? 'Saved' : save === 'error' ? "Couldn't save. Edit to retry." : draft !== null && draft !== counter.note ? 'Editing…' : 'Synced'

  return (
    <section className="card note">
      <div className="note__head">
        <span className="section-label">Note</span>
        <span className={`note__status${save === 'error' ? ' is-error' : ''}`}>{status}</span>
      </div>
      <textarea
        className="note__input"
        value={text}
        placeholder="Paste or type a note…"
        rows={Math.min(10, Math.max(3, text.split('\n').length + 1))}
        onChange={(e) => change(e.target.value)}
        onFocus={() => {
          focused.current = true
        }}
        onBlur={() => {
          focused.current = false
          if (draft !== null && draft !== counter.note) void persist(draft)
          else setDraft(null)
        }}
      />
      <div className="note__actions">
        {canPaste && (
          <button type="button" className="btn btn--small btn--tinted" onClick={paste}>
            <ClipboardIcon width={16} height={16} />
            Paste
          </button>
        )}
        <button type="button" className="btn btn--small btn--plain" onClick={clear} disabled={!text}>
          Clear
        </button>
      </div>
    </section>
  )
}
