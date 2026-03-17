import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatDistanceToNow, formatDate, formatDateTime } from '../../lib/dateUtils.js'

// ─── Per-type visual config ────────────────────────────────────────────────
const TYPE_CFG = {
  lead_submitted: {
    label: 'Lead Submitted',
    border: '#C6A76F',
    iconBg: '#C6A76F',
    labelColor: '#92740A',
    cardBg: '#FFFDF5',
  },
  email_sent: {
    label: 'Email Sent',
    border: '#3B82F6',
    iconBg: '#3B82F6',
    labelColor: '#1D4ED8',
    cardBg: '#EFF6FF',
  },
  email_received: {
    label: 'Email Received',
    border: '#94A3B8',
    iconBg: '#64748B',
    labelColor: '#475569',
    cardBg: '#F8FAFC',
  },
  text_sent: {
    label: 'Text Sent',
    border: '#22C55E',
    iconBg: '#22C55E',
    labelColor: '#15803D',
    cardBg: '#F0FDF4',
  },
  text_received: {
    label: 'Text Received',
    border: '#94A3B8',
    iconBg: '#64748B',
    labelColor: '#475569',
    cardBg: '#F8FAFC',
  },
  call: {
    label: 'Call Logged',
    border: '#A855F7',
    iconBg: '#A855F7',
    labelColor: '#7E22CE',
    cardBg: '#FAF5FF',
  },
  note: {
    label: 'Note',
    border: '#1A3E61',
    iconBg: '#1A3E61',
    labelColor: '#1A3E61',
    cardBg: '#F8FAFC',
  },
  status_change: {
    label: 'Status Changed',
    border: '#60A5FA',
    iconBg: '#60A5FA',
    labelColor: '#2563EB',
    cardBg: '#EFF6FF',
  },
  appointment: {
    label: 'Appointment',
    border: '#C6A76F',
    iconBg: '#C6A76F',
    labelColor: '#92740A',
    cardBg: '#FFFDF5',
  },
  task_completed: {
    label: 'Task Completed',
    border: '#C6A76F',
    iconBg: '#C6A76F',
    labelColor: '#92740A',
    cardBg: '#FFFDF5',
  },
}

// ─── Icons ─────────────────────────────────────────────────────────────────
function EventIcon({ type }) {
  const cls = 'w-3.5 h-3.5 text-white'
  switch (type) {
    case 'lead_submitted':
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    case 'email_sent':
    case 'email_received':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      )
    case 'text_sent':
    case 'text_received':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'call':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      )
    case 'note':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      )
    case 'status_change':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      )
    case 'appointment':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
      )
    case 'task_completed':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      )
  }
}

// ─── Call outcome badge styles ─────────────────────────────────────────────
const CALL_OUTCOME_STYLES = {
  'Spoke with Lead': 'bg-green-100 text-green-700 border border-green-200',
  'Left Voicemail':  'bg-amber-100 text-amber-700 border border-amber-200',
  'No Answer':       'bg-slate-100 text-slate-600 border border-slate-200',
  'Wrong Number':    'bg-red-100 text-red-700 border border-red-200',
}

// ─── Derive headline text from event ──────────────────────────────────────
function getHeadline(event) {
  switch (event.type) {
    case 'lead_submitted':
      return `Lead submitted via ${event.source || 'website'}`
    case 'email_sent':
    case 'email_received':
      return event.subject || '(No subject)'
    case 'text_sent':
    case 'text_received':
      return String(event.body || '').slice(0, 60) || 'Text message'
    case 'call': {
      const parts = []
      if (event.duration) parts.push(`${event.duration} min call`)
      else parts.push('Call logged')
      return parts.join(' · ')
    }
    case 'appointment': {
      const parts = [
        event.appointmentType,
        event.appointmentDate ? formatDate(event.appointmentDate) : null,
      ].filter(Boolean)
      return parts.join(' · ') || 'Appointment'
    }
    case 'status_change':
      return event.body || 'Status changed'
    case 'task_completed':
      return String(event.body || '').slice(0, 80) || 'Task completed'
    default:
      return String(event.body || event.preview || '').slice(0, 80) || 'Note'
  }
}

// ─── Derive sub-info line from event ──────────────────────────────────────
function getSubInfo(event) {
  switch (event.type) {
    case 'email_sent':    return event.to   ? `To: ${event.to}`   : ''
    case 'email_received':return event.from ? `From: ${event.from}` : ''
    case 'text_sent':     return event.to   ? `To: ${event.to}`   : ''
    case 'text_received': return event.from ? `From: ${event.from}` : ''
    case 'call':          return event.to   ? `Called: ${event.to}` : ''
    case 'status_change': return event.createdBy ? `by ${event.createdBy}` : ''
    case 'appointment':   return event.body ? String(event.body).slice(0, 60) : ''
    default:              return event.createdBy && event.type !== 'lead_submitted' ? `by ${event.createdBy}` : ''
  }
}

