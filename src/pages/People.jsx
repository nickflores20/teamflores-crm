import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLeads } from '../hooks/useLeads.js'
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

export default function People() {
  const [filters, setFilters]         = useState(DEFAULT_FILTERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField]     = useState('Submitted At')
  const [sortDir, setSortDir]         = useState('desc')
  const [page, setPage]               = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const { addToast } = useToast()

  const { leads, allFilteredLeads, totalCount, totalPages, loading, error, setLeadStatus } = useLeads({
    searchQuery, ...filters, sortField, sortDir, page, pageSize: 25,
  })
  const { allFilteredLeads: allLeads } = useLeads({})

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
  const handleFiltersChange = (f) => { setFilters(f); setPage(1) }

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
          {totalCount} {totalCount === 1 ? 'person' : 'people'}
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

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table area */}
      <div className="flex-1 overflow-auto px-4 lg:px-6 py-4">
        <LeadTable
          leads={leads}
          loading={loading}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onSort={handleSort}
          sortField={sortField}
          sortDir={sortDir}
          onStatusChange={handleStatusChange}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
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
