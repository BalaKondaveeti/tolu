// Background photos for Wake up, all free under the Unsplash License and
// loaded straight from Unsplash's image CDN. Add or remove entries freely;
// any photo that fails to load is skipped automatically.

export type Theme =
  | 'Nature'
  | 'Boxing'
  | 'Racing'
  | 'Competition'
  | 'Gym'
  | 'Climbing'
  | 'Ocean'
  | 'Night sky'
  | 'City'
  | 'Wildlife'
  | 'Aviation'
  | 'Stadium'

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
  { id: '1517836357463-d25dfeac3438', theme: 'Gym', credit: 'Victor Freitas' },
  { id: '1605296867304-46d5465a13f1', theme: 'Gym', credit: 'Anastase Maragos' },
  { id: '1581009146145-b5ef050c2e1e', theme: 'Gym', credit: 'Anastase Maragos' },
  { id: '1623874514711-0f321325f318', theme: 'Gym', credit: 'Samuel Girven' },
  { id: '1522163182402-834f871fd851', theme: 'Climbing', credit: 'Hu Chen' },
  { id: '1597250861267-429663f244a8', theme: 'Climbing', credit: 'Sylvain Mauroux' },
  { id: '1601224748193-d24f166b5c77', theme: 'Climbing', credit: 'Sean Benesh' },
  { id: '1530870110042-98b2cb110834', theme: 'Ocean', credit: 'Sincerely Media' },
  { id: '1513569143478-b38b2c0ef97f', theme: 'Ocean', credit: 'Ryan Loughlin' },
  { id: '1559627755-42212e5c5fdf', theme: 'Ocean', credit: 'Silas Baisch' },
  { id: '1459745930869-b3d0d72c3cbb', theme: 'Ocean', credit: 'Jeremy Bishop' },
  { id: '1515705576963-95cad62945b6', theme: 'Night sky', credit: 'Dns Dgn' },
  { id: '1519681393784-d120267933ba', theme: 'Night sky', credit: 'Benjamin Voros' },
  { id: '1465101162946-4377e57745c3', theme: 'Night sky', credit: 'Jeremy Thomas' },
  { id: '1501862700950-18382cd41497', theme: 'Night sky', credit: 'John Fowler' },
  { id: '1531819177115-428566ccfb50', theme: 'City', credit: 'Izuddin Helmi Adnan' },
  { id: '1500632907344-a073709b2448', theme: 'City', credit: 'Kai Pilger' },
  { id: '1513563326940-e76e4641069e', theme: 'City', credit: 'Jehyun Sung' },
  { id: '1605702012553-e954fbde66eb', theme: 'City', credit: 'dominik hofbauer' },
  { id: '1546182990-dffeafbe841d', theme: 'Wildlife', credit: 'Francesco' },
  { id: '1614027164847-1b28cfe1df60', theme: 'Wildlife', credit: 'Mariola Grobelska' },
  { id: '1552410260-0fd9b577afa6', theme: 'Wildlife', credit: 'Mika Brandt' },
  { id: '1511216113906-8f57bb83e776', theme: 'Wildlife', credit: 'Luke Tanis' },
  { id: '1583133269464-b721db5345f4', theme: 'Aviation', credit: 'Leo_Visions' },
  { id: '1551796880-ddd03f861ae7', theme: 'Aviation', credit: 'Terence Burke' },
  { id: '1519073147904-23e655032ea3', theme: 'Aviation', credit: 'Don Jackson-Wyatt' },
  { id: '1614121174144-bd53a169780e', theme: 'Aviation', credit: 'NASA' },
  { id: '1762013315117-1c8005ad2b41', theme: 'Stadium', credit: 'Eduard Delputte' },
  { id: '1489944440615-453fc2b6a9a9', theme: 'Stadium', credit: 'Mario Klassen' },
  { id: '1434648957308-5e6a859697e8', theme: 'Stadium', credit: 'Fancy Crave' },
  { id: '1522778119026-d647f0596c20', theme: 'Stadium', credit: 'Vienna Reyes' },
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
