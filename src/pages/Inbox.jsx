import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import InboxStats from '../components/inbox/InboxStats.jsx'
import ActivityFeed from '../components/inbox/ActivityFeed.jsx'
import LeadDetailPanel from '../components/inbox/LeadDetailPanel.jsx'

export default function Inbox() {
  const { leads, loading } = useLeadsContext()
  const [selectedId, setSelectedId] = useState(null)

  const selectedLead = selectedId != null ? leads.find(l => l.rowNumber === selectedId) || null : null

  const handleSelect = (lead) => {
    setSelectedId(prev => prev === lead.rowNumber ? null : lead.rowNumber)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full overflow-hidden bg-white"
    >
      <InboxStats leads={leads} />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Feed */}
        <div className="flex-shrink-0 w-full sm:w-80 lg:w-96 overflow-hidden flex flex-col">
          <ActivityFeed
            leads={leads}
            loading={loading}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {/* Lead Detail */}
        <div className={`flex-1 overflow-hidden ${selectedLead ? 'flex' : 'hidden sm:flex'} flex-col`}>
          <LeadDetailPanel lead={selectedLead} />
        </div>
      </div>
    </motion.div>
  )
}
