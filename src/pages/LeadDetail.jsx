import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useTasksContext } from '../context/TasksContext.jsx'
import { useTimeline } from '../hooks/useTimeline.js'
import ContactCard from '../components/detail/ContactCard.jsx'
import ActivityTimeline from '../components/detail/ActivityTimeline.jsx'
import FullDetailsPanel from '../components/detail/FullDetailsPanel.jsx'
import StatusSelect from '../components/leads/StatusSelect.jsx'
import { getFullName } from '../api/mockData.js'

// ─── Action plan templates ─────────────────────────────────────────────────
const ACTION_PLANS = {
  Contacted: [
    { title: 'Send intro email',   dueDays: 0, priority: 'High'   },
    { title: 'Follow up call',     dueDays: 1, priority: 'High'   },
    { title: 'Send loan estimate', dueDays: 3, priority: 'Medium' },
  ],
  Qualified: [
    { title: 'Schedule consultation', dueDays: 0, priority: 'High'   },
    { title: 'Request documents',     dueDays: 2, priority: 'High'   },
    { title: 'Submit pre-approval',   dueDays: 5, priority: 'Medium' },
  ],
  Closed: [
    { title: 'Send thank you note', dueDays: 0,  priority: 'Medium' },
    { title: 'Request referral',    dueDays: 30, priority: 'Low'    },
  ],
}

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// ─── AI Smart Summary Banner ───────────────────────────────────────────────
const CACHE_KEY  = (rowNumber) => `tf_ai_summary_${rowNumber}`
const RATE_KEY   = (rowNumber) => `tf_summary_time_${rowNumber}`
const RATE_LIMIT_MS = 10 * 60 * 1000 // 10 minutes

