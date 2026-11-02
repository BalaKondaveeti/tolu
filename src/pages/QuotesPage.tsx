import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { ChevronRight, HeartIcon, PlusIcon } from '../components/Icons'
import { RefreshPill } from '../components/RefreshPill'
import { Segmented } from '../components/Segmented'
import { ConfirmSheet } from '../components/Sheet'
import { StatusNotice } from '../components/StatusNotice'
import { SwipeGroup, SwipeRow } from '../components/SwipeRow'
import { deleteQuote, updateQuote, useQuotes, type Quote } from '../data/quotes'
import { AddQuotesSheet, EditQuoteSheet } from './QuoteSheets'

type Filter = 'all' | 'favorites'
const PAGE = 30

export function QuotesPage() {
  const q = useQuotes()
  const [filter, setFilter] = useState<Filter>('all')
  const [shown, setShown] = useState(PAGE)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Quote | null>(null)
  const [deleting, setDeleting] = useState<Quote | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const all = useMemo(() => q.data ?? [], [q.data])
  const favorites = all.filter((x) => x.favorite).length
  const quotes = useMemo(() => (filter === 'favorites' ? all.filter((x) => x.favorite) : all), [all, filter])
  const visible = quotes.slice(0, shown)

  const run = async (label: string, action: () => Promise<void>) => {
    try {
      await action()
      setActionError(null)
    } catch (err) {
      setActionError(`Couldn't ${label}: ${err instanceof Error ? err.message : err}`)
    }
  }

  return (
    <>
      <Header
        title="Quotes"
        back={{ label: 'Wake up', href: '#/wakeup' }}
        right={<RefreshPill updatedAt={q.updatedAt} loading={q.loading} onRefresh={q.refresh} />}
      />
      <main className="page">
        <StatusNotice error={q.error} hasData={!!q.data} onRetry={q.refresh} />
        {actionError && <div className="notice">{actionError}</div>}

        {q.data && (
          <section className="hero hero--sunrise">
            <p className="hero__label">Your wake-up lines</p>
            <p className="hero__number">{all.length}</p>
            <p className="hero__sub">
              {all.length === 1 ? 'quote' : 'quotes'} · {favorites} {favorites === 1 ? 'favorite' : 'favorites'}
            </p>
          </section>
        )}

        {all.length > 0 && (
          <Segmented
            label="Filter quotes"
            value={filter}
            onChange={(f) => {
              setFilter(f)
              setShown(PAGE)
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'favorites', label: 'Favorites' },
            ]}
          />
        )}

        {q.data && quotes.length === 0 && (
          <div className="empty">
            <p className="empty__title">{filter === 'favorites' ? 'No favorites yet' : 'No quotes yet'}</p>
            <p className="empty__text">
              {filter === 'favorites' ? 'Tap the heart on a quote in Wake up.' : 'Tap + and paste your list, one quote per line.'}
            </p>
          </div>
        )}
        {!q.data && q.loading && <div className="group skeleton" aria-label="Loading" />}

        {visible.length > 0 && (
          <SwipeGroup>
            <div className="group">
              {visible.map((quote) => {
                const open = expanded === quote.id
                return (
                  <SwipeRow
                    key={quote.id}
                    id={quote.id}
                    onTap={() => setExpanded(open ? null : quote.id)}
                    onEdit={() => setEditing(quote)}
                    onDelete={() => setDeleting(quote)}
                    details={
                      open && (
                        <div className="row__details" onPointerDown={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={`btn btn--tinted btn--block${quote.favorite ? ' btn--fav' : ''}`}
                            onClick={() => void run('save', () => updateQuote(quote.id, { favorite: !quote.favorite }))}
                          >
                            <HeartIcon width={18} height={18} filled={quote.favorite} />
                            {quote.favorite ? 'Favorite' : 'Add to favorites'}
                          </button>
                        </div>
                      )
                    }
                  >
                    <div className="row row--quote">
                      <div className="row__main">
                        <p className={`row__quote${open ? ' is-open' : ''}`}>{quote.text}</p>
                      </div>
                      {quote.favorite && <HeartIcon width={16} height={16} filled className="row__heart" />}
                      <ChevronRight width={18} height={18} className={`row__chevron${open ? ' is-open' : ''}`} />
                    </div>
                  </SwipeRow>
                )
              })}
            </div>
          </SwipeGroup>
        )}

        {quotes.length > shown && (
          <button type="button" className="btn btn--tinted btn--block" onClick={() => setShown((n) => n + PAGE)}>
            Show more
          </button>
        )}

        {quotes.length > 0 && <p className="hint">Tap a quote to read it in full. Swipe left to edit or delete.</p>}
      </main>

      <button type="button" className="fab" aria-label="Add quotes" onClick={() => setAdding(true)}>
        <PlusIcon width={28} height={28} strokeWidth={2.6} />
      </button>

      <AddQuotesSheet open={adding} onClose={() => setAdding(false)} startMany={all.length === 0} />
      <EditQuoteSheet quote={editing} onClose={() => setEditing(null)} />
      <ConfirmSheet
        open={!!deleting}
        title="Delete quote?"
        message={deleting ? `"${deleting.text.length > 80 ? deleting.text.slice(0, 80) + '…' : deleting.text}"` : ''}
        confirmLabel="Delete"
        onConfirm={() => {
          const target = deleting
          setDeleting(null)
          if (target) void run('delete', () => deleteQuote(target.id))
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
