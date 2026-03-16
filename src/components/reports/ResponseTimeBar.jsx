import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

// Estimate response time from "Submitted At" to first note timestamp
function getResponseHours(lead) {
  const submitted = lead['Submitted At'] || lead['Date']
  if (!submitted) return null
  const notes = lead['Notes']
  if (!notes) return null
  // Find first timestamped note
  const lines = notes.split('\n').filter(Boolean)
  for (const line of lines) {
    const match = line.match(/^\[(\d{4}-\d{2}-\d{2}[^\]]*)\]/)
    if (match) {
      const noteDate = new Date(match[1])
      const subDate  = new Date(submitted)
      if (!isNaN(noteDate) && !isNaN(subDate) && noteDate > subDate) {
        const hrs = (noteDate - subDate) / (1000 * 60 * 60)
        return hrs
      }
    }
  }
  return null
}

const BUCKETS = [
  { label: '<1h',   min: 0,  max: 1 },
  { label: '1–4h',  min: 1,  max: 4 },
  { label: '4–24h', min: 4,  max: 24 },
  { label: '1–3d',  min: 24, max: 72 },
  { label: '3–7d',  min: 72, max: 168 },
  { label: '>7d',   min: 168, max: Infinity },
]

const BUCKET_COLORS = ['#22C55E', '#4ADE80', '#F59E0B', '#F97316', '#EF4444', '#9F1239']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { label, count } = payload[0].payload
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted">Response Time</p>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="text-xs text-gold font-medium">{count} leads</p>
    </div>
  )
}

export default function ResponseTimeBar({ leads }) {
  const counts = BUCKETS.map(b => ({ ...b, count: 0 }))

  leads.forEach(l => {
    const hrs = getResponseHours(l)
    if (hrs === null) return
    const bucket = counts.find(b => hrs >= b.min && hrs < b.max)
    if (bucket) bucket.count++
  })

  const data = counts.filter(b => b.count > 0)

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-ink-muted text-sm">No response data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="label" tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={entry.label} fill={BUCKET_COLORS[counts.indexOf(entry)]} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
