import { formatCurrency } from '../../lib/dateUtils.js'

const SECTIONS = [
  {
    title: 'Contact Information',
    icon: '📇',
    fields: ['Phone', 'Email', 'Zip Code'],
  },
  {
    title: 'Loan Details',
    icon: '🏠',
    fields: ['Loan Type', 'VA Loan', 'Property Type', 'Rate Type', 'Purchase Price', 'Down Payment'],
  },
  {
    title: 'Financial Profile',
    icon: '💰',
    fields: [
      'Credit Score', 'Annual Income', 'Employment Status',
      'Bankruptcy', 'Proof of Income',
    ],
  },
  {
    title: 'Buyer Profile',
    icon: '👤',
    fields: [
      'First Time Buyer', 'Purchase Situation',
      'Property Use', 'Real Estate Agent',
    ],
  },
  {
    title: 'Lead Source',
    icon: '📡',
    fields: ['How Found', 'Rebel Path Lead', 'Rebel Path URL', 'Date Submitted', 'Browser'],
  },
]

const CURRENCY_FIELDS = ['Purchase Price', 'Down Payment', 'Annual Income']

function formatValue(field, value) {
  if (!value) return null
  if (CURRENCY_FIELDS.includes(field)) return formatCurrency(value)
  return String(value)
}

export default function FullDetailsPanel({ lead }) {
  return (
    <div className="flex flex-col gap-5 p-5">
      {SECTIONS.map(section => {
        const rows = section.fields.filter(f => lead[f])
        if (rows.length === 0) return null
        return (
          <div key={section.title} className="bg-white rounded-card border border-surface-border shadow-card overflow-hidden">
            <div className="px-4 py-3 bg-navy-800 flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-surface-border">
              {section.fields.map(field => {
                const val = formatValue(field, lead[field])
                return (
                  <div key={field} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <span className="text-xs text-ink-muted flex-shrink-0 min-w-[120px] py-0.5">{field}</span>
                    <span className={`text-sm text-right font-medium truncate max-w-[160px] ${val ? 'text-ink' : 'text-ink-muted italic'}`}>
                      {val || '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
