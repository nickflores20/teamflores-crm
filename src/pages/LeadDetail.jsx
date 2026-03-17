import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useTasksContext } from '../context/TasksContext.jsx'
import ContactCard from '../components/detail/ContactCard.jsx'
import ActivityTimeline from '../components/detail/ActivityTimeline.jsx'
import FullDetailsPanel from '../components/detail/FullDetailsPanel.jsx'
import { getFullName } from '../api/mockData.js'

// ─── Action plan templates ─────────────────────────────────────────────────
const ACTION_PLANS = {
  Contacted: [
    { title: 'Send intro email',   dueDays: 0 },
    { title: 'Follow up call',     dueDays: 1 },
    { title: 'Send loan estimate', dueDays: 3 },
  ],
  Qualified: [
    { title: 'Schedule consultation', dueDays: 0 },
    { title: 'Collect documents',     dueDays: 2 },
    { title: 'Submit pre-approval',   dueDays: 5 },
  ],
}

function addDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export default function LeadDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { leads, setLeadStatus } = useLeadsContext()
  const { addToast } = useToast()
  const { addTask }  = useTasksContext()

  const lead = leads.find(l => String(l.rowNumber) === String(id))

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
        plan.forEach(({ title, dueDays }) => {
          addTask({
            title: `${title} — ${name}`,
            dueDate: addDays(dueDays),
            priority: 'High',
            linkedLeadId: lead.rowNumber,
          })
        })
        addToast({ type: 'info', message: `${plan.length} tasks created for ${getFullName(lead)}` })
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
