import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatCurrency, daysAgo } from '../../lib/dateUtils.js'
import { STAGE_META } from '../ui/Badge.jsx'

const NAVY = '#1A3E61'
const GOLD = '#C6A76F'

const STATE_ABBR = { Nevada: 'NV', Arizona: 'AZ', California: 'CA', Florida: 'FL', Texas: 'TX', Washington: 'WA', Oregon: 'OR' }

export default function KanbanCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(lead.rowNumber),
    data: { lead },
  })
  const navigate = useNavigate()
  const fullName = getFullName(lead)
  const days     = daysAgo(lead['Submitted At'] || lead['Date'])
  const state    = lead['State'] || ''

  // Days-in-stage color coding: green <7, yellow 7-14, red >14
  let daysColor = '#22C55E'
  let daysBg    = '#F0FDF4'
  if (days !== null && days > 14) { daysColor = '#DC2626'; daysBg = '#FEF2F2' }
  else if (days !== null && days > 7) { daysColor = '#D97706'; daysBg = '#FFFBEB' }

  const stageMeta = STAGE_META[lead['Status']] || {}

  const loanValue = lead['Purchase Price'] || lead['Loan Balance'] || ''

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-xl p-3 cursor-grab active:cursor-grabbing select-none transition-all duration-150 hover:shadow-md"
      {...listeners}
      {...attributes}
      onDoubleClick={() => navigate(`/people/${lead.rowNumber}`)}
    >
      {/* Name + Avatar */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={fullName} size="xs" />
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/people/${lead.rowNumber}`) }}
          className="text-xs font-bold truncate flex-1 text-left hover:underline"
          style={{ color: NAVY }}
          onPointerDown={e => e.stopPropagation()}
        >
          {fullName}
        </button>
      </div>

      {/* Loan amount — gold, large */}
      {loanValue && (
        <p className="text-sm font-bold mb-1.5" style={{ color: GOLD }}>
          {formatCurrency(loanValue)}
        </p>
      )}

      {/* State + loan type badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {state && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ color: NAVY, borderColor: '#B0C4D8', backgroundColor: '#E8EFF6' }}>
            {state}
          </span>
        )}
        {lead['Loan Type'] && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ color: '#475569', borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}>
            {lead['Loan Type']}
          </span>
        )}
      </div>

      {/* Source */}
      {lead['How Found'] && (
        <p className="text-[10px] mb-2 truncate" style={{ color: '#94A3B8' }}>
          {lead['How Found']}
        </p>
      )}

      {/* Stage badge + days in stage */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
          style={{ backgroundColor: stageMeta.bg, color: stageMeta.text, borderColor: stageMeta.border }}
        >
          {lead['Status']}
        </span>
        {days !== null && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: daysBg, color: daysColor }}
          >
            {days}d
          </span>
        )}
      </div>
    </div>
  )
}
