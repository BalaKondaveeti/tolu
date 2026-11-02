import { useMemo, useState } from 'react'
import { Header } from '../components/Header'
import { ChevronRight, MinusIcon, PlusIcon } from '../components/Icons'
import { RefreshPill } from '../components/RefreshPill'
import { Segmented } from '../components/Segmented'
import { ConfirmSheet, Sheet } from '../components/Sheet'
import { StatusNotice } from '../components/StatusNotice'
import { SwipeGroup, SwipeRow } from '../components/SwipeRow'
import { createCounter, deleteCounter, updateCounter, type Counter } from '../data/counters'
import { bump, usePending } from '../data/useBump'
import { useCounters } from '../data/useCounters'
import { navigate } from '../lib/useHashRoute'
import { ago } from '../lib/time'
import { colorVar, PALETTE_SIZE } from '../tools'
import { CounterForm } from './CounterForm'

type Sort = 'recent' | 'name' | 'value'
const PAGE = 20

export function CountersPage() {
  const q = useCounters()
  const pending = usePending()
  const [sort, setSort] = useState<Sort>('recent')
  const [shown, setShown] = useState(PAGE)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Counter | null>(null)
  const [deleting, setDeleting] = useState<Counter | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const counters = useMemo(() => {
    const list = [...(q.data ?? [])]
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'value') list.sort((a, b) => b.value - a.value)
    return list
  }, [q.data, sort])

  const total = counters.reduce((sum, c) => sum + pending.valueOf(c), 0)
  const visible = counters.slice(0, shown)

  const confirmDelete = async () => {
    const target = deleting
    setDeleting(null)
    if (!target) return
    try {
      await deleteCounter(target.id)
      setActionError(null)
    } catch (err) {
      setActionError(`Couldn't delete: ${err instanceof Error ? err.message : err}`)
    }
  }

  return (
    <>
      <Header
        title="Counters"
        back={{ label: 'Tools', href: '#/' }}
        right={<RefreshPill updatedAt={q.updatedAt} loading={q.loading} onRefresh={q.refresh} />}
      />
      <main className="page">
        <StatusNotice error={q.error} hasData={!!q.data} onRetry={q.refresh} />
        {(actionError || pending.error) && <div className="notice">{actionError ?? pending.error}</div>}

        {q.data && (
          <section className="hero">
            <p className="hero__label">Total across counters</p>
            <p className="hero__number">{total.toLocaleString()}</p>
            <p className="hero__sub">
              {counters.length} {counters.length === 1 ? 'counter' : 'counters'}
            </p>
          </section>
        )}

        {counters.length > 1 && (
          <Segmented
            label="Sort counters"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'recent', label: 'Recent' },
              { value: 'name', label: 'Name' },
              { value: 'value', label: 'Value' },
            ]}
          />
        )}

        {q.data && counters.length === 0 && (
          <div className="empty">
            <p className="empty__title">No counters yet</p>
            <p className="empty__text">Tap + to make your first one.</p>
          </div>
        )}
        {!q.data && q.loading && <div className="group skeleton" aria-label="Loading" />}

        {visible.length > 0 && (
          <SwipeGroup>
            <div className="group">
              {visible.map((c) => {
                const open = expanded === c.id
                return (
                  <SwipeRow
                    key={c.id}
                    id={c.id}
                    onTap={() => setExpanded(open ? null : c.id)}
                    onEdit={() => setEditing(c)}
                    onDelete={() => setDeleting(c)}
                    details={
                      open && (
                        <div className="row__details" onPointerDown={(e) => e.stopPropagation()}>
                          {c.note.trim() && <p className="row__note">{c.note}</p>}
                          <div className="row__controls">
                            <button type="button" className="btn btn--round btn--tinted" aria-label={`Minus one on ${c.name}`} onClick={() => bump(c.id, -1)}>
                              <MinusIcon width={22} height={22} />
                            </button>
                            <span className="row__big" style={{ color: colorVar(c.color) }}>
                              {pending.valueOf(c).toLocaleString()}
                            </span>
                            <button type="button" className="btn btn--round btn--filled" aria-label={`Plus one on ${c.name}`} onClick={() => bump(c.id, 1)}>
                              <PlusIcon width={22} height={22} />
                            </button>
                          </div>
                          <button type="button" className="btn btn--tinted btn--block" onClick={() => navigate(`/counter/${c.id}`)}>
                            Open counter
                          </button>
                        </div>
                      )
                    }
                  >
                    <div className="row">
                      <span className="row__dot" style={{ background: colorVar(c.color) }} />
                      <div className="row__main">
                        <p className="row__title">{c.name}</p>
                        <p className="row__sub">{c.note.trim() ? c.note.trim().split('\n')[0] : `Updated ${ago(c.updated_at)}`}</p>
                      </div>
                      <span className="row__value">{pending.valueOf(c).toLocaleString()}</span>
                      <ChevronRight width={18} height={18} className={`row__chevron${open ? ' is-open' : ''}`} />
                    </div>
                  </SwipeRow>
                )
              })}
            </div>
          </SwipeGroup>
        )}

        {counters.length > shown && (
          <button type="button" className="btn btn--tinted btn--block" onClick={() => setShown((n) => n + PAGE)}>
            Show more
          </button>
        )}

        {counters.length > 0 && <p className="hint">Tap a counter for quick controls. Swipe left to edit or delete.</p>}
      </main>

      <button type="button" className="fab" aria-label="New counter" onClick={() => setAdding(true)}>
        <PlusIcon width={28} height={28} strokeWidth={2.6} />
      </button>

      <Sheet open={adding} onClose={() => setAdding(false)} title="New counter">
        {adding && (
          <CounterForm
            initial={{ name: '', value: 0, color: counters.length % PALETTE_SIZE }}
            submitLabel="Add counter"
            onSubmit={async (v) => {
              const created = await createCounter(v)
              setAdding(false)
              setExpanded(created.id)
            }}
          />
        )}
      </Sheet>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Edit counter">
        {editing && (
          <CounterForm
            initial={{ name: editing.name, value: pending.valueOf(editing), color: editing.color }}
            submitLabel="Save"
            onSubmit={async (v) => {
              await updateCounter(editing.id, v)
              setEditing(null)
            }}
          />
        )}
      </Sheet>

      <ConfirmSheet
        open={!!deleting}
        title="Delete counter?"
        message={deleting ? `"${deleting.name}" and its note will be deleted on all your devices.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
