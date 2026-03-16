import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

const CREDIT_ORDER = ['Below 580', '580-619', '620-659', '660-699', '700-719', '720-759', '760+']
const RANGE_COLORS = {
  'Below 580': '#EF4444',
  '580-619':   '#F97316',
  '620-659':   '#F59E0B',
  '660-699':   '#D4B87A',
  '700-719':   '#C6A76F',
  '720-759':   '#4ADE80',
  '760+':      '#22C55E',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { range, count } = payload[0].payload
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted">Credit Score</p>
      <p className="text-sm font-semibold text-ink">{range}</p>
      <p className="text-xs text-gold font-medium">{count} leads</p>
    </div>
  )
}

export default function CreditScoreBar({ leads }) {
  const buckets = {}
  leads.forEach(l => {
    const score = l['Credit Score']
    if (!score) return
    const scoreNum = parseInt(score)
    let range
    if (!isNaN(scoreNum)) {
      if (scoreNum < 580) range = 'Below 580'
      else if (scoreNum < 620) range = '580-619'
      else if (scoreNum < 660) range = '620-659'
      else if (scoreNum < 700) range = '660-699'
      else if (scoreNum < 720) range = '700-719'
      else if (scoreNum < 760) range = '720-759'
      else range = '760+'
    } else {
      range = CREDIT_ORDER.includes(score) ? score : score
    }
    buckets[range] = (buckets[range] || 0) + 1
  })

  const data = CREDIT_ORDER
    .map(range => ({ range, count: buckets[range] || 0 }))
    .filter(d => d.count > 0)

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-ink-muted text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="range" tick={{ fill: '#A0AEC0', fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map(entry => (
            <Cell key={entry.range} fill={RANGE_COLORS[entry.range] || '#C6A76F'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
