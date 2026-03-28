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

const NAVY  = '#1A3E61'
const GOLD  = '#C6A76F'
const SAND  = '#F0E6D2'

const DEFAULT_FILTERS = {
  statusFilter: [],
  loanTypeFilter: [],
  sourceFilter: [],
  dateFrom: '',
  dateTo: '',
}

// ─── Smart list definitions ──────────────────────────────────────────────────
const BUILT_IN_SMART_LISTS = [
  {
    key:     'new_today',
    label:   'New Today',
    icon:    '🔴',
    desc:    'Stage=New, submitted last 24hrs',
    color:   '#EF4444',
    filter:  (leads) => leads.filter(l => {
      if (l['Status'] !== 'New') return false
      const sub = l['Submitted At'] || l['Date'] || ''
      return sub && (Date.now() - new Date(sub).getTime()) < 24 * 3600 * 1000
    }),
  },
  {
    key:     'need_contact',
    label:   'Need Contact',
    icon:    '🟠',
    desc:    'Stage=New, >24hrs, no outbound',
    color:   '#F97316',
    filter:  (leads) => leads.filter(l => {
      if (l['Status'] !== 'New') return false
      const sub = l['Submitted At'] || l['Date'] || ''
      if (!sub || (Date.now() - new Date(sub).getTime()) < 24 * 3600 * 1000) return false
      try {
        const events = JSON.parse(localStorage.getItem(`crm_timeline_${l.rowNumber}`) || '[]')
        const hasOutbound = events.some(e => ['text_sent', 'email_sent', 'call'].includes(e.type))
        return !hasOutbound
      } catch { return true }
    }),
  },
  {
    key:     'active_followup',
    label:   'Active Follow Up',
    icon:    '🟡',
    desc:    'Stage=Active, last contact >3 days',
    color:   '#EAB308',
    filter:  (leads) => leads.filter(l => {
      if (l['Status'] !== 'Active') return false
      try {
        const events = JSON.parse(localStorage.getItem(`crm_timeline_${l.rowNumber}`) || '[]')
        const contacts = events.filter(e => ['text_sent','email_sent','call','text_received','email_received'].includes(e.type))
        if (contacts.length === 0) return true
        const latest = contacts.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b)
        return (Date.now() - new Date(latest.timestamp).getTime()) > 3 * 24 * 3600 * 1000
      } catch { return true }
    }),
  },
  {
    key:     'cold_reactivate',
    label:   'Cold – Reactivate',
    icon:    '🔵',
    desc:    'Stage=Cold, needs reactivation',
    color:   '#3B82F6',
    filter:  (leads) => leads.filter(l => l['Status'] === 'Cold'),
  },
  {
    key:     'pipeline',
    label:   'Pipeline',
    icon:    '🟢',
    desc:    'Stage=Qualified or In Progress',
    color:   '#22C55E',
    filter:  (leads) => leads.filter(l => ['Qualified', 'In Progress'].includes(l['Status'])),
  },
  {
    key:     'stale',
    label:   'Stale',
    icon:    '⚫',
    desc:    'New or Contacted, created >10 days ago',
    color:   '#64748B',
    filter:  (leads) => leads.filter(l => {
      if (!['New', 'Contacted'].includes(l['Status'])) return false
      const sub = l['Submitted At'] || l['Date'] || ''
      return sub && (Date.now() - new Date(sub).getTime()) > 10 * 24 * 3600 * 1000
    }),
  },
  {
    key:     'all',
    label:   'All Leads',
    icon:    '📋',
    desc:    'Everything except Dead',
    color:   NAVY,
    filter:  (leads) => leads.filter(l => l['Status'] !== 'Dead'),
  },
]

