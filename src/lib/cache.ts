import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { key } from './config'
import { AppError, classify } from './supabase'

// A tiny query cache: results are kept in memory and mirrored to localStorage
// (namespaced per user) so screens render instantly from the last known data.

export const STALE_MS = 60 * 60 * 1000

export interface QueryState<T> {
  data?: T
  updatedAt?: number
  error?: AppError
  loading: boolean
}

type Fetcher<T> = () => Promise<T>

const states = new Map<string, QueryState<unknown>>()
const fetchers = new Map<string, Fetcher<unknown>>()
const inflight = new Map<string, Promise<void>>()
const listeners = new Map<string, Set<() => void>>()
let userId = 'anon'

const EMPTY: QueryState<never> = { loading: false }

const storageKey = (k: string) => key('cache', userId, k)

export function setCacheUser(id: string | null) {
  if ((id ?? 'anon') === userId) return
  userId = id ?? 'anon'
  states.clear()
  inflight.clear()
  listeners.forEach((set) => set.forEach((fn) => fn()))
}

function emit(k: string) {
  listeners.get(k)?.forEach((fn) => fn())
}

function setState<T>(k: string, next: QueryState<T>) {
  states.set(k, next as QueryState<unknown>)
  emit(k)
}

function getState<T>(k: string): QueryState<T> {
  let s = states.get(k) as QueryState<T> | undefined
  if (!s) {
    s = hydrate<T>(k)
    states.set(k, s as QueryState<unknown>)
  }
  return s
}

function hydrate<T>(k: string): QueryState<T> {
  try {
    const raw = localStorage.getItem(storageKey(k))
    if (raw) {
      const parsed = JSON.parse(raw) as { at: number; data: T }
      return { data: parsed.data, updatedAt: parsed.at, loading: false }
    }
  } catch {
    // corrupted or unavailable storage: treat as empty
  }
  return EMPTY
}

function persist<T>(k: string, data: T, at: number) {
  try {
    localStorage.setItem(storageKey(k), JSON.stringify({ at, data }))
  } catch {
    // quota or private mode: in-memory cache still works
  }
}

export function refresh(k: string): Promise<void> {
  const existing = inflight.get(k)
  if (existing) return existing
  const fetcher = fetchers.get(k)
  if (!fetcher) return Promise.resolve()
  const owner = userId
  setState(k, { ...getState(k), loading: true })
  const p = fetcher()
    .then((data) => {
      if (owner !== userId) return
      const at = Date.now()
      persist(k, data, at)
      setState(k, { data, updatedAt: at, loading: false })
    })
    .catch((err) => {
      if (owner !== userId) return
      const status = err && typeof err === 'object' && 'status' in err ? Number(err.status) : undefined
      setState(k, { ...getState(k), loading: false, error: classify(err, status) })
    })
    .finally(() => inflight.delete(k))
  inflight.set(k, p)
  return p
}

// Optimistic in-memory change while a write is in flight.
export function mutate<T>(k: string, update: (prev: T | undefined) => T) {
  const s = getState<T>(k)
  setState(k, { ...s, data: update(s.data) })
}

// Every write calls this: drop the stored copy and refetch what's on screen.
export function invalidate(...ks: string[]) {
  for (const k of ks) {
    try {
      localStorage.removeItem(storageKey(k))
    } catch {
      // ignore
    }
    if (fetchers.has(k)) void refresh(k)
  }
}

export function refreshAll() {
  fetchers.forEach((_f, k) => {
    if (listeners.get(k)?.size) void refresh(k)
  })
}

export function clearUserCache(id: string) {
  try {
    const prefix = key('cache', id) + ':'
    const doomed: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(prefix)) doomed.push(k)
    }
    doomed.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
  states.clear()
}

function subscribe(k: string, fn: () => void) {
  let set = listeners.get(k)
  if (!set) listeners.set(k, (set = new Set()))
  set.add(fn)
  return () => set.delete(fn)
}

export function useQuery<T>(k: string, fetcher: Fetcher<T>) {
  fetchers.set(k, fetcher as Fetcher<unknown>)
  const state = useSyncExternalStore(
    useCallback((fn) => subscribe(k, fn), [k]),
    () => getState<T>(k),
  )

  useEffect(() => {
    const s = getState<T>(k)
    if (!s.updatedAt || Date.now() - s.updatedAt > STALE_MS) void refresh(k)
  }, [k])

  return { ...state, refresh: () => refresh(k) }
}

// Refetch whatever is on screen when the app returns to the foreground or the
// network comes back. Mounted once at the app root.
export function useForegroundRefresh() {
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshAll()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', refreshAll)
    window.addEventListener('pageshow', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', refreshAll)
      window.removeEventListener('pageshow', onVisible)
    }
  }, [])
}
