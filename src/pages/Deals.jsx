import { motion } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import KanbanBoard from '../components/deals/KanbanBoard.jsx'
import { formatCurrency } from '../lib/dateUtils.js'

export default function Deals() {
  const { leads, loading, setLeadStatus } = useLeadsContext()
  const { addToast } = useToast()

  const handleLeadMove = async (rowNumber, newStatus) => {
    try {
      await setLeadStatus(rowNumber, newStatus)
      addToast({ type: 'success', message: `Moved to ${newStatus}` })
    } catch {
      addToast({ type: 'error', message: 'Failed to update status' })
    }
  }

  const activeLeads = leads.filter(l => !['Closed', 'Lost'].includes(l['Status']))
  const closedLeads = leads.filter(l => l['Status'] === 'Closed')
  const totalLeads = leads.filter(l => l['Status'] !== 'Lost')
  const winRate = totalLeads.length > 0
    ? Math.round((closedLeads.length / totalLeads.length) * 100)
    : 0
  const pipelineValue = activeLeads.reduce((sum, l) => {
    return sum + (Number(String(l['Purchase Price']).replace(/[^0-9.-]/g, '')) || 0)
  }, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-hidden bg-surface-secondary"
    >
      {/* Summary bar */}
      <div className="flex border-b border-surface-border bg-white flex-shrink-0">
        {[
          { label: 'Active Deals',   value: activeLeads.length,          color: 'text-blue-600' },
          { label: 'Pipeline Value', value: formatCurrency(pipelineValue), color: 'text-gold' },
          { label: 'Win Rate',       value: `${winRate}%`,               color: 'text-green-600' },
          { label: 'Closed',         value: closedLeads.length,           color: 'text-ink' },
        ].map((stat, i) => (
          <div key={stat.label} className={`flex-1 px-4 lg:px-6 py-3.5 ${i < 3 ? 'border-r border-surface-border' : ''}`}>
            <p className={`text-xl font-serif font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-ink-muted text-sm">Loading deals…</div>
        ) : (
          <KanbanBoard leads={leads} onLeadMove={handleLeadMove} />
        )}
      </div>
    </motion.div>
  )
}
