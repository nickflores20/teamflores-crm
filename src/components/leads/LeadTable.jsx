import Checkbox from '../ui/Checkbox.jsx'
import LeadRow from './LeadRow.jsx'
import { SkeletonTable } from '../ui/Skeleton.jsx'

function SortHeader({ label, field, sortField, sortDir, onSort, className = '' }) {
  const active = sortField === field
  return (
    <th
      className={`py-3 pr-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider cursor-pointer hover:text-ink-secondary transition-colors select-none whitespace-nowrap ${className}`}
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`text-gold transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}>
          {sortDir === 'asc' ? '↑' : '↓'}
        </span>
      </span>
    </th>
  )
}

export default function LeadTable({
  leads,
  loading,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onSort,
  sortField,
  sortDir,
  onStatusChange,
  totalCount,
  page,
  totalPages,
  pageSize,
  onPageChange,
}) {
  const allSelected  = leads.length > 0 && leads.every(l => selectedIds.includes(l.rowNumber))
  const someSelected = leads.some(l => selectedIds.includes(l.rowNumber)) && !allSelected

  return (
    <div className="flex flex-col bg-white rounded-lg border border-surface-border overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          {/* Sticky header */}
          <thead className="bg-surface-secondary border-b-2 border-navy-800/20 sticky top-0 z-10">
            <tr>
              <th className="pl-4 py-3 w-10">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onSelectAll} />
              </th>
              <SortHeader label="Name"       field="First Name"   sortField={sortField} sortDir={sortDir} onSort={onSort} />
              <th className="py-3 pr-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider hidden md:table-cell whitespace-nowrap">Phone</th>
              <th className="py-3 pr-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider hidden lg:table-cell">Email</th>
              <th className="py-3 pr-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</th>
              <th className="py-3 pr-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider hidden lg:table-cell whitespace-nowrap">Loan Type</th>
              <SortHeader label="Price"      field="Purchase Price" sortField={sortField} sortDir={sortDir} onSort={onSort} className="hidden xl:table-cell" />
              <SortHeader label="Date Added" field="Submitted At"   sortField={sortField} sortDir={sortDir} onSort={onSort} className="hidden xl:table-cell" />
              <th className="py-3 pr-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider hidden 2xl:table-cell">Source</th>
              <th className="py-3 pr-4 w-10" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10}>
                  <SkeletonTable rows={8} />
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-ink-muted text-sm">
                  No leads match your filters.
                </td>
              </tr>
            ) : (
              leads.map((lead, i) => (
                <LeadRow
                  key={lead.rowNumber}
                  lead={lead}
                  index={i}
                  selected={selectedIds.includes(lead.rowNumber)}
                  onSelect={() => onSelectRow(lead.rowNumber)}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalCount > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border bg-surface-secondary text-sm text-ink-secondary">
          <span className="text-xs text-ink-muted">
            {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} leads
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-surface-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-ink-secondary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    page === p
                      ? 'bg-navy-800 text-white'
                      : 'text-ink-secondary hover:bg-surface-border'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-surface-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-ink-secondary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
