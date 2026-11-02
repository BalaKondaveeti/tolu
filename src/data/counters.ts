import { invalidate, mutate } from '../lib/cache'
import { fetchAll } from '../lib/fetchAll'
import { fail, supabase } from '../lib/supabase'

export interface Counter {
  id: string
  name: string
  value: number
  note: string
  color: number
  created_at: string
  updated_at: string
}

export const COUNTERS_KEY = 'counters'
const TABLE = 'tolu_counters'
const COLUMNS = 'id,name,value,note,color,created_at,updated_at'
export function fetchCounters(): Promise<Counter[]> {
  return fetchAll<Counter>((from, to) =>
    supabase.from(TABLE).select(COLUMNS).order('updated_at', { ascending: false }).order('id').range(from, to),
  )
}

export async function createCounter(input: { name: string; value: number; color: number; note?: string }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ name: input.name, value: input.value, color: input.color, note: input.note ?? '' })
    .select(COLUMNS)
    .single()
  fail(error)
  invalidate(COUNTERS_KEY)
  return data as Counter
}

export async function updateCounter(id: string, patch: Partial<Pick<Counter, 'name' | 'value' | 'color' | 'note'>>) {
  mutate<Counter[]>(COUNTERS_KEY, (prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const { error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  invalidate(COUNTERS_KEY)
  fail(error)
}

export async function deleteCounter(id: string) {
  mutate<Counter[]>(COUNTERS_KEY, (prev) => (prev ?? []).filter((c) => c.id !== id))
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  invalidate(COUNTERS_KEY)
  fail(error)
}

// Atomic server-side increment, so taps from two devices never overwrite
// each other. Returns the new value.
export async function bumpCounter(id: string, delta: number): Promise<number> {
  const { data, error } = await supabase.rpc('tolu_counter_bump', { p_id: id, p_delta: delta })
  fail(error)
  if (typeof data !== 'number') throw new Error('This counter no longer exists.')
  return data
}

// Runs once per user per browser after sign-in; only seeds an empty account.
export async function seedIfEmpty(userId: string) {
  const flag = `tolu:seeded:${userId}`
  try {
    if (localStorage.getItem(flag)) return
  } catch {
    return
  }
  const { count, error } = await supabase.from(TABLE).select('id', { count: 'exact', head: true })
  if (error) return
  if (count === 0) {
    const { error: insertError } = await supabase.from(TABLE).insert({
      name: 'My counter',
      value: 0,
      color: 0,
      note: 'Paste or type a note here. It syncs across your devices.',
    })
    if (insertError) return
    invalidate(COUNTERS_KEY)
  }
  try {
    localStorage.setItem(flag, '1')
  } catch {
    // ignore
  }
}
