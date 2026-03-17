import Avatar from '../ui/Avatar.jsx'
import StatusSelect from '../leads/StatusSelect.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatDate } from '../../lib/dateUtils.js'
import { calculateLeadScore } from '../../lib/leadScore.js'

export default function ContactCard({ lead, onStatusChange }) {
  const fullName = getFullName(lead)
  const score    = calculateLeadScore(lead)

  return (
    <div className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
      {/* Navy header band */}
      <div className="bg-navy-800 px-5 pt-6 pb-8 flex flex-col items-center text-center">
        <Avatar name={fullName} size="2xl" ring />
        <h2 className="font-serif text-xl text-white font-semibold mt-3 leading-tight">{fullName}</h2>
        <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
          {lead['Loan Type'] && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 text-white/70">
              {lead['Loan Type']}
            </span>
          )}
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: score.bg, color: score.textColor }}
          >
            {score.score} · {score.label}
          </span>
        </div>
      </div>

      {/* Status + actions */}
      <div className="px-5 py-4 border-b border-surface-border -mt-4 bg-white rounded-t-xl relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Status</span>
          <StatusSelect status={lead['Status']} onChange={onStatusChange} />
        </div>

        {/* CTA buttons — gold call, navy email, both full width */}
        <div className="flex flex-col gap-2">
          {lead['Phone'] && (
            <a
              href={`tel:${lead['Phone']}`}
              className="flex items-center justify-center gap-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#C6A76F', minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call
            </a>
          )}
          {lead['Email'] && (
            <a
              href={`mailto:${lead['Email']}`}
              className="flex items-center justify-center gap-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#1A3E61', minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email
            </a>
          )}
        </div>
      </div>

      {/* Contact info rows */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">Contact Info</p>
        <div className="space-y-3">
          {[
            { label: 'Phone',    value: lead['Phone'],    href: `tel:${lead['Phone']}` },
            { label: 'Email',    value: lead['Email'],    href: `mailto:${lead['Email']}` },
            { label: 'Zip Code', value: lead['Zip Code'] },
            { label: 'Added',    value: formatDate(lead['Submitted At'] || lead['Date']) },
            { label: 'Source',   value: lead['How Found'] },
          ].filter(item => item.value).map(item => (
            <div key={item.label} className="flex items-start justify-between gap-2">
              <span className="text-xs text-ink-muted flex-shrink-0 min-w-[52px]">{item.label}</span>
              {item.href ? (
                <a href={item.href} className="text-sm text-ink-secondary hover:text-gold transition-colors text-right truncate max-w-[160px] font-medium">
                  {item.value}
                </a>
              ) : (
                <span className="text-sm text-ink-secondary text-right font-medium">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
