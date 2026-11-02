import type { ComponentType, SVGProps } from 'react'
import { CounterIcon, GearIcon, HomeIcon, SunriseIcon } from './Icons'

interface Tab {
  id: string
  label: string
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', href: '#/', Icon: HomeIcon },
  { id: 'counter', label: 'Counters', href: '#/counter', Icon: CounterIcon },
  { id: 'wakeup', label: 'Wake up', href: '#/wakeup', Icon: SunriseIcon },
  { id: 'settings', label: 'Settings', href: '#/settings', Icon: GearIcon },
]

export function TabBar({ active }: { active: string }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ id, label, href, Icon }) => (
        <a key={id} href={href} className={`tabbar__item${active === id ? ' is-active' : ''}`} aria-current={active === id ? 'page' : undefined}>
          <Icon width={26} height={26} strokeWidth={active === id ? 2.3 : 1.8} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  )
}
