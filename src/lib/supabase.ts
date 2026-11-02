import { createClient } from '@supabase/supabase-js'
import { key, loadConfig } from './config'

export const config = loadConfig()

export const supabase = createClient(config.url, config.key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Own key so signing out of another app on this origin doesn't sign us out.
    storageKey: key('auth'),
  },
})

export type FailureKind = 'offline' | 'unreachable' | 'error'

export class AppError extends Error {
  kind: FailureKind
  constructor(kind: FailureKind, message: string) {
    super(message)
    this.kind = kind
  }
}

export function fail(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(error.message)
}

const NETWORK_HINTS = ['failed to fetch', 'networkerror', 'load failed', 'network request failed', 'fetch failed']

// Turns whatever supabase-js handed back into one of three cases the UI knows
// how to explain. Paused free projects surface as network errors or 5xx.
export function classify(err: unknown, status?: number): AppError {
  if (err instanceof AppError) return err
  const message =
    err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : String(err)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return new AppError('offline', message)
  }
  const lower = message.toLowerCase()
  if (NETWORK_HINTS.some((h) => lower.includes(h)) || (status !== undefined && (status === 0 || status >= 500))) {
    return new AppError('unreachable', message)
  }
  return new AppError('error', message)
}
