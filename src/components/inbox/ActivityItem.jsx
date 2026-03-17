import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import { formatDistanceToNow } from '../../lib/dateUtils.js'
import { getFullName } from '../../api/mockData.js'

export default function ActivityItem({ lead, isSelected, isNew, isUnread, onClick }) {
  const name = getFullName(lead)

  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors border-b border-surface-border',
        'hover:bg-sand/30',
        isSelected  ? 'bg-sand/40 border-l-2 border-l-gold pl-[14px]' : '',
        isUnread && !isSelected ? 'border-l-2 border-l-gold/60 pl-[14px] bg-amber-50/40' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="relative flex-shrink-0">
        <Avatar name={name} size="md" />
        {isUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm truncate ${isUnread ? 'font-semibold text-ink' : 'font-medium text-ink-secondary'}`}>
            {name}
          </p>
          <span className="text-[10px] text-ink-muted whitespace-nowrap flex-shrink-0">
            {formatDistanceToNow(lead['Date'] || lead['Submitted At'])}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge status={lead['Status']} size="xs" />
          {lead['Loan Type'] && (
            <span className="text-xs text-ink-muted truncate">{lead['Loan Type']}</span>
          )}
          {isNew && !isUnread && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gold/20 text-amber-800 uppercase tracking-wide">New</span>
          )}
        </div>
        {lead['Phone'] && (
          <p className="text-xs text-ink-muted mt-0.5 truncate">{lead['Phone']}</p>
        )}
      </div>
    </button>
  )
}
