import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { useState } from 'react'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']

export default function BulkActionsBar({ count, onChangeStatus, onExport, onDelete, onClear }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-navy-800 text-white rounded-xl px-4 py-2.5 shadow-floating"
        >
          <span className="text-sm font-semibold whitespace-nowrap text-white/80 mr-1">
            {count} selected
          </span>
          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Change Status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm transition-colors"
            >
              Change Status
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <AnimatePresence>
              {showStatusMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute bottom-full mb-2 left-0 bg-white border border-surface-border rounded-xl shadow-card-lg overflow-hidden min-w-[148px]"
                >
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => { onChangeStatus(s); setShowStatusMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-secondary transition-colors text-left"
                    >
                      <Badge status={s} size="xs" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onExport}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onClear}
            className="p-1.5 text-white/40 hover:text-white/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
