import { useEffect, useState } from 'react'
import type { AppError } from '../lib/supabase'
import { config } from '../lib/supabase'
import { dashboardUrl } from '../lib/config'

interface Props {
  error?: AppError
  hasData: boolean
  onRetry: () => void
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function StatusNotice({ error, hasData, onRetry }: Props) {
  const online = useOnline()

  if (!online || error?.kind === 'offline') {
    return (
      <div className="notice" role="status">
        <strong>You're offline.</strong>{' '}
        {hasData ? 'Showing your saved data. Changes need a connection.' : 'Connect to the internet to load your data.'}
      </div>
    )
  }

  if (!error) return null

  if (error.kind === 'unreachable') {
    return (
      <div className="notice" role="alert">
        <strong>Can't reach Supabase.</strong> Free projects pause after about a week without use. Restore it from the
        dashboard, then retry.{hasData ? ' Your saved data is shown below.' : ''}
        <div className="notice__actions">
          <a className="btn btn--small btn--filled" href={dashboardUrl(config.url)} target="_blank" rel="noreferrer">
            Restore in Supabase
          </a>
          <button type="button" className="btn btn--small btn--tinted" onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="notice" role="alert">
      <strong>Something went wrong.</strong> {error.message}
      <div className="notice__actions">
        <button type="button" className="btn btn--small btn--tinted" onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  )
}
