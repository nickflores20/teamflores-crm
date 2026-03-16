import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Badge from '../ui/Badge.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatDate, formatCurrency } from '../../lib/dateUtils.js'
import { exportLeadsToCSV } from '../../lib/csvExport.js'

const PAGE_SIZE = 15

export default function ReportsDataTable({ leads }) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ field: 'Date', dir: 'desc' })
  const navigate = useNavigate()

  const sorted = [...leads].sort((a, b) => {
    const av = a[sort.field] || ''
    const bv = b[sort.field] || ''
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sort.dir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const setField = (field) => {
    setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' })
    setPage(1)
  }

  const SortArrow = ({ field }) => {
    if (sort.field !== field) return <span className="text-ink-muted ml-1">↕</span>
    return <span className="text-gold ml-1">{sort.dir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-ink-muted">{leads.length} leads in range</p>
        <button
          onClick={() => exportLeadsToCSV(leads, 'report-leads')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gold hover:text-gold-dark bg-gold/8 hover:bg-gold/15 border border-gold/20 rounded-lg transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-secondary">
              {[
                { label: 'Name',       field: null },
                { label: 'Status',     field: 'Status' },
                { label: 'Loan Type',  field: 'Loan Type' },
                { label: 'Price',      field: 'Purchase Price' },
                { label: 'Source',     field: 'How Found' },
                { label: 'Date',       field: 'Date' },
              ].map(col => (
                <th
                  key={col.label}
                  onClick={() => col.field && setField(col.field)}
                  className={`text-left px-4 py-2.5 text-xs font-semibold text-ink-muted whitespace-nowrap ${col.field ? 'cursor-pointer hover:text-ink-secondary' : ''}`}
                >
                  {col.label}
                  {col.field && <SortArrow field={col.field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {paginated.map((lead, i) => (
                <motion.tr
                  key={lead.rowNumber}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => navigate(`/people/${lead.rowNumber}`)}
                  className="border-b border-surface-border last:border-0 hover:bg-sand/20 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-ink">{getFullName(lead)}</td>
                  <td className="px-4 py-3"><Badge status={lead['Status']} size="xs" /></td>
                  <td className="px-4 py-3 text-ink-secondary">{lead['Loan Type'] || '—'}</td>
                  <td className="px-4 py-3 text-ink-secondary font-mono text-xs">{formatCurrency(lead['Purchase Price'])}</td>
                  <td className="px-4 py-3 text-ink-muted">{lead['How Found'] || '—'}</td>
                  <td className="px-4 py-3 text-ink-muted text-xs">{formatDate(lead['Date'])}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted text-sm">No leads in this date range</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-xs text-ink-muted">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, leads.length)} of {leads.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 text-xs rounded-lg bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-surface-border"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-xs text-ink-muted">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 text-xs rounded-lg bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-surface-border"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
