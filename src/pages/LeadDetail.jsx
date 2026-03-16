import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import ContactCard from '../components/detail/ContactCard.jsx'
import ActivityTimeline from '../components/detail/ActivityTimeline.jsx'
import FullDetailsPanel from '../components/detail/FullDetailsPanel.jsx'
import { getFullName } from '../api/mockData.js'

export default function LeadDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { leads, setLeadStatus } = useLeadsContext()
  const { addToast } = useToast()

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
      {/* Breadcrumb */}
      <div className="px-4 lg:px-6 py-3 border-b border-surface-border bg-white flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-ink-secondary hover:text-ink transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          People
        </button>
        <svg className="w-3 h-3 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-sm text-ink font-medium">{getFullName(lead)}</span>
      </div>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Contact card */}
        <div className="w-72 overflow-y-auto flex-shrink-0 hidden md:block p-4">
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

      {/* Mobile: Contact card below */}
      <div className="md:hidden border-t border-surface-border bg-white p-4">
        <ContactCard lead={lead} onStatusChange={handleStatusChange} />
      </div>
    </motion.div>
  )
}
