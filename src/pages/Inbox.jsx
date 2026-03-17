import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import InboxStats from '../components/inbox/InboxStats.jsx'
import ActivityFeed from '../components/inbox/ActivityFeed.jsx'
import LeadDetailPanel from '../components/inbox/LeadDetailPanel.jsx'

const VIEWED_KEY = 'tf_inbox_viewed'

function getViewedSet() {
  try { return new Set(JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]')) }
  catch { return new Set() }
}

export default function Inbox() {
  const { leads, loading } = useLeadsContext()
  const [selectedId,   setSelectedId]   = useState(null)
  const [viewedSignal, setViewedSignal] = useState(0) // bump to re-read viewed set

  const selectedLead = selectedId != null ? leads.find(l => l.rowNumber === selectedId) || null : null

  // Compute unread count for the header
  const unreadCount = useMemo(() => {
    const viewed = getViewedSet()
    return leads.filter(l => !viewed.has(String(l.rowNumber))).length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, viewedSignal])

  const handleSelect = (lead) => {
    setSelectedId(prev => prev === lead.rowNumber ? null : lead.rowNumber)
    setViewedSignal(s => s + 1) // trigger unread recount after marking viewed
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full overflow-hidden bg-white"
    >
      {/* Header with unread badge */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2 border-b border-surface-border bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-serif font-semibold text-ink">Inbox</h1>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <InboxStats leads={leads} />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Feed */}
        <div className={`flex-shrink-0 overflow-hidden flex flex-col ${selectedLead ? 'w-full sm:w-80 lg:w-96' : 'w-full sm:w-80 lg:w-96'}`}>
          <ActivityFeed
            leads={leads}
            loading={loading}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {/* Lead Detail — hidden on mobile until a lead is selected */}
        <div className={`flex-1 overflow-hidden ${selectedLead ? 'flex' : 'hidden sm:flex'} flex-col`}>
          <LeadDetailPanel lead={selectedLead} />
        </div>
      </div>
    </motion.div>
  )
}
