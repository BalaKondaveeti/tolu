import { createContext, useContext, useRef, useState, type ReactNode, type PointerEvent } from 'react'
import { PencilIcon, TrashIcon } from './Icons'

const ACTIONS_WIDTH = 168
const OPEN_THRESHOLD = 56
const TAP_SLOP = 6

interface SwipeCtx {
  openId: string | null
  setOpenId: (id: string | null) => void
}

const Ctx = createContext<SwipeCtx>({ openId: null, setOpenId: () => {} })

// Wrap a list so only one row can be swiped open at a time.
export function SwipeGroup({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  return <Ctx.Provider value={{ openId, setOpenId }}>{children}</Ctx.Provider>
}

interface Props {
  id: string
  onTap: () => void
  onEdit: () => void
  onDelete: () => void
  children: ReactNode
  // Extra content shown under the row (e.g. expanded details). Kept outside the
  // tappable element so its own buttons stay separate controls.
  details?: ReactNode
}

export function SwipeRow({ id, onTap, onEdit, onDelete, children, details }: Props) {
  const { openId, setOpenId } = useContext(Ctx)
  const isOpen = openId === id
  const [dx, setDx] = useState<number | null>(null)
  const start = useRef<{ x: number; y: number; base: number; moved: boolean; locked: 'x' | 'y' | null } | null>(null)

  const offset = dx ?? (isOpen ? -ACTIONS_WIDTH : 0)

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    start.current = { x: e.clientX, y: e.clientY, base: isOpen ? -ACTIONS_WIDTH : 0, moved: false, locked: null }
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current
    if (!s) return
    const mx = e.clientX - s.x
    const my = e.clientY - s.y
    if (!s.locked) {
      if (Math.abs(mx) < TAP_SLOP && Math.abs(my) < TAP_SLOP) return
      s.locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
      s.moved = true
      if (s.locked === 'x') {
        e.currentTarget.setPointerCapture(e.pointerId)
        if (openId !== id) setOpenId(null)
      }
    }
    if (s.locked !== 'x') return
    const next = Math.min(0, Math.max(-ACTIONS_WIDTH - 40, s.base + mx))
    setDx(next)
  }

  const onUp = () => {
    const s = start.current
    start.current = null
    if (!s) return
    if (!s.moved) {
      if (isOpen) setOpenId(null)
      else if (openId) setOpenId(null)
      else onTap()
      return
    }
    if (s.locked === 'x' && dx !== null) {
      setOpenId(dx < -OPEN_THRESHOLD ? id : isOpen ? null : openId)
    }
    setDx(null)
  }

  const onCancel = () => {
    start.current = null
    setDx(null)
  }

  return (
    <div className="swipe">
      <div className="swipe__actions" aria-hidden={!isOpen}>
        <button
          type="button"
          className="swipe__btn swipe__btn--edit"
          tabIndex={isOpen ? 0 : -1}
          onClick={() => {
            setOpenId(null)
            onEdit()
          }}
        >
          <PencilIcon width={20} height={20} />
          <span>Edit</span>
        </button>
        <button
          type="button"
          className="swipe__btn swipe__btn--delete"
          tabIndex={isOpen ? 0 : -1}
          onClick={() => {
            setOpenId(null)
            onDelete()
          }}
        >
          <TrashIcon width={20} height={20} />
          <span>Delete</span>
        </button>
      </div>
      <div
        className={`swipe__content${dx !== null ? ' is-dragging' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
      >
        <div
          className="swipe__tap"
          role="button"
          tabIndex={0}
          aria-expanded={details ? true : false}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onTap()
            }
          }}
        >
          {children}
        </div>
        {details}
      </div>
    </div>
  )
}
