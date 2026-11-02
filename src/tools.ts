import type { ComponentType, SVGProps } from 'react'
import { CounterIcon, SunriseIcon } from './components/Icons'

export interface Tool {
  id: string
  name: string
  blurb: string
  href: string
  color: number // index into the categorical palette
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

// Add new tools here; the home screen grid is built from this list.
export const TOOLS: Tool[] = [
  {
    id: 'counter',
    name: 'Counter',
    blurb: 'Tap +1 / −1, with a note on top',
    href: '#/counter',
    color: 0,
    Icon: CounterIcon,
  },
  {
    id: 'wakeup',
    name: 'Wake up',
    blurb: 'Your motivational lines on big photos',
    href: '#/wakeup',
    color: 1,
    Icon: SunriseIcon,
  },
]

export const PALETTE_SIZE = 8
export const colorVar = (index: number) => `var(--cat-${(((index % PALETTE_SIZE) + PALETTE_SIZE) % PALETTE_SIZE) + 1})`
