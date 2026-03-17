import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar.jsx'
import Checkbox from '../ui/Checkbox.jsx'
import StatusSelect from './StatusSelect.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatDate, formatCurrency } from '../../lib/dateUtils.js'
import { calculateLeadScore } from '../../lib/leadScore.js'

export const rowVariants = {
  hidden:   { opacity: 0, y: 4 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.025, duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  }),
}

const COMM_TYPES = ['email_sent', 'email_received', 'call', 'text_sent', 'text_received']

function getLastCommInfo(rowNumber) {
  try {
    const events = JSON.parse(localStorage.getItem(`crm_timeline_${rowNumber}`) || '[]')
    const comms = events.filter(e => COMM_TYPES.includes(e.type))
    if (comms.length === 0) return null
    const latest = comms.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    const diffMs = Date.now() - new Date(latest.timestamp).getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffHours / 24

    let label, dotColor
    if (diffHours < 24) {
      const h = Math.floor(diffHours)
      const m = Math.floor((diffHours - h) * 60)
      label = h > 0 ? `${h}h ago` : `${m}m ago`
      dotColor = '#16A34A' // green
    } else if (diffDays <= 3) {
      label = `${Math.floor(diffDays)}d ago`
      dotColor = '#C6A76F' // gold
    } else {
      label = `${Math.floor(diffDays)}d ago`
      dotColor = '#DC2626' // red
    }
    return { label, dotColor }
  } catch {
    return null
  }
}

export default function LeadRow({ lead, index, selected, onSelect, onStatusChange }) {
  const navigate  = useNavigate()
  const fullName  = getFullName(lead)
  const lastComm  = getLastCommInfo(lead.rowNumber)
  const score     = calculateLeadScore(lead)

  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className={[
        'group border-b border-surface-border transition-colors cursor-default',
        selected ? 'bg-sand/30 border-l-2 border-l-gold' : 'hover:bg-sand/20',
      ].join(' ')}
    >
      {/* Checkbox */}
      <td className="pl-4 py-3 w-10">
        <Checkbox checked={selected} onChange={onSelect} />
      </td>

      {/* Name + Avatar */}
      <td
        className="py-3 pr-4 cursor-pointer"
        onClick={() => navigate(`/people/${lead.rowNumber}`)}
      >
        <div className="flex items-center gap-3 min-w-[160px]">
          <Avatar name={fullName} size="sm" />
          <span className="text-sm font-semibold text-ink hover:text-gold transition-colors truncate max-w-[140px]">
            {fullName}
          </span>
        </div>
      </td>

      {/* Phone */}
      <td className="py-3 pr-4 text-sm text-ink-secondary whitespace-nowrap hidden md:table-cell">
        {lead['Phone'] ? (
          <a href={`tel:${lead['Phone']}`} className="hover:text-gold transition-colors">
            {lead['Phone']}
          </a>
        ) : <span className="text-ink-muted">—</span>}
      </td>

      {/* Email */}
      <td className="py-3 pr-4 text-sm text-ink-secondary hidden lg:table-cell">
        {lead['Email'] ? (
          <a href={`mailto:${lead['Email']}`} className="hover:text-gold transition-colors truncate block max-w-[180px]">
            {lead['Email']}
          </a>
        ) : <span className="text-ink-muted">—</span>}
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <StatusSelect
          status={lead['Status']}
          onChange={(s) => onStatusChange(lead.rowNumber, s)}
        />
      </td>

      {/* Loan Type */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        {lead['Loan Type'] ? (
          <span className="px-2 py-0.5 text-xs rounded-full bg-surface-secondary text-ink-secondary border border-surface-border">
            {lead['Loan Type']}
          </span>
        ) : <span className="text-ink-muted text-sm">—</span>}
      </td>

      {/* Purchase Price */}
      <td className="py-3 pr-4 text-sm text-ink-secondary font-mono whitespace-nowrap hidden xl:table-cell">
        {formatCurrency(lead['Purchase Price'])}
      </td>

      {/* Date */}
      <td className="py-3 pr-4 text-sm text-ink-muted whitespace-nowrap hidden xl:table-cell">
        {formatDate(lead['Submitted At'] || lead['Date'])}
      </td>

      {/* Last Communication */}
      <td className="py-3 pr-4 text-xs font-semibold whitespace-nowrap hidden xl:table-cell">
        {lastComm ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lastComm.dotColor }} />
            <span style={{ color: lastComm.dotColor }}>{lastComm.label}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-ink-muted/40" />
            <span className="text-ink-muted">Never</span>
          </span>
        )}
      </td>

      {/* Score */}
      <td className="py-3 pr-4 hidden xl:table-cell">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: score.bg, color: score.textColor }}
        >
          {score.score} · {score.label}
        </span>
      </td>

      {/* Source */}
      <td className="py-3 pr-4 text-xs text-ink-muted hidden 2xl:table-cell">
        {lead['How Found'] || '—'}
      </td>

      {/* Actions */}
      <td className="py-3 pr-3 text-right">
        <button
          onClick={() => navigate(`/people/${lead.rowNumber}`)}
          className="p-1.5 rounded-lg text-ink-muted hover:text-navy-800 hover:bg-surface-secondary transition-colors opacity-0 group-hover:opacity-100"
          aria-label="View details"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </button>
      </td>
    </motion.tr>
  )
}
