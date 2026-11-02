import { useEffect, useState } from 'react'
import { ago } from '../lib/time'
import { RefreshIcon } from './Icons'

interface Props {
  updatedAt?: number
  loading: boolean
  onRefresh: () => void
}

export function RefreshPill({ updatedAt, loading, onRefresh }: Props) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const label = loading ? 'Updating…' : updatedAt ? `Updated ${ago(updatedAt, now)}` : 'Not loaded'
  return (
    <button type="button" className="pill" onClick={onRefresh} disabled={loading} aria-label={`${label}. Refresh`}>
      <span>{label}</span>
      <RefreshIcon width={14} height={14} className={loading ? 'spin' : undefined} />
    </button>
  )
}
