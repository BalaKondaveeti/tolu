import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, HeartIcon, ListIcon } from '../components/Icons'
import { StatusNotice } from '../components/StatusNotice'
import { imageUrl, shuffledBackgrounds, type Background } from '../data/backgrounds'
import { updateQuote, useQuotes, type Quote } from '../data/quotes'
import { key } from '../lib/config'
import { AddQuotesSheet } from './QuoteSheets'

const FAV_KEY = key('wakeup', 'favorites-only')
const SWIPE = 50

// Stable pseudo-random order: the same seed keeps the order steady while the
// list refetches, and new quotes slot in without reshuffling everything.
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function readFavOnly(): boolean {
  try {
    return localStorage.getItem(FAV_KEY) === '1'
  } catch {
    return false
  }
}

export function WakeUp() {
  const q = useQuotes()
  const [seed] = useState(() => Math.random().toString(36))
  const [favOnly, setFavOnly] = useState(readFavOnly)
  const [index, setIndex] = useState(0)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const all = q.data
  const list = useMemo(() => {
    const pool = (all ?? []).filter((x) => !favOnly || x.favorite)
    return pool.map((x) => [hash(seed + x.id), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x)
  }, [all, favOnly, seed])

  const count = list.length
  const current: Quote | undefined = count ? list[((index % count) + count) % count] : undefined
  const position = count ? (((index % count) + count) % count) + 1 : 0

  const bg = useBackgrounds(index)

  const next = useCallback(() => setIndex((i) => i + 1), [])
  const prev = useCallback(() => setIndex((i) => i - 1), [])

  const toggleFavorite = useCallback(async () => {
    if (!current) return
    try {
      await updateQuote(current.id, { favorite: !current.favorite })
      setError(null)
    } catch (err) {
      setError(`Couldn't save: ${err instanceof Error ? err.message : err}`)
    }
  }, [current])

  const setFav = (on: boolean) => {
    setFavOnly(on)
    setIndex(0)
    try {
      localStorage.setItem(FAV_KEY, on ? '1' : '0')
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, [role="dialog"]')) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'f') void toggleFavorite()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, toggleFavorite])

  // Tap to advance; swipe left/right to move between quotes.
  const start = useRef<{ x: number; y: number } | null>(null)
  const onDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY }
  }
  const onUp = (e: PointerEvent) => {
    const s = start.current
    start.current = null
    if (!s || !count) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next()
      else prev()
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) next()
  }

  const long = (current?.text.length ?? 0) > 110

  return (
    <div className="wake">
      <BackgroundStage bg={bg.current} onError={bg.skip} />
      <div className="wake__shade" />

      <header className="wake__top">
        <a className="wake__back" href="#/">
          <ChevronLeft width={22} height={22} />
          <span>Tools</span>
        </a>
        <div className="wake__top-actions">
          <button
            type="button"
            className={`wake__chip${favOnly ? ' is-on' : ''}`}
            aria-pressed={favOnly}
            onClick={() => setFav(!favOnly)}
          >
            <HeartIcon width={15} height={15} filled={favOnly} />
            Favorites
          </button>
          <a className="wake__icon-btn" href="#/wakeup/quotes" aria-label="Manage quotes">
            <ListIcon width={20} height={20} />
          </a>
        </div>
      </header>

      <main className="wake__main" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (start.current = null)}>
        <StatusNotice error={q.error} hasData={!!q.data} onRetry={q.refresh} />
        {error && <div className="notice">{error}</div>}

        {current ? (
          <figure className="wake__quote" key={`${current.id}-${index}`}>
            <p className="wake__eyebrow">
              <span className="wake__title">Wake up</span>
              {bg.current && <span>· {bg.current.theme}</span>}
            </p>
            <blockquote className={`wake__text${long ? ' wake__text--long' : ''}`}>{current.text}</blockquote>
            <figcaption className="wake__count">
              {position} of {count}
              {favOnly ? ' favorites' : ''}
            </figcaption>
          </figure>
        ) : q.data ? (
          <div className="wake__empty" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
            <p className="wake__title">Wake up</p>
            {favOnly && (all?.length ?? 0) > 0 ? (
              <>
                <p className="wake__empty-text">No favorites yet. Tap the heart on a quote to keep it here.</p>
                <button type="button" className="btn btn--light" onClick={() => setFav(false)}>
                  Show all quotes
                </button>
              </>
            ) : (
              <>
                <p className="wake__empty-text">Add the lines that get you moving. They're saved to your account, not the app.</p>
                <button type="button" className="btn btn--light" onClick={() => setAdding(true)}>
                  Add your quotes
                </button>
              </>
            )}
          </div>
        ) : (
          <p className="wake__count">{q.loading ? 'Loading…' : ''}</p>
        )}
      </main>

      {current && (
        <div className="wake__controls">
          <button type="button" className="wake__ctrl" onClick={prev} aria-label="Previous quote">
            <ChevronLeft width={26} height={26} />
          </button>
          <button
            type="button"
            className={`wake__ctrl wake__ctrl--heart${current.favorite ? ' is-on' : ''}`}
            onClick={() => void toggleFavorite()}
            aria-pressed={current.favorite}
            aria-label={current.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon width={26} height={26} filled={current.favorite} />
          </button>
          <button type="button" className="wake__ctrl wake__ctrl--next" onClick={next} aria-label="Next quote">
            <span>Next</span>
            <ChevronRight width={22} height={22} />
          </button>
        </div>
      )}

      {bg.current && (
        <a
          className="wake__credit"
          href={`https://unsplash.com/photos/${bg.current.id}`}
          target="_blank"
          rel="noreferrer"
        >
          Photo: {bg.current.credit} / Unsplash
        </a>
      )}

      <AddQuotesSheet open={adding} onClose={() => setAdding(false)} startMany />
    </div>
  )
}

// One background per quote, rotating through themes and skipping any photo
// that fails to load.
function useBackgrounds(index: number) {
  const [order] = useState(shuffledBackgrounds)
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const usable = order.filter((b) => !failed.has(b.id))
  const current = usable.length ? usable[((index % usable.length) + usable.length) % usable.length] : null

  useEffect(() => {
    // Warm the next photo so swiping feels instant.
    const upcoming = usable.length ? usable[(((index + 1) % usable.length) + usable.length) % usable.length] : null
    if (upcoming) new Image().src = imageUrl(upcoming, isPortrait())
  }, [index, usable])

  const skip = useCallback((bg: Background) => setFailed((prev) => new Set(prev).add(bg.id)), [])
  return { current, skip }
}

function isPortrait() {
  return window.innerHeight >= window.innerWidth
}

interface Layer {
  id: string
  url: string
}

// Crossfades to each new photo once it has loaded, with a slow drift.
function BackgroundStage({ bg, onError }: { bg: Background | null; onError: (bg: Background) => void }) {
  const [layers, setLayers] = useState<Layer[]>([])

  useEffect(() => {
    if (!bg) return
    let cancelled = false
    const url = imageUrl(bg, isPortrait())
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setLayers((prev) => [...prev.filter((l) => l.url !== url).slice(-1), { id: `${bg.id}-${Date.now()}`, url }])
    }
    img.onerror = () => {
      if (!cancelled) onError(bg)
    }
    img.src = url
    return () => {
      cancelled = true
    }
  }, [bg, onError])

  return (
    <div className="wake__bg" aria-hidden="true">
      {layers.map((l) => (
        <div key={l.id} className="wake__photo" style={{ backgroundImage: `url("${l.url}")` }} />
      ))}
    </div>
  )
}
