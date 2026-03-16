import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatCurrency, daysAgo } from '../../lib/dateUtils.js'

export default function KanbanCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(lead.rowNumber),
    data: { lead },
  })
  const navigate = useNavigate()
  const fullName = getFullName(lead)
  const days = daysAgo(lead['Submitted At'] || lead['Date'])
  const stale = days !== null && days > 7

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'bg-white border border-surface-border rounded-xl p-3 cursor-grab active:cursor-grabbing select-none',
        'hover:border-gold/40 hover:shadow-card transition-all duration-150',
        isDragging ? 'shadow-floating' : 'shadow-sm',
      ].join(' ')}
      {...listeners}
      {...attributes}
    >
      {/* Name + Avatar */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={fullName} size="xs" />
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/people/${lead.rowNumber}`) }}
          className="text-sm font-semibold text-ink hover:text-gold transition-colors truncate text-left flex-1"
          onPointerDown={e => e.stopPropagation()}
        >
          {fullName}
        </button>
      </div>

      {/* Loan type */}
      {lead['Loan Type'] && (
        <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-surface-secondary text-ink-muted border border-surface-border mb-2">
          {lead['Loan Type']}
        </span>
      )}

      {/* Price */}
      {lead['Purchase Price'] && (
        <p className="text-xs text-ink-secondary font-medium mb-2">{formatCurrency(lead['Purchase Price'])}</p>
      )}

      {/* Phone + days in stage */}
      <div className="flex items-center justify-between">
        {lead['Phone'] && (
          <a
            href={`tel:${lead['Phone']}`}
            className="text-[10px] text-ink-muted hover:text-gold transition-colors"
            onPointerDown={e => e.stopPropagation()}
          >
            {lead['Phone']}
          </a>
        )}
        {days !== null && (
          <span className={`text-[10px] font-semibold ml-auto px-1.5 py-0.5 rounded-full ${stale ? 'bg-red-50 text-red-500' : 'bg-surface-secondary text-ink-muted'}`}>
            {days}d
          </span>
        )}
      </div>
    </div>
  )
}
