import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PRESETS = [
  { label: 'Last 7 days',  days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year',    days: null, thisYear: true },
  { label: 'All time',     days: null, allTime: true },
]

function toISO(d) { return d.toISOString().slice(0, 10) }

function presetRange(preset) {
  const now = new Date()
  if (preset.allTime) return { from: '2020-01-01', to: toISO(now) }
  if (preset.thisYear) return { from: `${now.getFullYear()}-01-01`, to: toISO(now) }
  const from = new Date(now)
  from.setDate(from.getDate() - preset.days)
  return { from: toISO(from), to: toISO(now) }
}

export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState(value?.from || '')
  const [customTo, setCustomTo] = useState(value?.to || '')
  const [mode, setMode] = useState('preset')

  const activePreset = PRESETS.find(p => {
    const r = presetRange(p)
    return r.from === value?.from && r.to === value?.to
  })

  const label = activePreset
    ? activePreset.label
    : value?.from && value?.to
      ? `${value.from} → ${value.to}`
      : 'All time'

  const applyCustom = () => {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo })
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-surface-border rounded-lg text-sm text-ink-secondary hover:text-ink hover:border-gold/50 transition-colors shadow-sm"
      >
        <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        {label}
        <svg className="w-3 h-3 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-surface-border rounded-xl shadow-card-lg overflow-hidden min-w-[200px]"
            >
              {/* Tabs */}
              <div className="flex border-b border-surface-border">
                {['preset', 'custom'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                      mode === m ? 'text-gold border-b-2 border-gold' : 'text-ink-muted hover:text-ink-secondary'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {mode === 'preset' ? (
                <div className="py-1">
                  {PRESETS.map(preset => {
                    const isActive = activePreset?.label === preset.label
                    return (
                      <button
                        key={preset.label}
                        onClick={() => { onChange(presetRange(preset)); setOpen(false) }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'text-gold bg-gold/8 font-medium'
                            : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink'
                        }`}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-3 flex flex-col gap-2">
                  <div>
                    <label className="text-[10px] text-ink-muted uppercase tracking-wide">From</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={e => setCustomFrom(e.target.value)}
                      className="mt-0.5 w-full bg-white border border-surface-border rounded-lg px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-muted uppercase tracking-wide">To</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={e => setCustomTo(e.target.value)}
                      className="mt-0.5 w-full bg-white border border-surface-border rounded-lg px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
                    />
                  </div>
                  <button
                    onClick={applyCustom}
                    disabled={!customFrom || !customTo}
                    className="mt-1 w-full py-1.5 bg-gold text-white text-sm rounded-lg hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    Apply
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