// ─── Main component ────────────────────────────────────────────────────────
export default function TimelineEvent({ event, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [editText, setEditText] = useState(event.body || '')

  const cfg    = TYPE_CFG[event.type] || TYPE_CFG.note
  const isNote = event.type === 'note'
  const body   = event.body || ''
  const isText = event.type === 'text_sent' || event.type === 'text_received'
  const isSentText = event.type === 'text_sent'

  // Text messages always show body (as bubble), no toggle needed
  const hasExpandableBody =
    body.length > 0 &&
    event.type !== 'status_change' &&
    event.type !== 'task_completed'

  const needsToggle =
    !isText &&
    hasExpandableBody &&
    (body.length > 100 ||
      event.type === 'lead_submitted' ||
      event.type === 'email_sent' ||
      event.type === 'email_received' ||
      event.type === 'call' ||
      event.type === 'appointment')

  const handleSaveEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(event.id, { body: editText.trim() })
      setEditing(false)
    }
  }

  return (
    <div className="flex gap-3 group">
      {/* ── Timeline connector ────────────────────────────────────────── */}
      <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: cfg.iconBg }}
        >
          <EventIcon type={event.type} />
        </div>
        <div
          className="flex-1 w-px mt-1.5"
          style={{ backgroundColor: '#E2E8F0', minHeight: '12px' }}
        />
      </div>

      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 pb-4">
        <div
          className="rounded-lg border border-slate-200 overflow-hidden"
          style={{
            borderLeftWidth: '3px',
            borderLeftColor: cfg.border,
            backgroundColor: cfg.cardBg,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          {/* Card header — always visible */}
          <div className="px-3 py-2.5">
            {/* Type label + timestamp row */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: cfg.labelColor }}
              >
                {cfg.label}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <time
                  className="text-[10px] text-slate-400"
                  title={formatDateTime(event.timestamp)}
                  style={{ wordBreak: 'break-all' }}
                >
                  {formatDateTime(event.timestamp)}
                </time>
                {needsToggle && (
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                    style={{ minWidth: '20px', minHeight: '20px' }}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Headline */}
            <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug truncate">
              {getHeadline(event)}
            </p>

            {/* Sub-info */}
            {getSubInfo(event) && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{getSubInfo(event)}</p>
            )}

            {/* Call: outcome badge + duration inline */}
            {event.type === 'call' && (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {event.outcome && (
                  <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${CALL_OUTCOME_STYLES[event.outcome] || CALL_OUTCOME_STYLES['No Answer']}`}>
                    {event.outcome}
                  </span>
                )}
                {event.duration && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    {event.duration} min
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Text message: chat bubble (always shown, no toggle) ─────── */}
          {isText && body && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-200/60">
              <div className={`flex ${isSentText ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="text-sm leading-relaxed px-3.5 py-2"
                  style={{
                    maxWidth: '85%',
                    backgroundColor: isSentText ? '#C6A76F' : '#E2E8F0',
                    color: isSentText ? 'white' : '#1E293B',
                    borderRadius: isSentText
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    wordBreak: 'break-word',
                  }}
                >
                  {body}
                </div>
              </div>
              <p className={`text-[10px] text-slate-400 mt-1 ${isSentText ? 'text-right' : 'text-left'}`}>
                {isSentText
                  ? (event.from ? `From: ${event.from}` : '')
                  : (event.from ? event.from : '')}
              </p>
            </div>
          )}

          {/* Expandable / always-shown body (non-text types) */}
          {!isText && (
            <AnimatePresence initial={false}>
              {(needsToggle ? expanded : hasExpandableBody) && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-2.5 border-t border-slate-200/60">
                    {editing ? (
                      /* ── Inline edit ─────────────────────────────── */
                      <div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-md px-2.5 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-colors"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-xs px-3 py-1.5 rounded-md font-semibold text-white transition-opacity"
                            style={{ backgroundColor: '#C6A76F' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditing(false); setEditText(event.body || '') }}
                            className="text-xs px-3 py-1.5 rounded-md font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Read-only body ───────────────────────────── */
                      <>
                        {event.type === 'lead_submitted' ? (
                          <div className="space-y-1">
                            {body.split('\n').filter(Boolean).map((line, i) => {
                              const colon = line.indexOf(': ')
                              if (colon === -1) return (
                                <p key={i} className="text-xs text-slate-600">{line}</p>
                              )
                              return (
                                <div key={i} className="flex gap-2 text-xs py-0.5 flex-wrap sm:flex-nowrap">
                                  <span className="text-slate-400 min-w-[100px] sm:min-w-[120px] flex-shrink-0 font-medium">
                                    {line.slice(0, colon)}
                                  </span>
                                  <span className="text-slate-700">{line.slice(colon + 2)}</span>
                                </div>
                              )
                            })}
                          </div>
                        ) : (event.type === 'email_sent' || event.type === 'email_received') ? (
                          /* Email body: scrollable with max height */
                          <div className="max-h-48 overflow-y-auto">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{body}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{body}</p>
                        )}

                        {/* Call notes (below outcome badge, already in header) */}
                        {event.type === 'call' && body && (
                          <p className="text-sm text-slate-700 leading-relaxed mt-2 pt-2 border-t border-slate-100">{body}</p>
                        )}

                        {/* Actions row */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {(event.type === 'email_sent' || event.type === 'email_received') && (
                            <a
                              href={`mailto:${event.type === 'email_received' ? event.from : (event.to || '')}?subject=${encodeURIComponent(`Re: ${event.subject || ''}`)}`}
                              className="flex items-center justify-center gap-1.5 text-xs px-2.5 py-2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold hover:bg-blue-100 transition-colors w-full sm:w-auto"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                              </svg>
                              Reply
                            </a>
                          )}
                          {isNote && (
                            <>
                              <button
                                onClick={() => setEditing(true)}
                                className="text-xs px-2.5 py-2 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                                style={{ minHeight: '36px', minWidth: '44px' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onDelete && onDelete(event.id)}
                                className="text-xs px-2.5 py-2 rounded-md bg-red-50 border border-red-200 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                                style={{ minHeight: '36px', minWidth: '44px' }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
