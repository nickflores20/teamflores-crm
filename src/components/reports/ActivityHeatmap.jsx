import { useMemo } from 'react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['S','M','T','W','T','F','S']

function getIntensity(count, max) {
  if (count === 0) return 0
  const pct = count / max
  if (pct > 0.75) return 4
  if (pct > 0.5)  return 3
  if (pct > 0.25) return 2
  return 1
}

const CELL_CLASSES = [
  'bg-surface-tertiary',
  'bg-gold/20',
  'bg-gold/40',
  'bg-gold/65',
  'bg-gold',
]

export default function ActivityHeatmap({ leads }) {
  const { weeks, months, maxCount } = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setFullYear(start.getFullYear() - 1)
    // align to Sunday
    start.setDate(start.getDate() - start.getDay())

    const counts = {}
    leads.forEach(l => {
      const raw = l['Date'] || l['Submitted At'] || l['Date Submitted']
      if (!raw) return
      const d = new Date(raw)
      if (isNaN(d)) return
      const key = d.toISOString().slice(0, 10)
      counts[key] = (counts[key] || 0) + 1
    })

    const weeks = []
    const monthLabels = []
    let cur = new Date(start)
    let lastMonth = -1

    while (cur <= today) {
      const week = []
      const weekStart = new Date(cur)
      for (let d = 0; d < 7; d++) {
        const key = cur.toISOString().slice(0, 10)
        week.push({ date: key, count: counts[key] || 0, future: cur > today })
        cur.setDate(cur.getDate() + 1)
      }
      weeks.push(week)
      const wMonth = weekStart.getMonth()
      if (wMonth !== lastMonth) {
        monthLabels.push({ idx: weeks.length - 1, label: MONTHS[wMonth] })
        lastMonth = wMonth
      }
    }

    const maxCount = Math.max(1, ...Object.values(counts))
    return { weeks, months: monthLabels, maxCount }
  }, [leads])

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex gap-0.5 mb-1 ml-6">
        {months.map((m, i) => (
          <div
            key={i}
            className="text-[10px] text-ink-muted"
            style={{ width: (i < months.length - 1 ? (months[i+1].idx - m.idx) : (weeks.length - m.idx)) * 13 }}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-0.5">
          {DAYS.map((d, i) => (
            <span key={i} className="text-[9px] text-ink-muted w-4 h-[11px] flex items-center justify-center">
              {i % 2 === 1 ? d : ''}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={cell.future ? '' : `${cell.date}: ${cell.count} lead${cell.count !== 1 ? 's' : ''}`}
                  className={`w-[11px] h-[11px] rounded-[2px] transition-opacity ${cell.future ? 'opacity-0' : CELL_CLASSES[getIntensity(cell.count, maxCount)]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 ml-6">
        <span className="text-[10px] text-ink-muted">Less</span>
        {CELL_CLASSES.map((cls, i) => (
          <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-ink-muted">More</span>
      </div>
    </div>
  )
}
