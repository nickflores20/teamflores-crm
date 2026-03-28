import { useDroppable } from '@dnd-kit/core'
import KanbanCard from './KanbanCard.jsx'
import { formatCurrency } from '../../lib/dateUtils.js'

const COLUMN_STYLES = {
  'Inquiry':                   { accent: '#94A3B8', text: '#475569', bg: '#F8FAFC' },
  'Sonar Sent':                { accent: '#C55A11', text: '#C55A11', bg: '#FDF0E8' },
  'Pre-Approval In Progress':  { accent: '#5E35B1', text: '#5E35B1', bg: '#F0EBFB' },
  'Pre-Approved':              { accent: '#1E7145', text: '#1E7145', bg: '#E8F5EE' },
  'Under Contract':            { accent: '#0284C7', text: '#0284C7', bg: '#E0F2FE' },
  'In Underwriting':           { accent: '#1A3E61', text: '#1A3E61', bg: '#E8EFF6' },
  'Clear to Close':            { accent: '#C6A76F', text: '#8A6A2A', bg: '#FBF5E8' },
  'Closed Won':                { accent: '#C6A76F', text: '#8A6A2A', bg: '#FBF5E8' },
}

const STAGE_ICONS = {
  'Inquiry':                   '📋',
  'Sonar Sent':                '🔗',
  'Pre-Approval In Progress':  '📝',
  'Pre-Approved':              '✅',
  'Under Contract':            '🤝',
  'In Underwriting':           '🔍',
  'Clear to Close':            '🎯',
  'Closed Won':                '🎉',
}

export default function KanbanColumn({ status, leads }) {
  const { isOver, setNodeRef } = useDroppable({ id: status })
  const styles = COLUMN_STYLES[status] || COLUMN_STYLES['Inquiry']
  const icon   = STAGE_ICONS[status] || '📋'

  const pipelineValue = leads.reduce((sum, l) => {
    const price = Number(String(l['Purchase Price'] || l['Loan Balance'] || 0).replace(/[^0-9.-]/g, '')) || 0
    return sum + price
  }, 0)

  return (
    <div className="flex flex-col w-60 lg:w-64 flex-shrink-0">
      {/* Column header */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-3" style={{ borderColor: '#E2E8F0' }}>
        <div className="h-1 w-full" style={{ backgroundColor: styles.accent }} />
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{icon}</span>
              <span className="text-xs font-bold truncate max-w-[110px]" style={{ color: styles.text }}>
                {status}
              </span>
            </div>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: styles.bg, color: styles.text }}
            >
              {leads.length}
            </span>
          </div>
          {pipelineValue > 0 && (
            <p className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
              {formatCurrency(pipelineValue)}
            </p>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2.5 min-h-[120px] p-2 rounded-xl transition-all duration-150"
        style={isOver
          ? { backgroundColor: '#FBF5E8', border: '1.5px dashed #C6A76F' }
          : { border: '1.5px solid transparent' }
        }
      >
        {leads.map(lead => (
          <KanbanCard key={lead.rowNumber} lead={lead} />
        ))}
        {leads.length === 0 && (
          <div
            className="flex-1 flex items-center justify-center text-xs rounded-xl py-8"
            style={isOver
              ? { color: '#C6A76F', border: '1.5px dashed #C6A76F', backgroundColor: '#FBF5E8' }
              : { color: '#CBD5E1', border: '1.5px dashed #E2E8F0' }
            }
          >
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