function AISummaryBanner({ lead }) {
  const [cached] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY(lead.rowNumber)) || 'null') } catch { return null }
  })
  const [summary,    setSummary]    = useState(cached)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [showBanner, setShowBanner] = useState(!!cached)
  const [, forceUpdate] = useState(0)

  const getRateLimitRemaining = () => {
    try {
      const last = parseInt(localStorage.getItem(RATE_KEY(lead.rowNumber)) || '0', 10)
      const elapsed = Date.now() - last
      if (elapsed < RATE_LIMIT_MS) return Math.ceil((RATE_LIMIT_MS - elapsed) / 60000)
    } catch { /* ignore */ }
    return 0
  }

  const generate = async () => {
    const remaining = getRateLimitRemaining()
    if (remaining > 0) return

    setLoading(true)
    setError(null)
    try {
      const events = JSON.parse(localStorage.getItem(`crm_timeline_${lead.rowNumber}`) || '[]')
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadData: lead, timelineEvents: events }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed: ' + res.status)
      const result = { text: data.summary, generatedAt: new Date().toISOString() }
      setSummary(result)
      setShowBanner(true)
      localStorage.setItem(CACHE_KEY(lead.rowNumber), JSON.stringify(result))
      localStorage.setItem(RATE_KEY(lead.rowNumber), String(Date.now()))
      forceUpdate(n => n + 1)
    } catch (e) {
      setError(e.message || 'Failed to generate summary.')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    setShowBanner(true)
    generate()
  }

  const handleRefresh = () => {
    generate()
    forceUpdate(n => n + 1)
  }

  const timeAgo = (iso) => {
    if (!iso) return ''
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const rateLimitMins = getRateLimitRemaining()

  return (
    <div className="px-4 lg:px-6 py-2 flex-shrink-0">
      {/* Trigger button */}
      {!showBanner && (
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors"
          style={{ borderColor: '#C6A76F', color: '#92400E', backgroundColor: '#FFFDF5' }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          AI Smart Summary
        </button>
      )}

      {/* Summary banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: '#C6A76F', backgroundColor: '#FFFDF5' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#C6A76F30' }}>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#C6A76F" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#92400E' }}>AI Smart Summary</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ backgroundColor: '#C6A76F20', color: '#C6A76F' }}>AI Generated</span>
                {summary?.generatedAt && (
                  <span className="text-[10px] text-ink-muted">{timeAgo(summary.generatedAt)}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleRefresh}
                  disabled={loading || rateLimitMins > 0}
                  className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={rateLimitMins > 0 ? `Refresh available in ${rateLimitMins}m` : 'Regenerate'}
                >
                  <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="#C6A76F" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  {rateLimitMins > 0 && (
                    <span className="text-[10px]" style={{ color: '#C6A76F' }}>in {rateLimitMins}m</span>
                  )}
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 rounded-md transition-colors hover:bg-amber-100"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="#C6A76F" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
              {loading ? (
                <div className="flex items-center gap-2 py-1">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="#C6A76F" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span className="text-xs text-ink-secondary">Generating summary…</span>
                </div>
              ) : error ? (
                <p className="text-xs text-red-600">{error}</p>
              ) : summary ? (
                <p className="text-sm text-ink leading-relaxed">{summary.text}</p>
              ) : (
                <button
                  onClick={handleClick}
                  className="text-xs font-semibold"
                  style={{ color: '#C6A76F' }}
                >
                  Click to generate summary →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LeadDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { leads, setLeadStatus } = useLeadsContext()
  const { addToast } = useToast()
  const { addTask }  = useTasksContext()

  const lead = leads.find(l => String(l.rowNumber) === String(id))

  // Always call hooks before conditional return
  const { addEvent } = useTimeline(lead?.rowNumber ?? 'none')

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-muted text-sm flex-col gap-3">
        <p>Lead not found.</p>
        <button onClick={() => navigate('/people')} className="text-gold hover:underline">
          Back to People
        </button>
      </div>
    )
  }

  const handleStatusChange = async (status) => {
    try {
      await setLeadStatus(lead.rowNumber, status)
      addToast({ type: 'success', message: `Status → ${status}` })

      // Auto-create action plan tasks
      const plan = ACTION_PLANS[status]
      if (plan) {
        const name = getFullName(lead)
        plan.forEach(({ title, dueDays, priority }) => {
          addTask({
            title: `${title} — ${name}`,
            dueDate: addDays(dueDays),
            priority,
            linkedLeadId: lead.rowNumber,
          })
        })
        // Add timeline event
        addEvent({
          type: 'note',
          body: `Action Plan started — ${plan.length} task${plan.length !== 1 ? 's' : ''} created`,
        })
        addToast({ type: 'info', message: `Action Plan started — ${plan.length} tasks created for ${getFullName(lead)}` })
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to update' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full bg-surface-secondary"
    >
      {/* Breadcrumb / back button */}
      <div className="px-4 lg:px-6 py-2 border-b border-surface-border bg-white flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-ink-secondary hover:text-ink transition-colors text-sm font-medium"
          style={{ minHeight: '44px', paddingRight: '8px' }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          People
        </button>
        <svg className="w-3 h-3 text-ink-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-sm text-ink font-medium truncate">{getFullName(lead)}</span>
      </div>

      {/* ── FUB-style Lead Header ────────────────────────────────────────── */}
      <div className="px-4 lg:px-6 py-3 bg-white border-b border-surface-border flex-shrink-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Name + badges */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h1 className="text-xl font-serif font-bold truncate" style={{ color: '#1A3E61' }}>
              {getFullName(lead)}
            </h1>
            {/* Stage dropdown */}
            <div className="relative" onPointerDown={e => e.stopPropagation()}>
              <StatusSelect status={lead['Status']} onChange={handleStatusChange} />
            </div>
            {lead['How Found'] && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-flex"
                style={{ color: '#1A3E61', borderColor: '#B0C4D8', backgroundColor: '#EEF3F8' }}>
                {lead['How Found']}
              </span>
            )}
            {lead['State'] && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex"
                style={{ backgroundColor: '#F0E6D2', color: '#8A6A2A', border: '1px solid #E8D5A3' }}>
                {lead['State']}
              </span>
            )}
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { addToast({ type: 'info', message: 'Use the Text tab below to compose a text' }) }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-green-50 hover:border-green-300 hover:text-green-700"
              style={{ borderColor: '#E2E8F0', color: '#475569', backgroundColor: 'white' }}
            >📱 Text</button>
            <button
              onClick={() => { addToast({ type: 'info', message: 'Use the Email tab below to compose an email' }) }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              style={{ borderColor: '#E2E8F0', color: '#475569', backgroundColor: 'white' }}
            >✉️ Email</button>
            <button
              onClick={() => {
                addEvent({ type: 'call', body: 'Call logged from header action', to: lead['Phone'], outcome: 'Spoke with Lead', duration: null })
                addToast({ type: 'success', message: `Call logged for ${getFullName(lead)}` })
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
              style={{ borderColor: '#E2E8F0', color: '#475569', backgroundColor: 'white' }}
            >📞 Call</button>
            <button
              onClick={() => { addToast({ type: 'info', message: 'Use the Note tab below to add a note' }) }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-slate-50"
              style={{ borderColor: '#E2E8F0', color: '#475569', backgroundColor: 'white' }}
            >📝 Note</button>
            <button
              onClick={() => {
                addTask({ title: `Follow up — ${getFullName(lead)}`, dueDate: new Date().toISOString().slice(0,10), priority: 'Medium', linkedLeadId: lead.rowNumber })
                addToast({ type: 'success', message: 'Task created' })
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-slate-50"
              style={{ borderColor: '#E2E8F0', color: '#475569', backgroundColor: 'white' }}
            >✅ Task</button>
            <button
              onClick={() => {
                const url = `https://sunnyhillfinancial.pos.yoursonar.com/?name=${encodeURIComponent(getFullName(lead))}&phone=${encodeURIComponent(lead['Phone'] || '')}&email=${encodeURIComponent(lead['Email'] || '')}`
                navigator.clipboard.writeText(url).catch(() => {})
                addToast({ type: 'success', message: '🔗 Pre-Approval link copied to clipboard!' })
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C6A76F' }}
            >🔗 Pre-Approval Link</button>
          </div>
        </div>
      </div>

      {/* AI Smart Summary */}
      <div className="flex-shrink-0 bg-white border-b border-surface-border py-2">
        <AISummaryBanner lead={lead} />
      </div>

      {/* ── MOBILE layout (<md): single scrollable column ─────────────── */}
      <div className="flex-1 overflow-y-auto md:hidden overscroll-y-contain">
        {/* 1. Contact card */}
        <div className="p-4 pb-2">
          <ContactCard lead={lead} onStatusChange={handleStatusChange} />
        </div>

        {/* 2. Composer + Timeline */}
        <div className="bg-white border-t border-b border-surface-border">
          <ActivityTimeline lead={lead} mobile />
        </div>

        {/* 3. Full details */}
        <div className="border-t border-surface-border pb-6">
          <FullDetailsPanel lead={lead} />
        </div>
      </div>

      {/* ── DESKTOP layout (md+): 3-column flex ───────────────────────── */}
      <div className="flex-1 overflow-hidden hidden md:flex">
        {/* Left — Contact card */}
        <div className="w-72 overflow-y-auto flex-shrink-0 p-4">
          <ContactCard lead={lead} onStatusChange={handleStatusChange} />
        </div>

        {/* Middle — Activity timeline */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0 bg-white border-l border-r border-surface-border">
          <ActivityTimeline lead={lead} />
        </div>

        {/* Right — Full details */}
        <div className="w-80 overflow-y-auto flex-shrink-0 hidden lg:block">
          <FullDetailsPanel lead={lead} />
        </div>
      </div>
    </motion.div>
  )
}
