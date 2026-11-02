import { Header } from '../components/Header'
import { ChevronRight, PlusIcon, SparkIcon } from '../components/Icons'
import { RefreshPill } from '../components/RefreshPill'
import { StatusNotice } from '../components/StatusNotice'
import { bump, usePending } from '../data/useBump'
import { useCounters } from '../data/useCounters'
import { useQuotes } from '../data/quotes'
import { navigate } from '../lib/useHashRoute'
import { colorVar, TOOLS } from '../tools'

export function Home() {
  const q = useCounters()
  const pending = usePending()
  const latest = q.data?.[0]
  const count = q.data?.length ?? 0
  const quotes = useQuotes()
  const quoteCount = quotes.data?.length ?? 0

  const subtitle = (id: string) => {
    if (id === 'counter') return q.data ? `${count} ${count === 1 ? 'counter' : 'counters'}` : ''
    if (id === 'wakeup') return quotes.data ? `${quoteCount} ${quoteCount === 1 ? 'quote' : 'quotes'}` : ''
    return ''
  }

  return (
    <>
      <Header title="Tools" right={<RefreshPill updatedAt={q.updatedAt} loading={q.loading} onRefresh={q.refresh} />} />
      <main className="page">
        <StatusNotice error={q.error} hasData={!!q.data} onRetry={q.refresh} />

        {latest ? (
          <section className="hero hero--tap" onClick={() => navigate(`/counter/${latest.id}`)}>
            <p className="hero__label">Last used · {latest.name}</p>
            <p className="hero__number">{pending.valueOf(latest).toLocaleString()}</p>
            <div className="hero__row">
              <span className="hero__sub">Tap to open</span>
              <button
                type="button"
                className="hero__chip"
                aria-label={`Plus one on ${latest.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  bump(latest.id, 1)
                }}
              >
                <PlusIcon width={18} height={18} strokeWidth={2.6} />1
              </button>
            </div>
          </section>
        ) : (
          <section className="hero">
            <p className="hero__label">tolu</p>
            <p className="hero__number">{TOOLS.length}</p>
            <p className="hero__sub">{TOOLS.length === 1 ? 'tool ready' : 'tools ready'}</p>
          </section>
        )}

        <p className="section-label">All tools</p>
        <div className="tool-grid">
          {TOOLS.map((t) => (
            <a key={t.id} className="tool" href={t.href}>
              <span className="tool__icon" style={{ background: colorVar(t.color) }}>
                <t.Icon width={26} height={26} />
              </span>
              <span className="tool__name">{t.name}</span>
              <span className="tool__blurb">{t.blurb}</span>
              {subtitle(t.id) && <span className="tool__meta">{subtitle(t.id)}</span>}
              <ChevronRight className="tool__chevron" width={18} height={18} />
            </a>
          ))}
          <div className="tool tool--soon" aria-label="More tools coming soon">
            <span className="tool__icon tool__icon--soon">
              <SparkIcon width={24} height={24} />
            </span>
            <span className="tool__name">More soon</span>
            <span className="tool__blurb">New tools show up here</span>
          </div>
        </div>
      </main>
    </>
  )
}
