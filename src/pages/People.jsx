import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLeads } from '../hooks/useLeads.js'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { useTasksContext } from '../context/TasksContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import LeadTable from '../components/leads/LeadTable.jsx'
import LeadFilters from '../components/leads/LeadFilters.jsx'
import BulkActionsBar from '../components/leads/BulkActionsBar.jsx'
import ExportButton from '../components/leads/ExportButton.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { exportLeadsToCSV } from '../lib/csvExport.js'
import { todayISO } from '../lib/dateUtils.js'

const DEFAULT_FILTERS = {
  statusFilter: [],
  loanTypeFilter: [],
  sourceFilter: [],
  dateFrom: '',
  dateTo: '',
}

// ─── Smart list definitions ────────────────────────────────────────────────
const SMART_LISTS = [
  { key: 'new',        label: 'New Leads',           icon: '⚡', color: '#C6A76F' },
  { key: 'noContact',  label: 'No Contact 3+ Days',  icon: '🔔', color: '#EF4444' },
  { key: 'hot',        label: 'Hot Leads',           icon: '🔥', color: '#F97316' },
  { key: 'closing',    label: 'Closing This Month',  icon: '🏆', color: '#22C55E' },
  { key: 'followUp',   label: 'Follow Up Today',     icon: '📋', color: '#3B82F6' },
  { key: 'active',     label: 'All Active',          icon: '✓',  color: '#1A3E61' },
]

function getNoContactIds(leads) {
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000
  return leads
    .filter(l => l['Status'] === 'Contacted')
    .filter(l => {
      try {
        const events = JSON.parse(localStorage.getItem(`crm_timeline_${l.rowNumber}`) || '[]')
        if (events.length === 0) return true
        const last = events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        return new Date(last.timestamp).getTime() < cutoff
      } catch { return true }
    })
    .map(l => l.rowNumber)
}

