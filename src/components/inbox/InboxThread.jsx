import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const TEMPLATE_MAP = {
  'LeadPops NV': 'LeadPops NV Purchase',
  'Bankrate NV': 'Bankrate NV Purchase',
  'Bankrate TX': 'Bankrate TX Purchase',
  'Zillow':      'Zillow Purchase',
  'Website':     'Website Inquiry',
  'LeadPops AZ': 'LeadPops AZ Purchase',
}

function getTemplate(source) {
  if (!source) return null
  for (const [key, val] of Object.entries(TEMPLATE_MAP)) {
    if (source.includes(key)) return val
  }
  return null
}

const STAGE_COLORS = {
  'New':        { bg: '#EEF3F8', color: '#1A3E61' },
  'Contacted':  { bg: '#FFF8E7', color: '#B8860B' },
  'Qualified':  { bg: '#E8F5E9', color: '#2E7D32' },
  'Active':     { bg: '#E3F2FD', color: '#1565C0' },
  'Cold':       { bg: '#F3F4F6', color: '#6B7280' },
  'Closed Won': { bg: '#E8F5E9', color: '#2E7D32' },
  'Closed Lost':{ bg: '#FEE2E2', color: '#991B1B' },
}

function EmailCard({ msg }) {
  const [expanded, setExpanded] = useState(false)
  const isOut = msg.dir === 'out'

  return (
    <div
      className="rounded-xl border overflow-hidden cursor-pointer"
      style={{
        backgroundColor: isOut ? '#F0F4F8' : '#FFFFFF',
        borderColor: '#E2E8F0',
      }}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-400 flex-shrink-0">
            {isOut ? '→ Sent' : '← Received'}
          </span>
          <span className="text-sm font-medium text-gray-800 truncate">
            {msg.subject || '(no subject)'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-gray-400">{msg.time}</span>
          <svg
            className="w-4 h-4 text-gray-400 transition-transform"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{msg.body}</pre>
        </div>
      )}
      {!expanded && (
        <div className="px-4 pb-3 text-xs text-gray-400 truncate">
          {msg.body?.split('\n')[0]}
        </div>
      )}
    </div>
  )
}

function TextBubble({ msg }) {
  const isOut = msg.dir === 'out'

  return (
    <div className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}>
      <div
        className="max-w-[75%] px-4 py-2.5 text-sm leading-relaxed"
        style={{
          backgroundColor: isOut ? '#1A3E61' : '#F1F5F9',
          color: isOut ? '#FFFFFF' : '#1F2937',
          borderRadius: isOut
            ? '0.75rem 0.75rem 0 0.75rem'
            : '0.75rem 0.75rem 0.75rem 0',
        }}
      >
        {msg.body}
      </div>
      {msg.template && (
        <span
          className="mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide"
          style={{ backgroundColor: '#FFF8E7', color: '#B8860B' }}
        >
          {msg.template}
        </span>
      )}
      <span className="mt-1 text-[10px] text-gray-400">{msg.time}</span>
    </div>
  )
}

function SystemMessage({ msg }) {
  return (
    <div className="flex justify-center my-2">
      <span className="text-[11px] text-gray-400 italic bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
        {msg.body}
      </span>
    </div>
  )
}

