import { useMemo } from 'react'
import { useLeadsContext, getFullName } from '../context/LeadsContext.jsx'

/**
 * Returns filtered, sorted, and paginated leads from LeadsContext.
 * All filtering logic is centralized here.
 */
export function useLeads({
  searchQuery = '',
  statusFilter = [],
  loanTypeFilter = [],
  sourceFilter = [],
  dateFrom = '',
  dateTo = '',
  sortField = 'Submitted At',
  sortDir = 'desc',
  page = 1,
  pageSize = 25,
} = {}) {
  const { leads, loading, error, lastFetched, pendingUpdates, fetchLeads, addLead, updateLead, setLeadStatus, addNote } = useLeadsContext()

  const filtered = useMemo(() => {
    let result = [...leads]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(l =>
        getFullName(l).toLowerCase().includes(q) ||
        (l['Email'] || '').toLowerCase().includes(q) ||
        (l['Phone'] || '').includes(q) ||
        (l['Zip Code'] || '').includes(q)
      )
    }

    // Status filter
    if (statusFilter.length > 0) {
      result = result.filter(l => statusFilter.includes(l['Status']))
    }

    // Loan type filter
    if (loanTypeFilter.length > 0) {
      result = result.filter(l => loanTypeFilter.includes(l['Loan Type']))
    }

    // Source filter
    if (sourceFilter.length > 0) {
      result = result.filter(l => sourceFilter.includes(l['How Found']))
    }

    // Date range
    if (dateFrom) {
      result = result.filter(l => {
        const d = (l['Submitted At'] || l['Date'] || '').slice(0, 10)
        return d >= dateFrom
      })
    }
    if (dateTo) {
      result = result.filter(l => {
        const d = (l['Submitted At'] || l['Date'] || '').slice(0, 10)
        return d <= dateTo
      })
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField] ?? ''
      let bVal = b[sortField] ?? ''

      if (sortField === 'Submitted At' || sortField === 'Date') {
        aVal = new Date(aVal).getTime() || 0
        bVal = new Date(bVal).getTime() || 0
      } else if (sortField === 'Purchase Price') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      } else {
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [leads, searchQuery, statusFilter, loanTypeFilter, sourceFilter, dateFrom, dateTo, sortField, sortDir])

  const totalCount = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return {
    leads: paginated,
    allFilteredLeads: filtered,
    totalCount,
    totalPages,
    loading,
    error,
    lastFetched,
    pendingUpdates,
    fetchLeads,
    addLead,
    updateLead,
    setLeadStatus,
    addNote,
  }
}
