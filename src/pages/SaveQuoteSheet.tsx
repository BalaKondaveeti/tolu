import { useEffect, useState } from 'react'
import { Sheet } from '../components/Sheet'
import type { Background } from '../data/backgrounds'
import { renderQuoteImage } from '../data/quoteImage'
import type { Quote } from '../data/quotes'

export interface SaveTarget {
  quote: Quote
  bg: Background | null
}

type State =
  | { kind: 'working' }
  | { kind: 'ready'; url: string; file: File; usedPhoto: boolean }
  | { kind: 'error'; message: string }

// Shows the rendered image first, then saves it from a fresh tap. iPhone only
// opens the share sheet straight from a tap, and rendering can take a moment.
export function SaveQuoteSheet({ target, onClose }: { target: SaveTarget | null; onClose: () => void }) {
  return (
    <Sheet open={!!target} onClose={onClose} title="Save image">
      {target && <SaveBody target={target} />}
    </Sheet>
  )
}

function SaveBody({ target }: { target: SaveTarget }) {
  const [state, setState] = useState<State>({ kind: 'working' })
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    renderQuoteImage(target.quote.text, target.bg)
      .then(({ blob, usedPhoto }) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        const stamp = new Date().toISOString().slice(0, 10)
        const file = new File([blob], `wake-up-${stamp}.jpg`, { type: 'image/jpeg' })
        setState({ kind: 'ready', url, file, usedPhoto })
      })
      .catch((err) => !cancelled && setState({ kind: 'error', message: err instanceof Error ? err.message : String(err) }))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [target])

  const save = async () => {
    if (state.kind !== 'ready') return
    const shareData = { files: [state.file] }
    if (navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    const a = document.createElement('a')
    a.href = state.url
    a.download = state.file.name
    a.click()
    setNote('Downloaded.')
  }

  if (state.kind === 'error') return <p className="form-error">Couldn't make the image: {state.message}</p>

  return (
    <div className="stack save-quote">
      <div className="save-quote__frame">
        {state.kind === 'ready' ? (
          <img className="save-quote__img" src={state.url} alt={`"${target.quote.text}"`} />
        ) : (
          <div className="save-quote__img save-quote__img--loading" aria-label="Making the image" />
        )}
      </div>
      {state.kind === 'ready' && !state.usedPhoto && (
        <p className="hint hint--flush">The photo couldn't be used, so this one has a plain background.</p>
      )}
      <button type="button" className="btn btn--filled btn--block" onClick={save} disabled={state.kind !== 'ready'}>
        {state.kind === 'ready' ? 'Save to Photos' : 'Making image…'}
      </button>
      <p className="hint hint--flush save-quote__tip">
        {note ?? 'Tap Save, then "Save Image". You can also press and hold the picture.'}
      </p>
    </div>
  )
}