export default function InboxThread({ conversation, onSendReply, onClose }) {
  const navigate = useNavigate()
  const [replyTab, setReplyTab] = useState('text')
  const [textBody, setTextBody] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendSuccess, setSendSuccess] = useState('')
  const messagesEndRef = useRef(null)

  const suggestedTemplate = conversation ? getTemplate(conversation.source) : null
  const stageCfg = conversation ? (STAGE_COLORS[conversation.stage] || STAGE_COLORS['New']) : null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.id, conversation?.messages?.length])

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <svg className="w-14 h-14 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
        </svg>
        <p className="text-gray-400 text-sm font-medium">Select a conversation to view messages</p>
      </div>
    )
  }

  const handleSend = (andClose = false) => {
    const body = replyTab === 'text' ? textBody : emailBody
    if (!body.trim()) return

    const newMsg = replyTab === 'text'
      ? { dir: 'out', type: 'text', body: body.trim(), time: 'Just now', template: suggestedTemplate || undefined }
      : { dir: 'out', type: 'email', subject: emailSubject || '(no subject)', body: body.trim(), time: 'Just now' }

    onSendReply(conversation.id, newMsg, andClose)

    setTextBody('')
    setEmailSubject('')
    setEmailBody('')

    if (suggestedTemplate && replyTab === 'text') {
      setSendSuccess(`Template matched: ${suggestedTemplate}`)
      setTimeout(() => setSendSuccess(''), 4000)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Thread header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: '#1A3E61', color: '#C6A76F' }}
          >
            {conversation.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 truncate">{conversation.name}</span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide flex-shrink-0"
                style={{ backgroundColor: stageCfg.bg, color: stageCfg.color }}
              >
                {conversation.stage}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{conversation.source}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onClose(conversation.id)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close Conversation
          </button>
          <button
            onClick={() => navigate(`/people/${conversation.leadId}`)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: '#1A3E61', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#15325A'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1A3E61'}
          >
            View Profile →
          </button>
        </div>
      </div>

      {/* Template match banner */}
      {sendSuccess && (
        <div className="px-5 py-2 text-xs font-semibold text-center flex-shrink-0 transition-all"
          style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', borderBottom: '1px solid #C8E6C9' }}>
          ✓ {sendSuccess}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {conversation.messages.map((msg, idx) => {
          if (msg.type === 'activity' || msg.dir === 'system') {
            return <SystemMessage key={idx} msg={msg} />
          }
          if (msg.type === 'email') {
            return <EmailCard key={idx} msg={msg} />
          }
          return <TextBubble key={idx} msg={msg} />
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply area */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        {/* Suggested template */}
        {suggestedTemplate && (
          <div className="px-4 pt-3 pb-0">
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-sm uppercase tracking-wide"
              style={{ backgroundColor: '#FFF8E7', color: '#B8860B' }}
            >
              Suggested template: {suggestedTemplate}
            </span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-0 px-4 pt-3">
          <button
            onClick={() => setReplyTab('text')}
            className="px-4 py-2 text-xs font-semibold rounded-tl-lg rounded-tr-lg border border-b-0 transition-colors"
            style={{
              backgroundColor: replyTab === 'text' ? '#1A3E61' : '#F1F5F9',
              color: replyTab === 'text' ? '#fff' : '#6B7280',
              borderColor: replyTab === 'text' ? '#1A3E61' : '#E2E8F0',
            }}
          >
            💬 Text
          </button>
          <button
            onClick={() => setReplyTab('email')}
            className="px-4 py-2 text-xs font-semibold rounded-tl-lg rounded-tr-lg border border-b-0 ml-1 transition-colors"
            style={{
              backgroundColor: replyTab === 'email' ? '#1A3E61' : '#F1F5F9',
              color: replyTab === 'email' ? '#fff' : '#6B7280',
              borderColor: replyTab === 'email' ? '#1A3E61' : '#E2E8F0',
            }}
          >
            ✉️ Email
          </button>
        </div>

        <div className="px-4 pb-4 pt-0 border border-gray-200 mx-4 mb-4 rounded-b-lg rounded-tr-lg bg-white">
          {replyTab === 'text' ? (
            <div>
              <textarea
                value={textBody}
                onChange={e => setTextBody(e.target.value)}
                placeholder="Type a text message..."
                rows={3}
                maxLength={1600}
                className="w-full resize-none text-sm text-gray-800 p-3 outline-none placeholder-gray-300"
                style={{ border: 'none' }}
              />
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">{textBody.length}/1600 characters</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSend(false)}
                    disabled={!textBody.trim()}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                    style={{ backgroundColor: '#1A3E61', color: '#fff' }}
                    onMouseEnter={e => { if (textBody.trim()) e.currentTarget.style.backgroundColor = '#15325A' }}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1A3E61'}
                  >
                    Send
                  </button>
                  <button
                    onClick={() => handleSend(true)}
                    disabled={!textBody.trim()}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                    style={{ backgroundColor: '#C6A76F', color: '#fff' }}
                    onMouseEnter={e => { if (textBody.trim()) e.currentTarget.style.backgroundColor = '#B8985E' }}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C6A76F'}
                  >
                    Send &amp; Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <input
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                placeholder="Subject..."
                className="w-full text-sm text-gray-800 p-3 outline-none placeholder-gray-300 border-b border-gray-100"
              />
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                placeholder="Write your email..."
                rows={4}
                className="w-full resize-none text-sm text-gray-800 p-3 outline-none placeholder-gray-300"
                style={{ border: 'none' }}
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleSend(false)}
                  disabled={!emailBody.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#1A3E61', color: '#fff' }}
                  onMouseEnter={e => { if (emailBody.trim()) e.currentTarget.style.backgroundColor = '#15325A' }}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1A3E61'}
                >
                  Send
                </button>
                <button
                  onClick={() => handleSend(true)}
                  disabled={!emailBody.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#C6A76F', color: '#fff' }}
                  onMouseEnter={e => { if (emailBody.trim()) e.currentTarget.style.backgroundColor = '#B8985E' }}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C6A76F'}
                >
                  Send &amp; Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
