import { invalidate, mutate, useQuery } from '../lib/cache'
import { fetchAll } from '../lib/fetchAll'
import { fail, supabase } from '../lib/supabase'

// Quotes live only in Supabase (tolu_wakeup_quotes), never in the repo.

export interface Quote {
  id: string
  text: string
  favorite: boolean
  created_at: string
}

export const QUOTES_KEY = 'wakeup-quotes'
const TABLE = 'tolu_wakeup_quotes'
const COLUMNS = 'id,text,favorite,created_at'

export function fetchQuotes(): Promise<Quote[]> {
  return fetchAll<Quote>((from, to) =>
    supabase.from(TABLE).select(COLUMNS).order('created_at', { ascending: false }).order('id').range(from, to),
  )
}

export function useQuotes() {
  return useQuery(QUOTES_KEY, fetchQuotes)
}

// "1. Eat the frog" / "2) Do it" / "- Do it" → the quote text alone.
export function parseQuotes(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.replace(/^\s*(?:\d+\s*[.)\]:-]|[-*•])\s*/, '').trim())
    .filter((line) => line.length > 0)
}

export async function addQuotes(texts: string[]) {
  if (texts.length === 0) return
  // Newest-first lists would reverse a pasted list, so the first line gets the
  // latest timestamp and the pasted order is kept on screen.
  const now = Date.now()
  const rows = texts.map((text, i) => ({ text, created_at: new Date(now + (texts.length - i)).toISOString() }))
  const { error } = await supabase.from(TABLE).insert(rows)
  invalidate(QUOTES_KEY)
  fail(error)
}

export async function updateQuote(id: string, patch: Partial<Pick<Quote, 'text' | 'favorite'>>) {
  mutate<Quote[]>(QUOTES_KEY, (prev) => (prev ?? []).map((q) => (q.id === id ? { ...q, ...patch } : q)))
  const { error } = await supabase.from(TABLE).update(patch).eq('id', id)
  invalidate(QUOTES_KEY)
  fail(error)
}

export async function deleteQuote(id: string) {
  mutate<Quote[]>(QUOTES_KEY, (prev) => (prev ?? []).filter((q) => q.id !== id))
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  invalidate(QUOTES_KEY)
  fail(error)
}
