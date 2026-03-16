import { motion, AnimatePresence } from 'framer-motion'
import Checkbox from '../ui/Checkbox.jsx'
import Button from '../ui/Button.jsx'

const STATUSES   = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']
const LOAN_TYPES = ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo']
const SOURCES    = ['Google', 'Facebook', 'Instagram', 'Referral', 'Rebel Path', 'Other']

function FilterGroup({ title, options, selected, onChange }) {
  const toggle = (v) => onChange(
    selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]
  )
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2.5">{title}</p>
      <div className="flex flex-col gap-2.5">
        {options.map(opt => (
          <Checkbox
            key={opt}
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            label={opt}
          />
        ))}
      </div>
    </div>
  )
}

export default function LeadFilters({ isOpen, filters, onChange, onReset, onClose }) {
  const set = (key) => (val) => onChange({ ...filters, [key]: val })

  const activeCount = [
    filters.statusFilter?.length,
    filters.loanTypeFilter?.length,
    filters.sourceFilter?.length,
    filters.dateFrom ? 1 : 0,
    filters.dateTo   ? 1 : 0,
  ].filter(Boolean).reduce((a, b) => a + b, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-72 bg-white border-l border-surface-border z-40 flex flex-col shadow-card-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-navy-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Filters</span>
                {activeCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gold/30 text-gold rounded-full">
                    {activeCount}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterGroup title="Status"    options={STATUSES}   selected={filters.statusFilter   || []} onChange={set('statusFilter')}   />
              <FilterGroup title="Loan Type" options={LOAN_TYPES} selected={filters.loanTypeFilter || []} onChange={set('loanTypeFilter')} />
              <FilterGroup title="Source"    options={SOURCES}    selected={filters.sourceFilter   || []} onChange={set('sourceFilter')}   />

              {/* Date range */}
              <div className="mb-5">
                <p className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-2.5">Date Range</p>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-xs text-ink-muted mb-1 block">From</label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={e => set('dateFrom')(e.target.value)}
                      className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ink-muted mb-1 block">To</label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={e => set('dateTo')(e.target.value)}
                      className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-surface-border px-5 py-4 flex gap-3 flex-shrink-0">
              <Button variant="ghost" size="sm" fullWidth onClick={onReset}>Clear all</Button>
              <Button variant="gold"  size="sm" fullWidth onClick={onClose}>Apply</Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
