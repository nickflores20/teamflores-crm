import { useMemo, useState, useCallback } from 'react'
import ActivityItem from './ActivityItem.jsx'
import { getFullName } from '../../api/mockData.js'

const VIEWED_KEY = 'tf_inbox_viewed'
const TIME_FILTERS = [
  { id: 'all',   label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This Week' },
]

// ─── Viewed set helpers ────────────────────────────────────────────────────
function loadViewed() {
  try { return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]')) }
  catch { return new Set() }
}
function saveViewed(set) {
  try { localStorage.setItem(VIEWED_KEY, JSON.stringify([...set])) } catch {}
}

// ─── Scan localStorage for recent communication events ──────────────────────
function getRecentCommEvents(types, cutoffMs) {
  const results = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('crm_timeline_')) continue
      try {
        const events = JSON.parse(localStorage.getItem(key) || '[]')
        results.push(
          ...events
            .filter((e) => types.includes(e.type))
            .filter((e) => !cutoffMs || new Date(e.timestamp || 0).getTime() > cutoffMs)
        )
      } catch {}
    }
  } catch {}
  return results
}

// ─── Type display config ───────────────────────────────────────────────────
const COMM_CFG = {
  email_received: { label: 'Email',  color: '#3B82F6', bg: '#EFF6FF' },
  text_received:  { label: 'Text',   color: '#22C55E', bg: '#F0FDF4' },
  appointment:    { label: 'Appt',   color: '#C6A76F', bg: '#FFFDF5' },
}

export default function ActivityFeed({ leads, loading, selectedId, onSelect }) {
  const [filter, setFilter]   = useState('all')
  const [viewed, setViewed]   = useState(loadViewed)

  const now = Date.now()

  const cutoff = useMemo(() => {
    if (filter === 'today') return now - 86_400_000
    if (filter === 'week')  return now - 604_800_000
    return 0
  }, [filter, now])

  const filteredLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b['Date'] || b['Submitted At'] || 0) - new Date(a['Date'] || a['Submitted At'] || 0))
      .filter((l) => {
        if (!cutoff) return true
        return new Date(l['Date'] || l['Submitted At'] || 0).getTime() > cutoff
      })
      .slice(0, 50)
  }, [leads, cutoff])

  const commEvents = useMemo(() => {
    return getRecentCommEvents(['email_received', 'text_received'], cutoff).slice(0, 20)
  }, [cutoff])

  const feedItems = useMemo(() => {
    const leadItems = filteredLeads.map((l) => ({
      _kind: 'lead',
      _time: new Date(l['Date'] || l['Submitted At'] || 0).getTime(),
      lead: l,
    }))
    const commItems = commEvents.map((e) => ({
      _kind: 'comm',
      _time: new Date(e.timestamp || 0).getTime(),
      event: e,
      lead: leads.find((l) => String(l.rowNumber) === String(e.leadRowNumber)) || null,
    }))
    return [...leadItems, ...commItems]
      .sort((a, b) => b._time - a._time)
      .slice(0, 60)
  }, [filteredLeads, commEvents, leads])

  // "New" leads badge
  const recentIds = useMemo(() => {
    const cutoff24 = now - 86_400_000
    return new Set(
      leads
        .filter((l) => new Date(l['Date'] || l['Submitted At'] || 0).getTime() > cutoff24 && l['Status'] === 'New')
        .map((l) => l.rowNumber)
    )
  }, [leads, now])

  // Unread = never viewed in inbox
  const unreadLeadIds = useMemo(() => {
    return new Set(
      filteredLeads
        .filter(l => !viewed.has(String(l.rowNumber)))
        .map(l => l.rowNumber)
    )
  }, [filteredLeads, viewed])

  const unreadCount = unreadLeadIds.size

  const handleSelect = useCallback((lead) => {
    // Mark as viewed
    setViewed(prev => {
      const next = new Set(prev)
      next.add(String(lead.rowNumber))
      saveViewed(next)
      return next
    })
    onSelect(lead)
  }, [onSelect])

  const markAllRead = useCallback(() => {
    setViewed(prev => {
      const next = new Set(prev)
      filteredLeads.forEach(l => next.add(String(l.rowNumber)))
      saveViewed(next)
      return next
    })
  }, [filteredLeads])

  return (
    <div className="flex flex-col h-full bg-white border-r border-surface-border">
      {/* Filters + Mark all read */}
      <div className="px-4 py-3 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {TIME_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  filter === f.id
                    ? 'bg-navy-800 text-white'
                    : 'text-ink-secondary hover:bg-surface-secondary',
                ].join(' ')}
              >
                {f.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-semibold text-ink-muted hover:text-ink transition-colors whitespace-nowrap"
            >
              Mark all read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-surface-border">
              <div className="w-9 h-9 rounded-full bg-surface-tertiary shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-surface-tertiary shimmer rounded w-3/4" />
                <div className="h-2.5 bg-surface-tertiary shimmer rounded w-1/2" />
              </div>
            </div>
          ))
        ) : feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
            <svg className="w-10 h-10 mb-3 text-surface-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
            </svg>
            <p className="text-sm">No activity</p>
          </div>
        ) : (
          feedItems.map((item, idx) => {
            if (item._kind === 'lead') {
              const isUnread = unreadLeadIds.has(item.lead.rowNumber)
              return (
                <ActivityItem
                  key={`lead-${item.lead.rowNumber}`}
                  lead={item.lead}
                  isSelected={item.lead.rowNumber === selectedId}
                  isNew={recentIds.has(item.lead.rowNumber)}
                  isUnread={isUnread}
                  onClick={() => handleSelect(item.lead)}
                />
              )
            }
            // Comm event row
            const { event, lead } = item
            const cfg = COMM_CFG[event.type] || COMM_CFG.email_received
            const name = lead ? getFullName(lead) : `Lead #${event.leadRowNumber}`
            return (
              <button
                key={`comm-${event.id || idx}`}
                onClick={() => lead && handleSelect(lead)}
                className={[
                  'w-full flex items-start gap-3 px-4 py-3 text-left border-b border-surface-border transition-colors hover:bg-sand/20',
                  lead && lead.rowNumber === selectedId ? 'bg-sand/40 border-l-2 border-l-blue-400 pl-[14px]' : '',
                ].join(' ')}
              >
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: cfg.bg, border: `1.5px solid ${cfg.color}30` }}
                >
                  {event.type === 'email_received' ? (
                    <svg className="w-4 h-4" style={{ color: cfg.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" style={{ color: cfg.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{name}</p>
                    <span className="text-[10px] text-ink-muted whitespace-nowrap flex-shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-sm"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                    <p className="text-xs text-ink-muted truncate">
                      {event.subject || event.preview || ''}
                    </p>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="px-4 py-2 border-t border-surface-border bg-surface-secondary flex-shrink-0 flex items-center justify-between">
        <p className="text-xs text-ink-muted">{feedItems.length} items</p>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/20 text-amber-800">
            {unreadCount} unread
          </span>
        )}
      </div>
    </div>
  )
}
