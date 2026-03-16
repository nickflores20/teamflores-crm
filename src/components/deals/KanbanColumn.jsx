import { useDroppable } from '@dnd-kit/core'
import KanbanCard from './KanbanCard.jsx'
import { formatCurrency } from '../../lib/dateUtils.js'

const COLUMN_STYLES = {
  New:       { accent: 'bg-gray-400',   header: 'text-gray-600',  bg: 'bg-gray-50' },
  Contacted: { accent: 'bg-blue-500',   header: 'text-blue-700',  bg: 'bg-blue-50' },
  Qualified: { accent: 'bg-gold',       header: 'text-amber-700', bg: 'bg-amber-50' },
  Closed:    { accent: 'bg-green-500',  header: 'text-green-700', bg: 'bg-green-50' },
  Lost:      { accent: 'bg-red-500',    header: 'text-red-700',   bg: 'bg-red-50' },
}

export default function KanbanColumn({ status, leads }) {
  const { isOver, setNodeRef } = useDroppable({ id: status })
  const styles = COLUMN_STYLES[status] || COLUMN_STYLES.New

  const pipelineValue = leads.reduce((sum, l) => {
    const price = Number(String(l['Purchase Price']).replace(/[^0-9.-]/g, '')) || 0
    return sum + price
  }, 0)

  return (
    <div className="flex flex-col w-64 lg:w-72 flex-shrink-0">
      {/* Column header */}
      <div className="bg-white rounded-xl border border-surface-border shadow-card overflow-hidden mb-3">
        {/* Colored top accent strip */}
        <div className={`h-1 w-full ${styles.accent}`} />
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${styles.header}`}>{status}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${styles.bg} ${styles.header}`}>
              {leads.length}
            </span>
          </div>
          {pipelineValue > 0 && (
            <span className="text-xs text-ink-muted font-medium">{formatCurrency(pipelineValue)}</span>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={[
          'flex-1 flex flex-col gap-2.5 min-h-[120px] p-2 rounded-xl transition-all duration-150',
          isOver ? 'bg-gold/8 border border-gold/30 border-dashed' : 'border border-transparent',
        ].join(' ')}
      >
        {leads.map(lead => (
          <KanbanCard key={lead.rowNumber} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div className={[
            'flex-1 flex items-center justify-center text-xs rounded-xl py-8',
            isOver
              ? 'text-gold border border-dashed border-gold/40 bg-gold/5'
              : 'text-ink-muted border border-dashed border-surface-border',
          ].join(' ')}>
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
