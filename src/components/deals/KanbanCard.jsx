import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatCurrency, daysAgo } from '../../lib/dateUtils.js'

const NAVY = '#1A3E61'
const GOLD = '#C6A76F'

const SOURCE_ABBR = {
  'LeadPops NV Purchase': 'LP NV', 'LeadPops NV Refi': 'LP NV',
  'LeadPops AZ Purchase': 'LP AZ', 'LeadPops AZ Refi': 'LP AZ',
  'Bankrate NV Purchase': 'BK NV', 'Bankrate NV Refi': 'BK NV',
  'Bankrate TX Purchase': 'BK TX', 'Bankrate TX Refi': 'BK TX',
  'Zillow': 'Zillow', 'Website': 'Web',
}

export default function KanbanCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(lead.rowNumber),
    data: { lead },
  })
  const navigate = useNavigate()
  const fullName = getFullName(lead)
  const days     = daysAgo(lead['Submitted At'] || lead['Date'])
  const state    = lead['State'] || ''
  const loanValue = lead['Purchase Price'] || lead['Loan Balance'] || ''
  const loanType  = lead['Loan Type'] || ''
  const loanTypeShort = loanType.includes('Refi') || loanType.includes('Refinance') ? 'Refi'
    : loanType.includes('VA') ? 'VA'
    : loanType.includes('FHA') ? 'FHA'
    : 'Purchase'
  const sourceAbbr = SOURCE_ABBR[lead['How Found']] || (lead['How Found'] ? lead['How Found'].slice(0, 6) : null)

  // Days-in-stage color: green <7, yellow 7-14, red >14
  let daysColor = '#16A34A'
  let daysBg    = '#F0FDF4'
  if (days !== null && days > 14) { daysColor = '#DC2626'; daysBg = '#FEF2F2' }
  else if (days !== null && days > 7) { daysColor = '#D97706'; daysBg = '#FFFBEB' }

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing select-none transition-all duration-150 hover:shadow-md hover:border-slate-300"
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

      {/* Loan amount — gold, large, serif */}
      {loanValue && (
        <p className="text-sm font-bold mb-2 font-serif" style={{ color: GOLD }}>
          {formatCurrency(loanValue)}
        </p>
      )}

      {/* State + loan type badges */}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {state && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ color: NAVY, border: `1px solid #B0C4D8`, backgroundColor: '#EEF3F8' }}>
            {state}
          </span>
        )}
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ color: '#475569', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          {loanTypeShort}
        </span>
        {sourceAbbr && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ color: '#8A6A2A', border: '1px solid #E8D5A3', backgroundColor: '#FBF5E8' }}>
            {sourceAbbr}
          </span>
        )}
      </div>

      {/* Days in stage pill */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        {days !== null ? (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: daysBg, color: daysColor }}
          >
            {days < 7 ? `<7 days` : days <= 14 ? `${days} days` : `${days}d`}
          </span>
        ) : <span />}
        {/* Phone */}
        {lead['Phone'] && (
          <span className="text-[10px] text-slate-400 font-mono">{lead['Phone']}</span>
        )}
      </div>
    </div>
  )
}