export default function People() {
  const [filters, setFilters]         = useState(DEFAULT_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField]     = useState('Submitted At')
  const [sortDir, setSortDir]         = useState('desc')
  const [page, setPage]               = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [activeSmartList, setActiveSmartList] = useState(null)
  const [smartOverrideIds, setSmartOverrideIds] = useState(null)

  const { addToast } = useToast()
  const { tasks }    = useTasksContext()
  const { leads: allLeadsRaw } = useLeadsContext()

  const { leads, allFilteredLeads, totalCount, totalPages, loading, error, setLeadStatus } = useLeads({
    searchQuery, ...filters, sortField, sortDir, page, pageSize: 25,
  })
  const { allFilteredLeads: allLeads } = useLeads({})

  // ─── Smart list counts ───────────────────────────────────────────────────
  const smartCounts = useMemo(() => {
    const today = todayISO()
    return {
      new:       allLeadsRaw.filter(l => l['Status'] === 'New').length,
      noContact: getNoContactIds(allLeadsRaw).length,
      hot:       allLeadsRaw.filter(l => l['Status'] === 'Qualified').length,
      closing:   allLeadsRaw.filter(l => l['Status'] === 'Closed').length,
      followUp:  tasks.filter(t => !t.completed && t.dueDate === today && t.linkedLeadId).length,
      active:    allLeadsRaw.filter(l => l['Status'] !== 'Lost').length,
    }
  }, [allLeadsRaw, tasks])

  // ─── Apply smart list filter ─────────────────────────────────────────────
  const handleSmartList = (key) => {
    if (activeSmartList === key) {
      setActiveSmartList(null)
      setSmartOverrideIds(null)
      setFilters(DEFAULT_FILTERS)
      setPage(1)
      return
    }
    setActiveSmartList(key)
    setSmartOverrideIds(null)
    setPage(1)

    if (key === 'new') {
      setFilters({ ...DEFAULT_FILTERS, statusFilter: ['New'] })
    } else if (key === 'noContact') {
      const ids = getNoContactIds(allLeadsRaw)
      setSmartOverrideIds(ids)
      setFilters(DEFAULT_FILTERS)
    } else if (key === 'hot') {
      setFilters({ ...DEFAULT_FILTERS, statusFilter: ['Qualified'] })
    } else if (key === 'closing') {
      setFilters({ ...DEFAULT_FILTERS, statusFilter: ['Closed'] })
    } else if (key === 'followUp') {
      const today = todayISO()
      const ids = [...new Set(
        tasks
          .filter(t => !t.completed && t.dueDate === today && t.linkedLeadId)
          .map(t => t.linkedLeadId)
      )]
      setSmartOverrideIds(ids)
      setFilters(DEFAULT_FILTERS)
    } else if (key === 'active') {
      setFilters({ ...DEFAULT_FILTERS, statusFilter: ['New', 'Contacted', 'Qualified'] })
    }
  }

  // If smartOverrideIds is set, filter allLeadsRaw by those IDs directly
  const overrideLeads = useMemo(() => {
    if (!smartOverrideIds) return null
    return allLeadsRaw.filter(l => smartOverrideIds.includes(l.rowNumber))
  }, [smartOverrideIds, allLeadsRaw])

  const displayLeads = overrideLeads ?? leads
  const displayTotal = overrideLeads ? overrideLeads.length : totalCount
  const displayPages = overrideLeads ? 1 : totalPages

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field }
      setSortDir('asc'); return field
    })
    setPage(1)
  }, [])

  const handleSelectAll = () => {
    if (leads.every(l => selectedIds.includes(l.rowNumber))) {
      setSelectedIds(prev => prev.filter(id => !leads.map(l => l.rowNumber).includes(id)))
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...leads.map(l => l.rowNumber)])])
    }
  }

  const handleSelectRow     = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const handleStatusChange  = async (rowNumber, status) => {
    try { await setLeadStatus(rowNumber, status); addToast({ type: 'success', message: `Status → ${status}` }) }
    catch { addToast({ type: 'error', message: 'Failed to update' }) }
  }
  const handleBulkStatus    = async (status) => {
    await Promise.allSettled(selectedIds.map(id => setLeadStatus(id, status)))
    addToast({ type: 'success', message: `${selectedIds.length} leads → ${status}` })
    setSelectedIds([])
  }
  const handleBulkExport    = () => {
    const sel = allLeads.filter(l => selectedIds.includes(l.rowNumber))
    exportLeadsToCSV(sel, `leads_selected_${todayISO()}.csv`)
  }
  const handleBulkDelete    = () => setDeleteConfirm(true)
  const confirmDelete       = () => { addToast({ type: 'info', message: 'Delete coming soon.' }); setDeleteConfirm(false); setSelectedIds([]) }
  const handleFiltersChange = (f) => {
    setFilters(f)
    setPage(1)
    setActiveSmartList(null)
    setSmartOverrideIds(null)
  }

  const activeFilterCount = Object.values(filters).flat().filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col h-full"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 lg:px-6 py-4 border-b border-surface-border bg-white flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
            placeholder="Search name, email, phone…"
            className="w-full bg-white border border-surface-border rounded-lg pl-9 pr-4 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
          />
        </div>

        <span className="text-sm text-ink-muted whitespace-nowrap">
          {displayTotal} {displayTotal === 1 ? 'person' : 'people'}
          {activeSmartList && (
            <span className="ml-1 text-xs text-gold font-medium">
              · {SMART_LISTS.find(s => s.key === activeSmartList)?.label}
            </span>
          )}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <ExportButton leads={allLeads} filteredLeads={allFilteredLeads} />

          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={[
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
              activeFilterCount > 0
                ? 'border-gold/50 bg-amber-50 text-amber-700'
                : 'border-surface-border text-ink-secondary hover:text-ink hover:border-surface-border-strong bg-white',
            ].join(' ')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-800 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Smart Lists strip ──────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-surface-border px-4 lg:px-6 py-2 flex gap-2 overflow-x-auto scrollbar-none">
        {SMART_LISTS.map(list => {
          const count = smartCounts[list.key]
          const isActive = activeSmartList === list.key
          return (
            <button
              key={list.key}
              onClick={() => handleSmartList(list.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
              style={isActive
                ? { backgroundColor: list.color, borderColor: list.color, color: 'white' }
                : { backgroundColor: 'white', borderColor: '#E2E8F0', color: '#475569' }
              }
            >
              <span>{list.icon}</span>
              <span>{list.label}</span>
              {count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 rounded-full"
                  style={isActive
                    ? { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }
                    : { backgroundColor: '#F1F5F9', color: '#64748B' }
                  }
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table area */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        <LeadTable
          leads={displayLeads}
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onSort={handleSort}
          sortField={sortField}
          sortDir={sortDir}
          onStatusChange={handleStatusChange}
          totalCount={displayTotal}
          page={overrideLeads ? 1 : page}
          totalPages={displayPages}
          pageSize={25}
          onPageChange={setPage}
        />
      </div>

      <LeadFilters
        isOpen={filtersOpen}
        filters={filters}
        onChange={handleFiltersChange}
        onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1) }}
        onClose={() => setFiltersOpen(false)}
      />

      <BulkActionsBar
        count={selectedIds.length}
        onChangeStatus={handleBulkStatus}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds([])}
      />

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Leads"
        message={`Delete ${selectedIds.length} lead${selectedIds.length !== 1 ? 's' : ''}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </motion.div>
  )
}
