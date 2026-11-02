import { useState, type FormEvent } from 'react'
import { Sheet } from '../components/Sheet'
import { DEFAULT_CONFIG, isCustomConfig, saveConfig } from '../lib/config'
import { config } from '../lib/supabase'

// Lets this one browser point tolu at a different Supabase project.
export function ProjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [url, setUrl] = useState(config.url)
  const [anonKey, setAnonKey] = useState(config.key)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const u = url.trim().replace(/\/+$/, '')
    const k = anonKey.trim()
    if (!/^https:\/\/[^\s/]+$/.test(u)) return setError('Enter the project URL, like https://abcd.supabase.co')
    if (k.startsWith('sb_secret_') || isServiceRoleJwt(k)) {
      return setError('That is a secret key. Use the publishable (anon) key — secret keys must never go in a web app.')
    }
    if (!k) return setError('Enter the publishable key.')
    saveConfig({ url: u, key: k })
    window.location.reload()
  }

  const useDefault = () => {
    saveConfig(null)
    window.location.reload()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Supabase project">
      <form className="stack" onSubmit={submit}>
        <p className="sheet__message">
          Only this browser is affected. Use the project URL and its <strong>publishable</strong> key from Project Settings → API.
        </p>
        <div className="group">
          <label className="field field--stacked">
            <span className="field__label">Project URL</span>
            <input className="field__input" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          </label>
          <label className="field field--stacked">
            <span className="field__label">Publishable key</span>
            <input className="field__input field__input--mono" value={anonKey} onChange={(e) => setAnonKey(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
          </label>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn--filled btn--block">
          Save and reload
        </button>
        {isCustomConfig() && (
          <button type="button" className="btn btn--plain btn--block" onClick={useDefault}>
            Use default project ({new URL(DEFAULT_CONFIG.url).hostname.split('.')[0]})
          </button>
        )}
      </form>
    </Sheet>
  )
}

function isServiceRoleJwt(k: string): boolean {
  const parts = k.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as { role?: string }
    return payload.role === 'service_role'
  } catch {
    return false
  }
}
