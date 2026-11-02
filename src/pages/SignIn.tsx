import { useState, type FormEvent } from 'react'
import { Segmented } from '../components/Segmented'
import { StatusNotice } from '../components/StatusNotice'
import { AppError, classify, supabase } from '../lib/supabase'
import { ProjectSheet } from './ProjectSheet'

type Mode = 'signin' | 'signup'

export function SignIn() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<AppError | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [projectOpen, setProjectOpen] = useState(false)

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (err) throw Object.assign(err, { status: err.status })
      } else {
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password })
        if (err) throw Object.assign(err, { status: err.status })
        if (!data.session) setInfo('Check your email to confirm your account, then sign in.')
      }
    } catch (err) {
      const status = err && typeof err === 'object' && 'status' in err ? Number(err.status) : undefined
      setError(classify(err, status))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth">
      <div className="auth__brand">
        <span className="auth__logo" aria-hidden="true">
          +1
        </span>
        <h1 className="auth__title">tolu</h1>
        <p className="auth__tagline">Your little set of tools, synced everywhere.</p>
      </div>

      {error && error.kind !== 'error' && <StatusNotice error={error} hasData={false} onRetry={() => void submit()} />}

      <form className="stack" onSubmit={submit}>
        <Segmented
          label="Account"
          value={mode}
          onChange={(m) => {
            setMode(m)
            setError(null)
            setInfo(null)
          }}
          options={[
            { value: 'signin', label: 'Sign in' },
            { value: 'signup', label: 'Create account' },
          ]}
        />
        <div className="group">
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error?.kind === 'error' && <p className="form-error">{error.message}</p>}
        {info && <p className="form-info">{info}</p>}
        <button type="submit" className="btn btn--filled btn--block" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <button type="button" className="btn btn--plain btn--block" onClick={() => setProjectOpen(true)}>
          Change Supabase project
        </button>
      </form>
      <ProjectSheet open={projectOpen} onClose={() => setProjectOpen(false)} />
    </main>
  )
}
