import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar.jsx'
import Checkbox from '../ui/Checkbox.jsx'
import StatusSelect from './StatusSelect.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatCurrency } from '../../lib/dateUtils.js'
import { useToast } from '../../context/ToastContext.jsx'

export const rowVariants = {
  hidden:   { opacity: 0, y: 4 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.025, duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  }),
}

const NAVY = '#1A3E61'
const GOLD = '#C6A76F'

const STAGE_STYLES = {
  'New':         { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  'Contacted':   { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  'Active':      { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
  'Qualified':   { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' },
  'In Progress': { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
  'Cold':        { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
  'Closed Won':  { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
  'Lost':        { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
}

const SOURCE_ABBR = {
  'LeadPops NV Purchase': 'LP NV',
  'LeadPops NV Refi': 'LP NV',
  'LeadPops AZ Purchase': 'LP AZ',
  'LeadPops AZ Refi': 'LP AZ',
  'Bankrate NV Purchase': 'BK NV',
  'Bankrate NV Refi': 'BK NV',
  'Bankrate TX Purchase': 'BK TX',
  'Bankrate TX Refi': 'BK TX',
  'Zillow': 'Zillow',
  'Website': 'Web',
}

const COMM_TYPES = ['email_sent', 'email_received', 'call', 'text_sent', 'text_received']

function getLastCommInfo(rowNumber) {
  try {
    const events = JSON.parse(localStorage.getItem(`crm_timeline_${rowNumber}`) || '[]')
    const comms = events.filter(e => COMM_TYPES.includes(e.type))
    if (comms.length === 0) return null
    const latest = comms.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    const diffMs = Date.now() - new Date(latest.timestamp).getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    let label, dotColor
    if (diffDays < 1) {
      const h = Math.floor(diffMs / 3600000)
      label = h > 0 ? `${h}h ago` : `${Math.floor(diffMs / 60000)}m ago`
      dotColor = '#16A34A' // green <1d
    } else if (diffDays <= 3) {
      label = `${Math.floor(diffDays)}d ago`
      dotColor = '#16A34A' // green <3d
    } else if (diffDays <= 7) {
      label = `${Math.floor(diffDays)}d ago`
      dotColor = '#F97316' // orange 3-7d
    } else {
      label = `${Math.floor(diffDays)}d ago`
      dotColor = '#DC2626' // red >7d
    }
    return { label, dotColor }
  } catch {
    return null
  }
}

function formatCreated(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function LeadRow({ lead, index, selected, onSelect, onStatusChange }) {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const fullName = getFullName(lead)
  const lastComm = getLastCommInfo(lead.rowNumber)
  const [hovered, setHovered] = useState(false)

  const stageMeta = STAGE_STYLES[lead['Status']] || { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' }
  const sourceAbbr = SOURCE_ABBR[lead['How Found']] || (lead['How Found'] ? lead['How Found'].slice(0, 6) : null)
  const state = lead['State'] || ''
  const loanAmount = lead['Purchase Price'] || lead['Loan Balance'] || ''
  const loanType = lead['Loan Type'] || ''
  const loanTypeShort = loanType.includes('Refi') || loanType.includes('Refinance') ? 'Refi'
    : loanType.includes('VA') ? 'VA'
    : loanType.includes('FHA') ? 'FHA'
    : 'Purchase'

  const copyPhone = (e) => {
    e.stopPropagation()
    if (lead['Phone']) {
      navigator.clipboard.writeText(lead['Phone']).then(() => {
        addToast({ type: 'success', message: `Copied ${lead['Phone']}` })
      })
    }
  }

  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className={[
        'group border-b border-surface-border transition-colors cursor-default relative',
        selected ? 'bg-[#F0E6D220] border-l-2 border-l-gold' : 'hover:bg-[#F8FAFC]',
      ].join(' ')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        <div className="flex items-center gap-2.5 min-w-[150px]">
          <Avatar name={fullName} size="sm" />
          <span className="text-sm font-semibold hover:underline truncate max-w-[130px]" style={{ color: NAVY }}>
            {fullName}
          </span>
        </div>
      </td>

      {/* Stage badge */}
      <td className="py-3 pr-3">
        <StatusSelect
          status={lead['Status']}
          onChange={(s) => onStatusChange(lead.rowNumber, s)}
        />
      </td>

      {/* Source badge */}
      <td className="py-3 pr-3 hidden lg:table-cell">
        {sourceAbbr && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: '#EEF3F8', color: NAVY, border: `1px solid #B0C4D8` }}>
            {sourceAbbr}
          </span>
        )}
      </td>

      {/* State badge */}
      <td className="py-3 pr-3 hidden md:table-cell">
        {state && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: '#F0E6D2', color: '#8A6A2A', border: '1px solid #E8D5A3' }}>
            {state}
          </span>
        )}
      </td>

      {/* Loan Type */}
      <td className="py-3 pr-3 hidden xl:table-cell">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>
          {loanTypeShort}
        </span>
      </td>

      {/* Loan Amount */}
      <td className="py-3 pr-4 text-sm font-semibold font-mono whitespace-nowrap hidden xl:table-cell"
        style={{ color: GOLD }}>
        {loanAmount ? formatCurrency(loanAmount) : <span className="text-ink-muted font-normal">—</span>}
      </td>

      {/* Last Contact */}
      <td className="py-3 pr-4 text-xs font-semibold whitespace-nowrap hidden lg:table-cell">
        {lastComm ? (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lastComm.dotColor }} />
            <span style={{ color: lastComm.dotColor }}>{lastComm.label}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-200" />
            <span className="text-slate-400">Never</span>
          </span>
        )}
      </td>

      {/* Phone */}
      <td className="py-3 pr-4 hidden md:table-cell">
        {lead['Phone'] ? (
          <button
            onClick={copyPhone}
            className="text-xs text-slate-500 hover:text-navy-800 transition-colors font-mono"
            title="Click to copy"
          >
            {lead['Phone']}
          </button>
        ) : <span className="text-slate-300 text-xs">—</span>}
      </td>

      {/* Created */}
      <td className="py-3 pr-4 text-xs text-slate-400 whitespace-nowrap hidden xl:table-cell">
        {formatCreated(lead['Submitted At'] || lead['Date'])}
      </td>

      {/* Quick hover actions */}
      <td className="py-3 pr-3">
        <div
          className="flex items-center gap-1 justify-end transition-opacity"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); addToast({ type: 'info', message: `Opening text for ${fullName}` }) }}
            className="px-2 py-1 rounded-md text-[10px] font-bold border transition-colors hover:bg-green-50 hover:border-green-300 hover:text-green-700"
            style={{ borderColor: '#E2E8F0', color: '#64748B', backgroundColor: 'white' }}
          >
            Text
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addToast({ type: 'info', message: `Opening email for ${fullName}` }) }}
            className="px-2 py-1 rounded-md text-[10px] font-bold border transition-colors hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
            style={{ borderColor: '#E2E8F0', color: '#64748B', backgroundColor: 'white' }}
          >
            Email
          </button>
          <button
            onClick={() => navigate(`/people/${lead.rowNumber}`)}
            className="px-2 py-1 rounded-md text-[10px] font-bold border transition-colors hover:bg-navy-50"
            style={{ borderColor: '#E2E8F0', color: NAVY, backgroundColor: 'white' }}
          >
            View →
          </button>
        </div>
      </td>
    </motion.tr>
  )
}
