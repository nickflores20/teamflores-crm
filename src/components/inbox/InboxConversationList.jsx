import { useState } from 'react'

const FOLDER_TABS = ['Inbox', 'Assigned', 'Drafts', 'Sent', 'Closed']
const TYPE_FILTERS = ['All', 'Emails', 'Texts', 'Calls']

const STAGE_COLORS = {
  'New':        { bg: '#EEF3F8', color: '#1A3E61' },
  'Contacted':  { bg: '#FFF8E7', color: '#B8860B' },
  'Qualified':  { bg: '#E8F5E9', color: '#2E7D32' },
  'Active':     { bg: '#E3F2FD', color: '#1565C0' },
  'Cold':       { bg: '#F3F4F6', color: '#6B7280' },
  'Closed Won': { bg: '#E8F5E9', color: '#2E7D32' },
  'Closed Lost':{ bg: '#FEE2E2', color: '#991B1B' },
}

function TypeIcon({ type }) {
  if (type === 'email') {
    return (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    )
  }
  if (type === 'text') {
    return (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  }
  return null
}

export default function InboxConversationList({ conversations, selectedId, onSelect, activeFolder, onFolderChange }) {
  const [typeFilter, setTypeFilter] = useState('All')

  const unreadCount = conversations.filter(c => c.unread && c.folder === 'Inbox').length

  const filtered = conversations.filter(c => {
    if (c.folder !== activeFolder) return false
    if (typeFilter === 'Emails') return c.type === 'email'
    if (typeFilter === 'Texts') return c.type === 'text'
    if (typeFilter === 'Calls') return c.type === 'call'
    return true
  })

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200" style={{ width: 320, minWidth: 320 }}>
      {/* Unread banner */}
      {unreadCount > 0 && activeFolder === 'Inbox' && (
        <div
          className="px-4 py-2 text-xs font-semibold text-center flex-shrink-0"
          style={{ backgroundColor: '#FFF8E7', color: '#B8860B', borderBottom: '1px solid #F3E2B0' }}
        >
          {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
        </div>
      )}

      {/* Folder tabs */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          {FOLDER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => onFolderChange(tab)}
              className="flex-shrink-0 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap"
              style={{
                borderBottomColor: activeFolder === tab ? '#1A3E61' : 'transparent',
                color: activeFolder === tab ? '#1A3E61' : '#6B7280',
                backgroundColor: 'transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-200 flex-shrink-0">
        {TYPE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: typeFilter === f ? '#1A3E61' : 'transparent',
              color: typeFilter === f ? '#fff' : '#6B7280',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
            </svg>
            <p className="text-sm">No conversations</p>
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = conv.id === selectedId
            const stageCfg = STAGE_COLORS[conv.stage] || STAGE_COLORS['New']

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className="w-full flex items-start gap-3 px-4 py-3 border-b border-gray-100 text-left relative transition-colors"
                style={{
                  backgroundColor: isActive ? '#EEF3F8' : undefined,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = '' }}
              >
                {/* Unread indicator */}
                {conv.unread && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-sm"
                    style={{ backgroundColor: '#C6A76F' }}
                  />
                )}

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#1A3E61', color: '#C6A76F' }}
                >
                  {conv.initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className="text-sm truncate"
                      style={{ fontWeight: conv.unread ? 700 : 500, color: '#111827' }}
                    >
                      {conv.name}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-gray-400 flex-shrink-0">
                        <TypeIcon type={conv.type} />
                      </span>
                      <p className="text-xs text-gray-500 truncate">{conv.preview}</p>
                    </div>
                    <span
                      className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
                      style={{ backgroundColor: stageCfg.bg, color: stageCfg.color }}
                    >
                      {conv.stage}
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
