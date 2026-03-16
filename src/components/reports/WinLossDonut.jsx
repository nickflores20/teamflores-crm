import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-sm font-semibold text-ink">{payload[0].name}</p>
      <p className="text-xs text-ink-secondary">{payload[0].value} leads · {payload[0].payload.pct}%</p>
    </div>
  )
}

export default function WinLossDonut({ leads }) {
  const closed = leads.filter(l => l['Status'] === 'Closed').length
  const lost   = leads.filter(l => l['Status'] === 'Lost').length
  const active = leads.filter(l => !['Closed', 'Lost'].includes(l['Status'])).length
  const total  = leads.length || 1

  const data = [
    { name: 'Closed', value: closed, pct: Math.round((closed / total) * 100) },
    { name: 'Active',  value: active,  pct: Math.round((active  / total) * 100) },
    { name: 'Lost',   value: lost,   pct: Math.round((lost   / total) * 100) },
  ].filter(d => d.value > 0)

  const COLORS = { Closed: '#22C55E', Active: '#C6A76F', Lost: '#EF4444' }

  const winRate = total > 0 ? Math.round(((closed) / (closed + lost || 1)) * 100) : 0

  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={60} innerRadius={38} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              {data.map(entry => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-3">
        <div className="text-center">
          <p className="text-3xl font-serif font-semibold text-green-600">{winRate}%</p>
          <p className="text-xs text-ink-muted">Close Rate</p>
        </div>
        {data.map(d => (
          <div key={d.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[d.name] }} />
              <span className="text-ink-secondary">{d.name}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-ink">{d.value}</span>
              <span className="text-ink-muted ml-1 text-xs">({d.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
