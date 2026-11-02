import { useEffect, useSyncExternalStore } from 'react'
import { invalidate, mutate } from '../lib/cache'
import { classify } from '../lib/supabase'
import { bumpCounter, COUNTERS_KEY, type Counter } from './counters'

// Taps are applied instantly on screen and batched into one atomic RPC after a
// short pause, so rapid tapping is one request and never loses a count.
const FLUSH_MS = 400

const queued = new Map<string, number>() // tapped, not yet sent
const sending = new Map<string, number>() // sent, awaiting reply
const timers = new Map<string, number>()
const listeners = new Set<() => void>()
let lastError: string | null = null
let version = 0

function emit() {
  version++
  listeners.forEach((fn) => fn())
}

async function flush(id: string) {
  window.clearTimeout(timers.get(id))
  timers.delete(id)
  const delta = queued.get(id) ?? 0
  if (!delta) return
  queued.delete(id)
  sending.set(id, (sending.get(id) ?? 0) + delta)
  try {
    const value = await bumpCounter(id, delta)
    sending.set(id, (sending.get(id) ?? 0) - delta)
    mutate<Counter[]>(COUNTERS_KEY, (prev) =>
      (prev ?? []).map((c) => (c.id === id ? { ...c, value, updated_at: new Date().toISOString() } : c)),
    )
    lastError = null
  } catch (err) {
    // Drop the unsynced taps so the screen matches the server again.
    sending.set(id, (sending.get(id) ?? 0) - delta)
    const e = classify(err)
    lastError =
      e.kind === 'offline'
        ? "You're offline, so that change wasn't saved."
        : e.kind === 'unreachable'
          ? "Couldn't reach Supabase, so that change wasn't saved."
          : `Couldn't save: ${e.message}`
  }
  if (!sending.get(id)) sending.delete(id)
  if (!sending.has(id) && !queued.has(id)) invalidate(COUNTERS_KEY)
  emit()
}

export function bump(id: string, delta: number) {
  queued.set(id, (queued.get(id) ?? 0) + delta)
  lastError = null
  window.clearTimeout(timers.get(id))
  timers.set(id, window.setTimeout(() => void flush(id), FLUSH_MS))
  emit()
}

export function flushAll() {
  timers.forEach((_t, id) => void flush(id))
}

export function clearBumpError() {
  lastError = null
  emit()
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function usePending() {
  useSyncExternalStore(subscribe, () => version)
  return {
    valueOf: (c: Counter) => c.value + (queued.get(c.id) ?? 0) + (sending.get(c.id) ?? 0),
    error: lastError,
  }
}

// Send queued taps right away if the app is backgrounded.
export function useFlushOnHide() {
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushAll()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flushAll)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flushAll)
    }
  }, [])
}
