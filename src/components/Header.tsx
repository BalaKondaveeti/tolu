import { useEffect, useState, type ReactNode } from 'react'
import { ChevronLeft } from './Icons'

interface Props {
  title: string
  back?: { label: string; href: string }
  right?: ReactNode
}

export function Header({ title, back, right }: Props) {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${compact ? ' header--compact' : ''}`}>
      <div className="header__bar">
        {back ? (
          <a className="header__back" href={back.href}>
            <ChevronLeft width={22} height={22} />
            <span>{back.label}</span>
          </a>
        ) : (
          <span />
        )}
        <div className="header__right">{right}</div>
      </div>
      <h1 className="header__title">{title}</h1>
    </header>
  )
}
