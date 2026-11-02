import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { clearUserCache, setCacheUser } from './cache'
import { supabase } from './supabase'
import { seedIfEmpty } from '../data/counters'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setCacheUser(data.session?.user.id ?? null)
      setSession(data.session)
      setReady(true)
      if (data.session) void seedIfEmpty(data.session.user.id)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setCacheUser(next?.user.id ?? null)
      setSession(next)
      setReady(true)
      if (event === 'SIGNED_IN' && next) void seedIfEmpty(next.user.id)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { session, ready }
}

export async function signOut(userId: string) {
  clearUserCache(userId)
  await supabase.auth.signOut({ scope: 'local' })
}
