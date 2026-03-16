// Horizontal conversion funnel showing drop-off between stages

const STAGES = ['New', 'Contacted', 'Qualified', 'Closed']
const STAGE_COLORS = {
  New:       '#94A3B8',
  Contacted: '#3B82F6',
  Qualified: '#C6A76F',
  Closed:    '#22C55E',
}

export default function ConversionFunnel({ leads }) {
  const counts = STAGES.map(s => ({
    stage: s,
    count: leads.filter(l => l['Status'] === s || (s === 'New' && !l['Status'])).length,
    color: STAGE_COLORS[s],
  }))

  // Cumulative: each stage = all leads that reached at least this stage
  // Use simple per-status count for simplicity
  const maxCount = Math.max(1, counts[0].count || leads.length)

  return (
    <div className="space-y-2.5">
      {counts.map((stage, i) => {
        const width = Math.max(10, (stage.count / maxCount) * 100)
        const prevCount = i > 0 ? counts[i - 1].count : null
        const dropPct = prevCount && prevCount > 0
          ? Math.round(((prevCount - stage.count) / prevCount) * 100)
          : null

        return (
          <div key={stage.stage}>
            {dropPct !== null && (
              <div className="flex items-center gap-2 ml-2 mb-1">
                <span className="text-[10px] text-red-400">▼ {dropPct}% drop-off</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0 text-right">
                <span className="text-xs font-medium text-ink-secondary">{stage.stage}</span>
              </div>
              <div className="flex-1 relative h-8 bg-surface-secondary rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${width}%`, backgroundColor: stage.color, opacity: 0.85 }}
                >
                  <span className="text-xs font-bold text-white">{stage.count}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
