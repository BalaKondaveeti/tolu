// All localStorage keys start with "tolu:" because every app on
// balakondaveeti.github.io shares one origin (and one localStorage).
export const APP_PREFIX = 'tolu'
export const key = (...parts: string[]) => [APP_PREFIX, ...parts].join(':')

export interface SupabaseConfig {
  url: string
  key: string
}

// Publishable key only. Data is protected by RLS + disabled sign-ups.
export const DEFAULT_CONFIG: SupabaseConfig = {
  url: 'https://yxwqmwvelpjwwlvrpvki.supabase.co',
  key: 'sb_publishable_UJ46Ykxu0xhh4E3T_czhDg_E-Fx3hyu',
}

const CONFIG_KEY = key('supabase-config')

export function loadConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SupabaseConfig>
      if (parsed.url && parsed.key) return { url: parsed.url, key: parsed.key }
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_CONFIG
}

export function isCustomConfig(): boolean {
  try {
    return localStorage.getItem(CONFIG_KEY) !== null
  } catch {
    return false
  }
}

export function saveConfig(config: SupabaseConfig | null) {
  try {
    if (config) localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    else localStorage.removeItem(CONFIG_KEY)
  } catch {
    // storage unavailable; nothing we can persist
  }
}

export function projectRef(url: string): string {
  try {
    return new URL(url).hostname.split('.')[0]
  } catch {
    return ''
  }
}

export function dashboardUrl(url: string): string {
  return `https://supabase.com/dashboard/project/${projectRef(url)}`
}
