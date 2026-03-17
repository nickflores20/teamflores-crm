import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { formatCurrency } from '../lib/dateUtils.js'
import DateRangePicker from '../components/reports/DateRangePicker.jsx'
import LeadsOverTimeChart from '../components/reports/LeadsOverTimeChart.jsx'
import FunnelChart from '../components/reports/FunnelChart.jsx'
import LeadSourceBar from '../components/reports/LeadSourceBar.jsx'
import LoanTypePie from '../components/reports/LoanTypePie.jsx'
import CreditScoreBar from '../components/reports/CreditScoreBar.jsx'
import MonthlyGroupedBar from '../components/reports/MonthlyGroupedBar.jsx'
import ActivityHeatmap from '../components/reports/ActivityHeatmap.jsx'
import PipelineValueChart from '../components/reports/PipelineValueChart.jsx'
import WinLossDonut from '../components/reports/WinLossDonut.jsx'
import ResponseTimeBar from '../components/reports/ResponseTimeBar.jsx'
import ConversionFunnel from '../components/reports/ConversionFunnel.jsx'
import ReportsDataTable from '../components/reports/ReportsDataTable.jsx'

function getDefaultRange() {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 90)
  return {
    from: from.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  }
}

function ChartCard({ title, subtitle, children, className = '', fullWidth = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-surface-border rounded-xl shadow-card overflow-hidden ${fullWidth ? 'lg:col-span-2' : ''} ${className}`}
    >
      {/* Navy header */}
      <div className="px-4 py-3 bg-navy-800 flex items-start justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  )
}

const TREND = [
  { icon: '↑', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: '↓', color: 'text-red-500',   bg: 'bg-red-50' },
  { icon: '→', color: 'text-ink-muted', bg: 'bg-surface-secondary' },
]

function StatCard({ label, value, trend = 2, sub, color = 'text-ink', delay = 0 }) {
  const t = TREND[trend]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-surface-border rounded-xl px-4 py-4 shadow-card"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-ink-muted font-medium uppercase tracking-wide">{label}</p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${t.bg} ${t.color}`}>{t.icon}</span>
      </div>
      <p className={`text-2xl font-serif font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function Reports() {
  const { leads } = useLeadsContext()
  const [range, setRange] = useState(getDefaultRange)

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const raw = l['Date'] || l['Submitted At'] || l['Date Submitted']
      if (!raw) return true
      const d = new Date(raw).toISOString().slice(0, 10)
      return d >= range.from && d <= range.to
    })
  }, [leads, range])

  // ─── Speed to Lead ────────────────────────────────────────────────────────
  const speedToLeadHours = useMemo(() => {
    const contactedLeads = filteredLeads.filter(l =>
      ['Contacted', 'Qualified', 'Closed', 'Lost'].includes(l['Status'])
    )
    const times = contactedLeads.map(lead => {
      try {
        const events = JSON.parse(localStorage.getItem(`crm_timeline_${lead.rowNumber}`) || '[]')
        const firstContact = events
          .filter(e => ['email_sent', 'call', 'text_sent'].includes(e.type))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0]
        if (!firstContact) return null
        const submittedAt = lead['Submitted At'] || lead['Date']
        if (!submittedAt) return null
        const diffMs = new Date(firstContact.timestamp).getTime() - new Date(submittedAt).getTime()
        if (diffMs < 0) return null
        return diffMs / (1000 * 60 * 60)
      } catch { return null }
    }).filter(t => t !== null)
    if (times.length === 0) return null
    return times.reduce((a, b) => a + b, 0) / times.length
  }, [filteredLeads])

  function formatSpeedToLead(hours) {
    if (hours === null) return 'No data'
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    }
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  function speedTrend(hours) {
    if (hours === null) return 2
    if (hours < 1) return 0   // green — excellent
    if (hours <= 4) return 2  // neutral — good
    return 1                  // red — needs improvement
  }

  const totalLeads   = filteredLeads.length
  const closedLeads  = filteredLeads.filter(l => l['Status'] === 'Closed').length
  const activeLeads  = filteredLeads.filter(l => !['Closed', 'Lost'].includes(l['Status'])).length
  const lostLeads    = filteredLeads.filter(l => l['Status'] === 'Lost').length
  const winRate      = (closedLeads + lostLeads) > 0
    ? Math.round((closedLeads / (closedLeads + lostLeads)) * 100)
    : 0
  const pipelineVal  = filteredLeads
    .filter(l => !['Closed', 'Lost'].includes(l['Status']))
    .reduce((sum, l) => sum + (Number(String(l['Purchase Price']).replace(/[^0-9.-]/g, '')) || 0), 0)
  const avgPrice     = totalLeads > 0
    ? filteredLeads.reduce((sum, l) => sum + (Number(String(l['Purchase Price']).replace(/[^0-9.-]/g, '')) || 0), 0) / totalLeads
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-y-auto bg-surface-secondary"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-surface-border bg-white flex-shrink-0">
        <div>
          <h1 className="text-base font-serif font-semibold text-ink">Reports</h1>
          <p className="text-xs text-ink-muted mt-0.5">{filteredLeads.length} leads in selected period</p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="flex-1 px-4 lg:px-6 py-6 space-y-6">

        {/* Hero stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <StatCard label="Total Leads"    value={totalLeads}              color="text-ink"        trend={2} delay={0}    sub="in period" />
          <StatCard label="Active Deals"   value={activeLeads}             color="text-blue-600"   trend={0} delay={0.04} sub="in pipeline" />
          <StatCard label="Closed"         value={closedLeads}             color="text-green-600"  trend={0} delay={0.08} sub="won" />
          <StatCard label="Win Rate"       value={`${winRate}%`}           color="text-gold"       trend={winRate >= 20 ? 0 : 1} delay={0.12} sub={`${lostLeads} lost`} />
          <StatCard label="Pipeline Value" value={formatCurrency(pipelineVal)} color="text-navy-800"  trend={0} delay={0.16} sub="active" />
          <StatCard label="Avg Deal Size"  value={formatCurrency(avgPrice)} color="text-ink"       trend={2} delay={0.20} sub="per lead" />
          <StatCard
            label="Speed to Lead"
            value={formatSpeedToLead(speedToLeadHours)}
            color={speedToLeadHours === null ? 'text-ink-muted' : speedToLeadHours < 1 ? 'text-green-600' : speedToLeadHours <= 4 ? 'text-gold' : 'text-red-500'}
            trend={speedTrend(speedToLeadHours)}
            delay={0.24}
            sub={speedToLeadHours === null ? 'no contacts yet' : speedToLeadHours < 1 ? 'excellent' : speedToLeadHours <= 4 ? 'good' : 'needs improvement'}
          />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <ChartCard title="Leads Over Time" subtitle="Weekly lead volume — area chart">
            <LeadsOverTimeChart leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Pipeline Value" subtitle="Active deal value by month">
            <PipelineValueChart leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Conversion Funnel" subtitle="Drop-off at each stage" fullWidth>
            <ConversionFunnel leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Status Distribution" subtitle="Count by status">
            <FunnelChart leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Win / Loss Analysis" subtitle="Close rate breakdown">
            <WinLossDonut leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Lead Sources" subtitle="How leads found you">
            <LeadSourceBar leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Loan Types" subtitle="Mix by loan category">
            <LoanTypePie leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Credit Score Distribution" subtitle="Quality profile — color coded">
            <CreditScoreBar leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Response Time" subtitle="How quickly leads were first contacted">
            <ResponseTimeBar leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Monthly Activity" subtitle="Stacked by status — last 12 months">
            <MonthlyGroupedBar leads={filteredLeads} />
          </ChartCard>

          {/* Activity Heatmap — full width */}
          <ChartCard
            title="Activity Heatmap"
            subtitle="Lead submissions over the past 12 months"
            fullWidth
          >
            <ActivityHeatmap leads={leads} />
          </ChartCard>

        </div>

        {/* Data table */}
        <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 bg-navy-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lead Details</h3>
            <p className="text-xs text-white/50 mt-0.5">All leads in selected date range</p>
          </div>
          <div className="p-4">
            <ReportsDataTable leads={filteredLeads} />
          </div>
        </div>

      </div>
    </motion.div>
  )
}
