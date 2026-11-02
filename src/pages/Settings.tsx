import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Header } from '../components/Header'
import { ChevronRight } from '../components/Icons'
import { clearUserCache, refreshAll } from '../lib/cache'
import { signOut } from '../lib/auth'
import { dashboardUrl, isCustomConfig, projectRef } from '../lib/config'
import { config } from '../lib/supabase'
import { ProjectSheet } from './ProjectSheet'

export function Settings({ session }: { session: Session }) {
  const [projectOpen, setProjectOpen] = useState(false)
  const [cleared, setCleared] = useState(false)

  return (
    <>
      <Header title="Settings" />
      <main className="page">
        <p className="section-label">Account</p>
        <div className="group">
          <div className="kv">
            <span>Signed in as</span>
            <span className="kv__value">{session.user.email}</span>
          </div>
          <button type="button" className="list-btn list-btn--danger" onClick={() => void signOut(session.user.id)}>
            Sign out
          </button>
        </div>

        <p className="section-label">Data</p>
        <div className="group">
          <button type="button" className="list-btn" onClick={() => setProjectOpen(true)}>
            <span className="list-btn__text">
              <span>Change Supabase project</span>
              <span className="list-btn__sub">
                {projectRef(config.url)}
                {isCustomConfig() ? ' · custom for this browser' : ' · default'}
              </span>
            </span>
            <ChevronRight width={18} height={18} className="list-btn__chevron" />
          </button>
          <a className="list-btn" href={dashboardUrl(config.url)} target="_blank" rel="noreferrer">
            <span>Open Supabase dashboard</span>
            <ChevronRight width={18} height={18} className="list-btn__chevron" />
          </a>
          <button
            type="button"
            className="list-btn"
            onClick={() => {
              clearUserCache(session.user.id)
              refreshAll()
              setCleared(true)
            }}
          >
            <span>{cleared ? 'Cache cleared, reloading data' : 'Clear cached data'}</span>
          </button>
        </div>
        <p className="hint">Data is cached on this device for instant loading and refreshes hourly or when you reopen the app.</p>

        <p className="section-label">About</p>
        <div className="group">
          <div className="kv">
            <span>Version</span>
            <span className="kv__value">{__APP_VERSION__}</span>
          </div>
        </div>
      </main>
      <ProjectSheet open={projectOpen} onClose={() => setProjectOpen(false)} />
    </>
  )
}
