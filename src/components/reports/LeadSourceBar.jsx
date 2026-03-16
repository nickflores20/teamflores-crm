import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PALETTE = ['#C6A76F', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444', '#F59E0B', '#14B8A6', '#EC4899', '#6366F1', '#84CC16']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { source, count } = payload[0].payload
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted">{source || 'Unknown'}</p>
      <p className="text-sm font-semibold text-ink">{count} leads</p>
    </div>
  )
}

export default function LeadSourceBar({ leads }) {
  const buckets = {}
  leads.forEach(l => {
    const src = l['How Found'] || 'Unknown'
    buckets[src] = (buckets[src] || 0) + 1
  })

  const data = Object.entries(buckets)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-ink-muted text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 32)}>
      <BarChart layout="vertical" data={data} margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="source" width={90} tick={{ fill: '#4A5568', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={entry.source} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
