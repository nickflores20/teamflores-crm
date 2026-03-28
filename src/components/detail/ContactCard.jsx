import Avatar from '../ui/Avatar.jsx'
import StatusSelect from '../leads/StatusSelect.jsx'
import { getFullName } from '../../api/mockData.js'
import { formatDate, formatCurrency } from '../../lib/dateUtils.js'
import { calculateLeadScore } from '../../lib/leadScore.js'
import { getSequenceState } from '../../services/coldLeadEngine.js'

const NAVY = '#1A3E61'
const GOLD = '#C6A76F'

const STATE_NAMES = {
  NV: 'Nevada', AZ: 'Arizona', CA: 'California',
  FL: 'Florida', TX: 'Texas', WA: 'Washington', OR: 'Oregon',
}

function InfoRow({ label, value, mono, gold, href }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b last:border-0" style={{ borderColor: '#F1F5F9' }}>
      <span className="text-xs flex-shrink-0 min-w-[100px] pt-0.5" style={{ color: '#94A3B8' }}>{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="text-sm text-right font-medium truncate max-w-[160px] hover:underline"
          style={{ color: gold ? GOLD : '#334155' }}
        >
          {value}
        </a>
      ) : (
        <span className={`text-sm text-right font-medium truncate max-w-[160px] ${mono ? 'font-mono' : ''}`}
          style={{ color: gold ? GOLD : '#334155' }}>
          {value}
        </span>
      )}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-wider mb-2 mt-1" style={{ color: NAVY }}>{children}</p>
  )
}

function QuickLinkButton({ icon, label, href, gold }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
      style={{
        backgroundColor: gold ? GOLD : NAVY,
        color: 'white',
        minHeight: '40px',
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  )
}

export default function ContactCard({ lead, onStatusChange }) {
  const fullName  = getFullName(lead)
  const score     = calculateLeadScore(lead)
  const seqState  = getSequenceState(lead.rowNumber)
  const state     = lead['State'] || ''
  const stateFull = STATE_NAMES[state] || state

  const isRefi = ['Home Refinance', 'HELOC/Equity'].includes(lead['Loan Type'])

  return (
    <div className="bg-white rounded-card border shadow-card overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
      {/* Navy header */}
      <div className="px-5 pt-6 pb-8 flex flex-col items-center text-center" style={{ backgroundColor: NAVY }}>
        <Avatar name={fullName} size="2xl" ring />
        <h2 className="font-serif text-xl text-white font-semibold mt-3 leading-tight">{fullName}</h2>
        <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
          {state && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
              {stateFull || state}
            </span>
          )}
          {lead['Loan Type'] && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
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

      {/* Status + primary actions */}
      <div className="px-5 py-4 border-b -mt-4 bg-white rounded-t-xl relative z-10" style={{ borderColor: '#F1F5F9' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Stage</span>
          <StatusSelect status={lead['Status']} onChange={onStatusChange} />
        </div>

        <div className="flex flex-col gap-2">
          {lead['Phone'] && (
            <a
              href={`tel:${lead['Phone']}`}
              className="flex items-center justify-center gap-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: GOLD, minHeight: '44px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call {lead['Phone']}
            </a>
          )}
          {lead['Email'] && (
            <a
              href={`mailto:${lead['Email']}`}
              className="flex items-center justify-center gap-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: NAVY, minHeight: '40px' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email
            </a>
          )}
        </div>
      </div>

      {/* Quick links — Sonar + Calendly */}
      <div className="px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
        <SectionTitle>Quick Links</SectionTitle>
        <div className="flex flex-col gap-2">
          <QuickLinkButton
            gold
            icon="🏦"
            label="Open Sonar Application"
            href="https://sunnyhillfinancial.pos.yoursonar.com/?originator=nick@sunnyhillfinancial.com"
          />
          <QuickLinkButton
            icon="📅"
            label="Schedule Call"
            href="https://calendly.com/floresnick"
          />
        </div>
      </div>

      {/* Mortgage fields */}
      <div className="px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
        <SectionTitle>Mortgage Details</SectionTitle>
        <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: '#F1F5F9' }}>
          <InfoRow label="Loan Type"      value={lead['Loan Type']} />
          <InfoRow label="State"          value={stateFull || state} />
          {!isRefi && <InfoRow label="Purchase Price"  value={formatCurrency(lead['Purchase Price'])} gold />}
          {!isRefi && <InfoRow label="Down Payment"    value={formatCurrency(lead['Down Payment'])} />}
          {isRefi  && <InfoRow label="Loan Balance"    value={formatCurrency(lead['Loan Balance'])} gold />}
          {isRefi  && <InfoRow label="Property Value"  value={formatCurrency(lead['Property Value'])} />}
          <InfoRow label="Credit Score"   value={lead['Credit Score']} />
          <InfoRow label="Rate Type"      value={lead['Rate Type']} />
          <InfoRow label="Source"         value={lead['How Found']} />
        </div>
      </div>

      {/* Active sequence status */}
      {lead['Status'] === 'Cold' && seqState && (
        <div className="px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
          <SectionTitle>Active Cold Sequence</SectionTitle>
          <div className="rounded-xl p-3 border" style={{ backgroundColor: seqState.paused ? '#FEF2F2' : '#EFF6FF', borderColor: seqState.paused ? '#FECACA' : '#BFDBFE' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">{seqState.paused ? '⏸️' : '▶️'}</span>
              <span className="text-xs font-bold" style={{ color: seqState.paused ? '#DC2626' : '#1D4ED8' }}>
                {seqState.paused ? 'Sequence Paused' : 'Sequence Running'}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#475569' }}>
              Step {seqState.currentStep} · Started {new Date(seqState.startedAt).toLocaleDateString()}
            </p>
            {seqState.paused && (
              <p className="text-xs mt-1 font-medium" style={{ color: '#DC2626' }}>Lead replied — waiting for your follow-up</p>
            )}
          </div>
        </div>
      )}

      {/* Contact info */}
      <div className="px-5 py-4">
        <SectionTitle>Contact Info</SectionTitle>
        <InfoRow label="Phone"   value={lead['Phone']}    href={`tel:${lead['Phone']}`} />
        <InfoRow label="Email"   value={lead['Email']}    href={`mailto:${lead['Email']}`} />
        <InfoRow label="Zip"     value={lead['Zip Code']} />
        <InfoRow label="Added"   value={formatDate(lead['Submitted At'] || lead['Date'])} />
      </div>
    </div>
  )
}
