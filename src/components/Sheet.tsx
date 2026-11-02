import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

const CLOSE_MS = 260

// Bottom sheet with a grab handle. Drag the handle down (or tap the backdrop)
// to dismiss. Stays mounted briefly after closing so it can slide out.
export function Sheet({ open, onClose, title, children }: Props) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  const [drag, setDrag] = useState(0)
  const startY = useRef<number | null>(null)
  // Keep showing the last content while the sheet slides away.
  const [lastChildren, setLastChildren] = useState(children)
  if (open && lastChildren !== children) setLastChildren(children)

  if (open && !mounted) setMounted(true)
  if (open && closing) setClosing(false)
  if (!open && mounted && !closing) setClosing(true)

  useEffect(() => {
    if (!closing) return
    const id = window.setTimeout(() => {
      setMounted(false)
      setClosing(false)
      setDrag(0)
    }, CLOSE_MS)
    return () => window.clearTimeout(id)
  }, [closing])

  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mounted, onClose])

  if (!mounted) return null

  const onDown = (e: PointerEvent) => {
    startY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (startY.current === null) return
    setDrag(Math.max(0, e.clientY - startY.current))
  }
  const onUp = () => {
    if (startY.current === null) return
    startY.current = null
    if (drag > 90) onClose()
    else setDrag(0)
  }

  return createPortal(
    <div className={`sheet-layer${closing ? ' is-closing' : ''}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}
      >
        <div className="sheet__grab" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <span className="sheet__handle" />
          {title && <h2 className="sheet__title">{title}</h2>}
        </div>
        <div className="sheet__body">{open ? children : lastChildren}</div>
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmSheet({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Sheet open={open} onClose={onCancel} title={title}>
      <p className="sheet__message">{message}</p>
      <div className="stack">
        <button type="button" className="btn btn--danger btn--block" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="btn btn--plain btn--block" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Sheet>
  )
}
