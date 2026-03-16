import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useSearch } from '../../hooks/useSearch.js'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import { getFullName } from '../../api/mockData.js'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const results = useSearch(query)

  // Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Auto-focus on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Arrow keys + Enter
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        navigate(`/people/${results[activeIndex].rowNumber}`)
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, results, activeIndex, navigate])

  const handleSelect = useCallback((lead) => {
    navigate(`/people/${lead.rowNumber}`)
    setOpen(false)
  }, [navigate])

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-navy-900 border border-gold/20 rounded-2xl shadow-floating overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
                <svg className="w-4 h-4 text-gold/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIndex(0) }}
                  placeholder="Search leads by name, email, phone..."
                  className="flex-1 bg-transparent text-sand placeholder:text-sand/30 text-sm focus:outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white/8 rounded-md text-sand/30 text-xs">
                  Esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {query.length === 0 ? (
                  <div className="px-4 py-4 text-center">
                    <p className="text-xs text-sand/30">Start typing to search leads</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-sand/40">No leads found for "<span className="text-sand/60">{query}</span>"</p>
                  </div>
                ) : (
                  results.map((lead, i) => (
                    <button
                      key={lead.rowNumber}
                      onClick={() => handleSelect(lead)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        i === activeIndex ? 'bg-gold/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <Avatar name={getFullName(lead)} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sand truncate">{getFullName(lead)}</p>
                        <p className="text-xs text-sand/40 truncate">{lead['Email'] || lead['Phone'] || ''}</p>
                      </div>
                      <Badge status={lead['Status']} size="xs" />
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-white/8">
                <span className="flex items-center gap-1.5 text-xs text-sand/25">
                  <kbd className="bg-white/8 px-1.5 py-0.5 rounded text-sand/35">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1.5 text-xs text-sand/25">
                  <kbd className="bg-white/8 px-1.5 py-0.5 rounded text-sand/35">↵</kbd> open
                </span>
                <span className="flex items-center gap-1.5 text-xs text-sand/25 ml-auto">
                  <kbd className="bg-white/8 px-1.5 py-0.5 rounded text-sand/35">⌘K</kbd> toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
