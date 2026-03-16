import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const PALETTE = ['#C6A76F', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444', '#F59E0B', '#14B8A6']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted">{payload[0].name}</p>
      <p className="text-sm font-semibold text-ink">{payload[0].value} leads</p>
      <p className="text-xs text-ink-secondary">{payload[0].payload.pct}%</p>
    </div>
  )
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }) => {
  if (pct < 5) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {pct}%
    </text>
  )
}

export default function LoanTypePie({ leads }) {
  const total = leads.length || 1
  const buckets = {}
  leads.forEach(l => {
    const type = l['Loan Type'] || 'Unknown'
    buckets[type] = (buckets[type] || 0) + 1
  })

  const data = Object.entries(buckets)
    .map(([name, value]) => ({ name, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-ink-muted text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={80}
          innerRadius={40}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: '#4A5568', fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
