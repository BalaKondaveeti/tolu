// Background photos for Wake up, all free under the Unsplash License and
// loaded straight from Unsplash's image CDN. Add or remove entries freely;
// any photo that fails to load is skipped automatically.

export type Theme = 'Nature' | 'Boxing' | 'Racing' | 'Competition'

export interface Background {
  id: string // Unsplash image id (the part after "photo-")
  theme: Theme
  credit: string
}

export const BACKGROUNDS: Background[] = [
  { id: '1494548162494-384bba4ab999', theme: 'Nature', credit: 'Jordan Wozniak' },
  { id: '1490682143684-14369e18dce8', theme: 'Nature', credit: 'Artem Sapegin' },
  { id: '1500534623283-312aade485b7', theme: 'Nature', credit: 'Ivana Cajina' },
  { id: '1500964757637-c85e8a162699', theme: 'Nature', credit: 'simon' },
  { id: '1542224566-6e85f2e6772f', theme: 'Nature', credit: 'Luke Richardson' },
  { id: '1540979388789-6cee28a1cdc9', theme: 'Nature', credit: 'Boris Baldinger' },
  { id: '1509563268479-0f004cf3f58b', theme: 'Boxing', credit: 'Joel Muniz' },
  { id: '1549719386-74dfcbf7dbed', theme: 'Boxing', credit: 'Bogdan Yukhymchuk' },
  { id: '1552072092-7f9b8d63efcb', theme: 'Boxing', credit: 'Attentie Attentie' },
  { id: '1546711076-85a7923432ab', theme: 'Boxing', credit: 'Ivana Cajina' },
  { id: '1495555687398-3f50d6e79e1e', theme: 'Boxing', credit: 'Hermes Rivera' },
  { id: '1750889503652-e96c478e5e2d', theme: 'Racing', credit: 'sydney Rae' },
  { id: '1560692830-04adc2f31119', theme: 'Racing', credit: 'Max Böttinger' },
  { id: '1536909526839-8f10e29ba80c', theme: 'Racing', credit: 'Ralfs Blumbergs' },
  { id: '1572359642202-3cc832e60700', theme: 'Racing', credit: 'Felix Berger' },
  { id: '1502904550040-7534597429ae', theme: 'Competition', credit: 'Steven Lelham' },
  { id: '1698671823406-035c77ff6fcd', theme: 'Competition', credit: 'Tom Morbey' },
  { id: '1444491741275-3747c53c99b4', theme: 'Competition', credit: 'Paul Green' },
  { id: '1758922769578-68c5ba000d87', theme: 'Competition', credit: 'Jorge Alberto Vega Barrera' },
]

export function imageUrl(bg: Background, portrait: boolean): string {
  const size = portrait ? 'w=1080&h=1920' : 'w=1920&h=1080'
  return `https://images.unsplash.com/photo-${bg.id}?auto=format&fit=crop&${size}&q=72`
}

// Shuffle so consecutive quotes rotate through different themes.
export function shuffledBackgrounds(): Background[] {
  const byTheme = new Map<Theme, Background[]>()
  for (const bg of shuffle(BACKGROUNDS)) {
    const list = byTheme.get(bg.theme) ?? []
    list.push(bg)
    byTheme.set(bg.theme, list)
  }
  const lists = shuffle([...byTheme.values()])
  const out: Background[] = []
  while (lists.some((l) => l.length)) {
    for (const l of lists) {
      const next = l.shift()
      if (next) out.push(next)
    }
  }
  return out
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
