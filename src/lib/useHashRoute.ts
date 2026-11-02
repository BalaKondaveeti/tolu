import { useEffect, useState } from 'react'

// "#/counter/abc" → ["counter", "abc"]
function parse(): string[] {
  return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
}

export function useHashRoute(): string[] {
  const [parts, setParts] = useState(parse)
  useEffect(() => {
    const onChange = () => {
      setParts(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return parts
}

export function navigate(path: string) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`
}
