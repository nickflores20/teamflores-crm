import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import KanbanBoard from '../components/deals/KanbanBoard.jsx'
import { formatCurrency } from '../lib/dateUtils.js'
import { getFullName } from '../api/mockData.js'

const NAVY = '#1A3E61'
const GOLD = '#C6A76F'

const STAGE_STYLES = {
  'New':         { bg: '#FEE2E2', text: '#DC2626' },
  'Contacted':   { bg: '#FEF3C7', text: '#D97706' },
  'Active':      { bg: '#DCFCE7', text: '#16A34A' },
  'Qualified':   { bg: '#DBEAFE', text: '#2563EB' },
  'In Progress': { bg: '#EDE9FE', text: '#7C3AED' },
  'Cold':        { bg: '#F1F5F9', text: '#64748B' },
  'Closed Won':  { bg: '#D1FAE5', text: '#065F46' },
  'Lost':        { bg: '#FEE2E2', text: '#991B1B' },
}

const SOURCES = ['All Sources', 'LeadPops NV', 'LeadPops AZ', 'Bankrate NV', 'Bankrate TX', 'Zillow', 'Website']
const STATES  = ['All States', 'NV', 'AZ', 'CA', 'FL', 'TX']
const TYPES   = ['All Types', 'Purchase', 'Refi', 'VA']

export default function Deals() {
  const { leads, loading, setLeadStatus } = useLeadsContext()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [view, setView] = useState('board') // 'board' | 'list'
  const [sourceFilter, setSourceFilter] = useState('All Sources')
  const [stateFilter,  setStateFilter]  = useState('All States')
  const [typeFilter,   setTypeFilter]   = useState('All Types')

  const handleLeadMove = async (rowNumber, newStatus) => {
    try {
      await setLeadStatus(rowNumber, newStatus)
      addToast({ type: 'success', message: `Moved to ${newStatus}` })
    } catch {
      addToast({ type: 'error', message: 'Failed to update status' })
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (l['Status'] === 'Lost') return false
      if (sourceFilter !== 'All Sources' && !(l['How Found'] || '').includes(sourceFilter)) return false
      if (stateFilter !== 'All States' && l['State'] !== stateFilter) return false
      if (typeFilter !== 'All Types') {
        const lt = (l['Loan Type'] || '').toLowerCase()
        if (typeFilter === 'Purchase' && !lt.includes('purchase')) return false
        if (typeFilter === 'Refi' && !lt.includes('refi') && !lt.includes('refinance')) return false
        if (typeFilter === 'VA' && !lt.includes('va')) return false
      }
      return true
    })
  }, [leads, sourceFilter, stateFilter, typeFilter])

  const activeLeads  = filteredLeads.filter(l => !['Closed Won', 'Lost'].includes(l['Status']))
  const closedLeads  = filteredLeads.filter(l => l['Status'] === 'Closed Won')
  const totalLeads   = filteredLeads.filter(l => l['Status'] !== 'Lost')
  const winRate = totalLeads.length > 0 ? Math.round((closedLeads.length / totalLeads.length) * 100) : 0

  const pipelineValue = filteredLeads
    .filter(l => !['Closed Won', 'Lost'].includes(l['Status']))
    .reduce((sum, l) => sum + (Number(String(l['Purchase Price'] || l['Loan Balance'] || 0).replace(/[^0-9.-]/g, '')) || 0), 0)

  const totalPipeline = leads
    .filter(l => !['Lost'].includes(l['Status']))
    .reduce((sum, l) => sum + (Number(String(l['Purchase Price'] || l['Loan Balance'] || 0).replace(/[^0-9.-]/g, '')) || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-hidden bg-surface-secondary"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-surface-border bg-white flex-shrink-0 flex-wrap gap-3">
        {/* Total pipeline */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Total Pipeline:</span>
          <span className="text-base font-bold font-serif" style={{ color: GOLD }}>
            {formatCurrency(totalPipeline)}
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: sourceFilter, onChange: setSourceFilter, options: SOURCES },
            { value: stateFilter,  onChange: setStateFilter,  options: STATES  },
            { value: typeFilter,   onChange: setTypeFilter,   options: TYPES   },
          ].map(({ value, onChange, options }) => (
            <select
              key={options[0]}
              value={value}
              onChange={e => onChange(e.target.value)}
              className="text-xs font-semibold border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 cursor-pointer"
              style={{
                borderColor: value !== options[0] ? GOLD : '#E2E8F0',
                color: value !== options[0] ? NAVY : '#64748B',
              }}
            >
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}

          {/* View toggle */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('board')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
              style={view === 'board' ? { backgroundColor: NAVY, color: 'white' } : { color: '#64748B', backgroundColor: 'white' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors border-l border-slate-200"
              style={view === 'list' ? { backgroundColor: NAVY, color: 'white' } : { color: '#64748B', backgroundColor: 'white' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              List
            </button>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex border-b border-surface-border bg-white flex-shrink-0">
        {[
          { label: 'Active Deals',   value: activeLeads.length,           color: 'text-blue-600' },
          { label: 'Pipeline Value', value: formatCurrency(pipelineValue), color: 'text-gold' },
          { label: 'Win Rate',       value: `${winRate}%`,                color: 'text-green-600' },
          { label: 'Closed',         value: closedLeads.length,            color: 'text-ink' },
        ].map((stat, i) => (
          <div key={stat.label} className={`flex-1 px-4 lg:px-6 py-3 ${i < 3 ? 'border-r border-surface-border' : ''}`}>
            <p className={`text-xl font-serif font-semibold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content: Board or List */}
      <div className="flex-1 overflow-hidden pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-ink-muted text-sm">Loading deals…</div>
        ) : view === 'board' ? (
          <KanbanBoard leads={filteredLeads} onLeadMove={handleLeadMove} />
        ) : (
          /* List View */
          <div className="overflow-auto h-full px-4 lg:px-6">
            <table className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  {['Name', 'Stage', 'State', 'Type', 'Amount', 'Source', 'Days'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, i) => {
                  const stageMeta = STAGE_STYLES[lead['Status']] || STAGE_STYLES['New']
                  const days = Math.floor((Date.now() - new Date(lead['Submitted At'] || lead['Date'] || 0)) / 86400000)
                  const daysColor = days > 14 ? '#DC2626' : days > 7 ? '#D97706' : '#16A34A'
                  const loanVal = lead['Purchase Price'] || lead['Loan Balance'] || ''
                  return (
                    <tr
                      key={lead.rowNumber}
                      onClick={() => navigate(`/people/${lead.rowNumber}`)}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold" style={{ color: NAVY }}>{getFullName(lead)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={stageMeta}>
                          {lead['Status']}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: '#F0E6D2', color: '#8A6A2A' }}>
                          {lead['State']}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{lead['Loan Type'] || '—'}</td>
                      <td className="py-3 px-4 font-semibold font-mono text-sm" style={{ color: GOLD }}>
                        {loanVal ? formatCurrency(loanVal) : '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{lead['How Found'] || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-bold" style={{ color: daysColor }}>{days}d</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  )
}