export default function People() {
  const [filters, setFilters]            = useState(DEFAULT_FILTERS)
  const [searchQuery, setSearchQuery]    = useState('')
  const [sortField, setSortField]        = useState('Submitted At')
  const [sortDir, setSortDir]            = useState('desc')
  const [page, setPage]                  = useState(1)
  const [filtersOpen, setFiltersOpen]    = useState(false)
  const [selectedIds, setSelectedIds]    = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [activeSmartList, setActiveSmartList] = useState('all')
  const [customLists, setCustomLists]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('tf_custom_smart_lists') || '[]') }
    catch { return [] }
  })
  const [showAddList, setShowAddList]    = useState(false)
  const [newListName, setNewListName]    = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { addToast } = useToast()
  const { tasks }    = useTasksContext()
  const { leads: allLeadsRaw } = useLeadsContext()

  const { leads, allFilteredLeads, totalCount, totalPages, loading, error, setLeadStatus } = useLeads({
    searchQuery, ...filters, sortField, sortDir, page, pageSize: 25,
  })
  const { allFilteredLeads: allLeads } = useLeads({})

  // ─── Smart list counts ──────────────────────────────────────────────────────
  const smartCounts = useMemo(() => {
    const counts = {}
    BUILT_IN_SMART_LISTS.forEach(list => {
      counts[list.key] = list.filter(allLeadsRaw).length
    })
    return counts
  }, [allLeadsRaw])

  // ─── Apply smart list ────────────────────────────────────────────────────────
  const [smartOverrideLeads, setSmartOverrideLeads] = useState(null)

  const handleSmartList = useCallback((key) => {
    setActiveSmartList(key)
    setFilters(DEFAULT_FILTERS)
    setPage(1)
    const list = BUILT_IN_SMART_LISTS.find(l => l.key === key)
    if (list) {
      setSmartOverrideLeads(list.filter(allLeadsRaw))
    } else {
      setSmartOverrideLeads(null)
    }
  }, [allLeadsRaw])

  // Re-apply when allLeadsRaw changes
  useMemo(() => {
    if (activeSmartList) {
      const list = BUILT_IN_SMART_LISTS.find(l => l.key === activeSmartList)
      if (list) setSmartOverrideLeads(list.filter(allLeadsRaw))
    }
  }, [allLeadsRaw, activeSmartList])

  const displayLeads  = smartOverrideLeads ?? leads
  const displayTotal  = smartOverrideLeads ? smartOverrideLeads.length : totalCount
  const displayPages  = smartOverrideLeads ? 1 : totalPages

  const activeListMeta = BUILT_IN_SMART_LISTS.find(l => l.key === activeSmartList)

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field }
      setSortDir('asc'); return field
    })
    setPage(1)
  }, [])

  const handleSelectAll   = () => {
    if (leads.every(l => selectedIds.includes(l.rowNumber))) {
      setSelectedIds(prev => prev.filter(id => !leads.map(l => l.rowNumber).includes(id)))
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...leads.map(l => l.rowNumber)])])
    }
  }
  const handleSelectRow   = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const handleStatusChange = async (rowNumber, status) => {
    try { await setLeadStatus(rowNumber, status); addToast({ type: 'success', message: `Stage → ${status}` }) }
    catch { addToast({ type: 'error', message: 'Failed to update' }) }
  }
  const handleBulkStatus  = async (status) => {
    await Promise.allSettled(selectedIds.map(id => setLeadStatus(id, status)))
    addToast({ type: 'success', message: `${selectedIds.length} leads → ${status}` })
    setSelectedIds([])
  }
  const handleBulkExport  = () => {
    const sel = allLeads.filter(l => selectedIds.includes(l.rowNumber))
    exportLeadsToCSV(sel, `leads_selected_${todayISO()}.csv`)
  }
  const handleBulkDelete  = () => setDeleteConfirm(true)
  const confirmDelete     = () => { addToast({ type: 'info', message: 'Delete coming soon.' }); setDeleteConfirm(false); setSelectedIds([]) }
  const handleFiltersChange = (f) => { setFilters(f); setPage(1); setActiveSmartList(null); setSmartOverrideLeads(null) }

  const saveCustomList = () => {
    if (!newListName.trim()) return
    const newList = { key: `custom_${Date.now()}`, label: newListName.trim(), icon: '📌', color: GOLD }
    const updated = [...customLists, newList]
    setCustomLists(updated)
    localStorage.setItem('tf_custom_smart_lists', JSON.stringify(updated))
    setNewListName('')
    setShowAddList(false)
  }

  const removeCustomList = (key) => {
    const updated = customLists.filter(l => l.key !== key)
    setCustomLists(updated)
    localStorage.setItem('tf_custom_smart_lists', JSON.stringify(updated))
    if (activeSmartList === key) handleSmartList('all')
  }

  const activeFilterCount = Object.values(filters).flat().filter(Boolean).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex h-full overflow-hidden"
    >
      {/* ─── Left Smart List Sidebar ────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col bg-white border-r overflow-y-auto transition-all duration-200"
        style={{
          width: sidebarCollapsed ? '48px' : '220px',
          borderColor: '#E2E8F0',
        }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
          {!sidebarCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>Smart Lists</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors ml-auto"
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {sidebarCollapsed
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />}
            </svg>
          </button>
        </div>

        {/* Built-in lists */}
        <div className="flex flex-col py-2">
          {BUILT_IN_SMART_LISTS.map(list => {
            const count    = smartCounts[list.key] ?? 0
            const isActive = activeSmartList === list.key
            return (
              <button
                key={list.key}
                onClick={() => handleSmartList(list.key)}
                title={sidebarCollapsed ? list.label : list.desc}
                className="flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#F8FAFC] rounded-lg mx-1.5 group"
                style={isActive ? { backgroundColor: '#F0E6D2', borderLeft: `3px solid ${GOLD}` } : { borderLeft: '3px solid transparent' }}
              >
                <span className="text-base flex-shrink-0">{list.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span
                      className="flex-1 text-xs font-semibold truncate"
                      style={{ color: isActive ? NAVY : '#475569' }}
                    >
                      {list.label}
                    </span>
                    {count > 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={isActive
                          ? { backgroundColor: GOLD, color: 'white' }
                          : count > 3 && (list.key === 'new_today' || list.key === 'need_contact')
                            ? { backgroundColor: '#FEE2E2', color: '#DC2626' }
                            : { backgroundColor: '#F1F5F9', color: '#64748B' }
                        }
                      >
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Custom lists */}
        {!sidebarCollapsed && customLists.length > 0 && (
          <>
            <div className="px-3 py-2 border-t" style={{ borderColor: '#F1F5F9' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">My Lists</span>
            </div>
            <div className="flex flex-col py-1">
              {customLists.map(list => {
                const isActive = activeSmartList === list.key
                return (
                  <div key={list.key} className="flex items-center gap-1 mx-1.5 group">
                    <button
                      onClick={() => { setActiveSmartList(list.key); setSmartOverrideLeads(null); setFilters(DEFAULT_FILTERS) }}
                      className="flex-1 flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#F8FAFC] rounded-lg"
                      style={isActive ? { backgroundColor: '#F0E6D2' } : {}}
                    >
                      <span className="text-base">{list.icon}</span>
                      <span className="text-xs font-semibold truncate" style={{ color: isActive ? NAVY : '#475569' }}>{list.label}</span>
                    </button>
                    <button
                      onClick={() => removeCustomList(list.key)}
                      className="p-1 rounded text-[#CBD5E1] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Add custom list */}
        {!sidebarCollapsed && (
          <div className="mt-auto border-t px-3 py-3" style={{ borderColor: '#F1F5F9' }}>
            {showAddList ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveCustomList(); if (e.key === 'Escape') setShowAddList(false) }}
                  placeholder="List name…"
                  className="w-full text-xs px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A76F]/40"
                  style={{ borderColor: '#E2E8F0' }}
                />
                <div className="flex gap-1">
                  <button onClick={saveCustomList} className="flex-1 text-[11px] font-semibold py-1 rounded-lg text-white transition-opacity hover:opacity-90" style={{ backgroundColor: GOLD }}>Save</button>
                  <button onClick={() => setShowAddList(false)} className="flex-1 text-[11px] font-semibold py-1 rounded-lg border transition-colors hover:bg-[#F8FAFC]" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddList(true)}
                className="w-full flex items-center gap-2 text-xs font-semibold rounded-lg py-1.5 px-2 border transition-colors hover:bg-[#F8FAFC]"
                style={{ borderColor: '#E2E8F0', color: '#94A3B8', borderStyle: 'dashed' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New List
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Main content area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 lg:px-6 py-4 border-b bg-white flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
          {/* Active list pill */}
          {activeListMeta && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0"
              style={{ backgroundColor: activeListMeta.color + '18', color: activeListMeta.color, borderColor: activeListMeta.color + '40' }}
            >
              <span>{activeListMeta.icon}</span>
              <span>{activeListMeta.label}</span>
            </div>
          )}

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder="Search name, email, phone…"
              className="w-full bg-white border rounded-lg pl-9 pr-4 py-2 text-sm placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#C6A76F]/30 focus:border-[#C6A76F]/50 transition-colors"
              style={{ borderColor: '#E2E8F0', color: '#1E293B' }}
            />
          </div>

          <span className="text-sm whitespace-nowrap" style={{ color: '#64748B' }}>
            {displayTotal} {displayTotal === 1 ? 'person' : 'people'}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <ExportButton leads={allLeads} filteredLeads={allFilteredLeads} />
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
              style={activeFilterCount > 0
                ? { borderColor: '#F5C842', backgroundColor: '#FEFCE8', color: '#A16207' }
                : { borderColor: '#E2E8F0', color: '#475569', backgroundColor: 'white' }
              }
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full" style={{ backgroundColor: '#FDE68A', color: '#92400E' }}>
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
            page={smartOverrideLeads ? 1 : page}
            totalPages={displayPages}
            pageSize={25}
            onPageChange={setPage}
          />
        </div>
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
