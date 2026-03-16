import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLeadsContext } from '../../context/LeadsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useTimeline } from '../../hooks/useTimeline.js'
import TimelineEvent from './TimelineEvent.jsx'

// ─── Filter bar config ─────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',          label: 'All' },
  { key: 'emails',       label: 'Emails' },
  { key: 'texts',        label: 'Texts' },
  { key: 'calls',        label: 'Calls' },
  { key: 'notes',        label: 'Notes' },
  { key: 'status',       label: 'Status' },
  { key: 'appointments', label: 'Appts' },
]

const FILTER_MAP = {
  email_sent:     'emails',
  email_received: 'emails',
  text_sent:      'texts',
  text_received:  'texts',
  call:           'calls',
  note:           'notes',
  status_change:  'status',
  appointment:    'appointments',
}

// ─── Shared base class for text inputs / selects ───────────────────────────
const BASE_INPUT    = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none transition-colors'
const BASE_TEXTAREA = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white resize-none focus:outline-none transition-colors'

// ─── Auto-generate full timeline events based on lead status ───────────────
function generateTimelineForLead(lead) {
  const firstName        = lead['First Name']        || 'there'
  const lastName         = lead['Last Name']         || ''
  const email            = lead['Email']             || ''
  const phone            = lead['Phone']             || ''
  const loanType         = lead['Loan Type']         || 'home loan'
  const zip              = lead['Zip Code']          || 'your area'
  const creditScore      = lead['Credit Score']      || 'Good'
  const purchaseSituation= lead['Purchase Situation']|| 'purchase a home'
  const purchasePrice    = lead['Purchase Price']    || '$350,000'
  const downPayment      = lead['Down Payment']      || ''
  const employmentStatus = lead['Employment Status'] || ''
  const propertyType     = lead['Property Type']     || 'home'
  const status           = lead['Status']            || 'New'

  const rawSubmittedAt = lead['Submitted At'] || (lead['Date'] ? `${lead['Date']}T10:00:00Z` : null) || new Date().toISOString()
  const base = new Date(rawSubmittedAt)

  function ts(daysOffset, hoursOffset = 0) {
    const d = new Date(base)
    d.setDate(d.getDate() + daysOffset)
    d.setHours(d.getHours() + hoursOffset)
    return d.toISOString()
  }

  // Build form answers for lead_submitted body
  const formAnswers = [
    ['First Name',         firstName],
    ['Last Name',          lastName],
    ['Email',              email],
    ['Phone',              phone],
    ['Zip Code',           zip],
    ['Loan Type',          loanType],
    ['VA Loan',            lead['VA Loan']],
    ['Property Type',      propertyType],
    ['Credit Score',       creditScore],
    ['First Time Buyer',   lead['First Time Buyer']],
    ['Purchase Situation', purchaseSituation],
    ['Property Use',       lead['Property Use']],
    ['Purchase Price',     purchasePrice],
    ['Down Payment',       downPayment],
    ['Rate Type',          lead['Rate Type']],
    ['Annual Income',      lead['Annual Income']],
    ['Employment Status',  employmentStatus],
    ['Bankruptcy',         lead['Bankruptcy']],
    ['Proof of Income',    lead['Proof of Income']],
    ['Real Estate Agent',  lead['Real Estate Agent']],
    ['How Found',          lead['How Found']],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const events = []

  // ── Event 1: Lead Submitted (always) ──────────────────────────────────
  events.push({
    type:      'lead_submitted',
    timestamp: rawSubmittedAt,
    body:      formAnswers,
    preview:   `Lead submitted via ${lead['How Found'] || 'website'}`,
    source:    lead['How Found'] || 'website',
  })

  if (['Contacted', 'Qualified', 'Closed', 'Lost'].includes(status)) {
    // ── Event 2: Status → Contacted ─────────────────────────────────────
    events.push({
      type:      'status_change',
      timestamp: ts(1),
      body:      'Status changed from New to Contacted',
      from:      'New',
      to:        'Contacted',
    })

    // ── Event 3: Email Sent by Nick ──────────────────────────────────────
    events.push({
      type:      'email_sent',
      timestamp: ts(1, 2),
      subject:   `Your Home Loan Options — Nick Flores`,
      from:      'Nick@sunnyhillfinancial.com',
      to:        email,
      body:
`Hi ${firstName},

Thank you for reaching out to Team Flores! I reviewed your information and I have some great options for your ${loanType}.

Based on your profile I believe we can get you competitive rates and a smooth closing process. I would love to schedule a quick 15-minute call to walk you through your options.

You can reach me directly at (702) 497-6370 or simply reply to this email.

You can't have a positive life with a negative mind.

Nicholas Flores
Division Director | Sunnyhill Financial
NMLS #422150`,
    })

    // ── Event 4: Email Received from lead ────────────────────────────────
    events.push({
      type:      'email_received',
      timestamp: ts(2),
      subject:   'Re: Your Home Loan Options',
      from:      email,
      to:        'Nick@sunnyhillfinancial.com',
      body:
`Hi Nick,

Thanks for reaching out! I am very interested in learning more. I have been looking at homes in the ${zip} area and found a few I really like.

What rates are you seeing right now? And how long does the process typically take?

${firstName}`,
    })

    // ── Event 5: Text Sent by Nick ───────────────────────────────────────
    events.push({
      type:      'text_sent',
      timestamp: ts(2, 1),
      from:      '(702) 497-6370',
      to:        phone,
      body:
`Hi ${firstName}! This is Nick Flores from Team Flores. Just wanted to follow up on my email. Would love to chat about your ${loanType} options. Call me at (702) 497-6370 or just reply here!`,
    })
  }

  if (['Qualified', 'Closed'].includes(status)) {
    // ── Event 6: Call Logged ─────────────────────────────────────────────
    events.push({
      type:      'call',
      timestamp: ts(3),
      duration:  15,
      outcome:   'Spoke with Lead',
      to:        phone,
      body:
`Spoke with ${firstName} for 15 minutes. They are looking to ${purchaseSituation} with a budget around ${purchasePrice}. Very motivated buyer. Credit score is ${creditScore}. Discussed loan options and they are very interested in moving forward. Sending loan estimate tomorrow.`,
    })

    // ── Event 7: Status → Qualified ──────────────────────────────────────
    events.push({
      type:      'status_change',
      timestamp: ts(4),
      body:      'Status changed from Contacted to Qualified',
      from:      'Contacted',
      to:        'Qualified',
    })

    // ── Event 8: Note ────────────────────────────────────────────────────
    events.push({
      type:      'note',
      timestamp: ts(4, 2),
      body:
`Reviewed full application. ${firstName} qualifies for ${purchasePrice} range.${downPayment ? ` Down payment of ${downPayment} ready.` : ''} Employment verified${employmentStatus ? ` as ${employmentStatus}` : ''}. Moving forward with pre-approval process.`,
    })
  }

  if (status === 'Closed') {
    // ── Event 9: Status → Closed ─────────────────────────────────────────
    events.push({
      type:      'status_change',
      timestamp: ts(14),
      body:      'Status changed from Qualified to Closed',
      from:      'Qualified',
      to:        'Closed',
    })

    // ── Event 10: Closing Note ───────────────────────────────────────────
    events.push({
      type:      'note',
      timestamp: ts(14, 1),
      body:
`Loan successfully funded! ${firstName} ${lastName} purchased their ${propertyType} in Las Vegas. Purchase price: ${purchasePrice}. Excellent client to work with. Will request referrals in 30 days.`,
    })
  }

  return events
}

export default function ActivityTimeline({ lead }) {
  const { addNote } = useLeadsContext()
  const { addToast } = useToast()
  const { events, addEvent, bulkAdd, editEvent, deleteEvent } = useTimeline(lead.rowNumber)
  const composerRef = useRef(null)

  // ── Composer state ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('note')
  const [saving,    setSaving]    = useState(false)

  // Note
  const [noteText,     setNoteText]     = useState('')
  // Email
  const [emailTo,      setEmailTo]      = useState(lead['Email'] || '')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody,    setEmailBody]    = useState('')
  // Text
  const [textTo,   setTextTo]   = useState(lead['Phone'] || '')
  const [textBody, setTextBody] = useState('')
  // Call
  const [callPhone,    setCallPhone]    = useState(lead['Phone'] || '')
  const [callDuration, setCallDuration] = useState('')
  const [callOutcome,  setCallOutcome]  = useState('')
  const [callNotes,    setCallNotes]    = useState('')
  // Appointment
  const [apptType,  setApptType]  = useState('Phone Call')
  const [apptDate,  setApptDate]  = useState('')
  const [apptTime,  setApptTime]  = useState('')
  const [apptNotes, setApptNotes] = useState('')

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filter, setFilter] = useState('all')

  // ── Auto-generate full timeline on first view if no events exist ──────────
  useEffect(() => {
    if (!lead.rowNumber) return
    const key = `crm_timeline_${lead.rowNumber}`
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '[]')
      if (stored.length === 0) {
        const generated = generateTimelineForLead(lead)
        bulkAdd(generated)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-create status_change when lead.Status updates ────────────────────
  const leadStatus  = lead['Status']
  const prevStatRef = useRef(null)
  useEffect(() => {
    if (prevStatRef.current === null) {
      prevStatRef.current = leadStatus
      return
    }
    if (prevStatRef.current !== leadStatus) {
      addEvent({
        type: 'status_change',
        body: `Status changed from ${prevStatRef.current} to ${leadStatus}`,
        from: prevStatRef.current,
        to:   leadStatus,
      })
      prevStatRef.current = leadStatus
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadStatus])

  // ── Sorted + filtered events ──────────────────────────────────────────────
  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [events]
  )
  const filtered = useMemo(
    () => (filter === 'all' ? sorted : sorted.filter((e) => FILTER_MAP[e.type] === filter)),
    [sorted, filter]
  )

  // Badge counts per filter
  const counts = useMemo(() => {
    const c = { all: events.length }
    FILTERS.slice(1).forEach((f) => {
      c[f.key] = events.filter((e) => FILTER_MAP[e.type] === f.key).length
    })
    return c
  }, [events])

  // ── Submit handlers ───────────────────────────────────────────────────────
  const handleNote = async () => {
    if (!noteText.trim()) return
    setSaving(true)
    try {
      await addNote(lead.rowNumber, noteText.trim())
      addEvent({ type: 'note', body: noteText.trim() })
      setNoteText('')
      addToast({ type: 'success', message: 'Note saved' })
    } catch {
      addToast({ type: 'error', message: 'Failed to save note' })
    } finally {
      setSaving(false)
    }
  }

  const handleEmail = () => {
    if (!emailBody.trim()) return
    try {
      window.open(
        `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      )
    } catch {}
    addEvent({
      type:    'email_sent',
      subject: emailSubject || '(No subject)',
      body:    emailBody,
      to:      emailTo,
      from:    'Nick@sunnyhillfinancial.com',
    })
    setEmailSubject('')
    setEmailBody('')
    addToast({ type: 'success', message: 'Email logged & client opened' })
  }

  const handleText = () => {
    if (!textBody.trim()) return
    try {
      window.open(`sms:${textTo}?body=${encodeURIComponent(textBody)}`)
    } catch {}
    addEvent({ type: 'text_sent', body: textBody, to: textTo, from: '(702) 497-6370' })
    setTextBody('')
    addToast({ type: 'success', message: 'Text logged & SMS app opened' })
  }

  const handleCall = () => {
    if (!callOutcome) return
    addEvent({
      type:     'call',
      body:     callNotes,
      to:       callPhone,
      outcome:  callOutcome,
      duration: callDuration ? Number(callDuration) : null,
    })
    setCallDuration('')
    setCallOutcome('')
    setCallNotes('')
    addToast({ type: 'success', message: 'Call logged' })
  }

  const handleAppointment = () => {
    if (!apptDate || !apptTime) return
    addEvent({
      type:            'appointment',
      body:            apptNotes,
      appointmentType: apptType,
      appointmentDate: `${apptDate}T${apptTime}`,
    })
    setApptDate('')
    setApptTime('')
    setApptNotes('')
    addToast({ type: 'success', message: 'Appointment scheduled' })
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full relative">

      {/* ═══════════════════════════════════════════════════════════════════
          COMPOSER
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={composerRef} className="flex-shrink-0 bg-white border-b-2 border-surface-border">

        {/* Tab bar */}
        <div className="flex border-b border-slate-100">
          {[
            { key: 'note',        label: 'Note' },
            { key: 'email',       label: 'Email' },
            { key: 'text',        label: 'Text' },
            { key: 'call',        label: 'Call' },
            { key: 'appointment', label: 'Appt' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                'flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors',
                activeTab === t.key
                  ? '-mb-px border-b-2'
                  : 'text-slate-400 hover:text-slate-600',
              ].join(' ')}
              style={
                activeTab === t.key
                  ? { color: '#1A3E61', borderBottomColor: '#C6A76F' }
                  : {}
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form area */}
        <div className="px-4 py-3.5">

          {/* ── NOTE ──────────────────────────────────────────────────── */}
          {activeTab === 'note' && (
            <div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note about this lead…"
                rows={3}
                className={`${BASE_TEXTAREA} focus:ring-2 focus:ring-amber-200 focus:border-amber-300`}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleNote}
                  disabled={saving || !noteText.trim()}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: '#C6A76F' }}
                >
                  {saving ? 'Saving…' : 'Add Note'}
                </button>
              </div>
            </div>
          )}

          {/* ── EMAIL ─────────────────────────────────────────────────── */}
          {activeTab === 'email' && (
            <div className="space-y-2">
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="To:"
                className={`${BASE_INPUT} focus:ring-2 focus:ring-blue-200 focus:border-blue-300`}
              />
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject:"
                className={`${BASE_INPUT} focus:ring-2 focus:ring-blue-200 focus:border-blue-300`}
              />
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Write your email…"
                rows={4}
                className={`${BASE_TEXTAREA} focus:ring-2 focus:ring-blue-200 focus:border-blue-300`}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleEmail}
                  disabled={!emailBody.trim()}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 transition-colors"
                >
                  Send Email
                </button>
              </div>
            </div>
          )}

          {/* ── TEXT ──────────────────────────────────────────────────── */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <input
                type="tel"
                value={textTo}
                onChange={(e) => setTextTo(e.target.value)}
                placeholder="To:"
                className={`${BASE_INPUT} focus:ring-2 focus:ring-green-200 focus:border-green-300`}
              />
              <div className="relative">
                <textarea
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value.slice(0, 160))}
                  placeholder="Write your message…"
                  rows={3}
                  className={`${BASE_TEXTAREA} focus:ring-2 focus:ring-green-200 focus:border-green-300`}
                />
                <span
                  className={[
                    'absolute bottom-2.5 right-3 text-[10px] font-medium pointer-events-none',
                    textBody.length > 140 ? 'text-red-500' : 'text-slate-400',
                  ].join(' ')}
                >
                  {textBody.length}/160
                </span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleText}
                  disabled={!textBody.trim()}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 transition-colors"
                >
                  Send Text
                </button>
              </div>
            </div>
          )}

          {/* ── CALL LOG ──────────────────────────────────────────────── */}
          {activeTab === 'call' && (
            <div className="space-y-2">
              <input
                type="tel"
                value={callPhone}
                onChange={(e) => setCallPhone(e.target.value)}
                placeholder="Called:"
                className={`${BASE_INPUT} focus:ring-2 focus:ring-purple-200 focus:border-purple-300`}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                  placeholder="Duration (min)"
                  min="0"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-colors"
                />
                <select
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-colors"
                >
                  <option value="">Outcome…</option>
                  <option value="Spoke with Lead">Spoke with Lead</option>
                  <option value="Left Voicemail">Left Voicemail</option>
                  <option value="No Answer">No Answer</option>
                  <option value="Wrong Number">Wrong Number</option>
                </select>
              </div>
              <textarea
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="Notes from call…"
                rows={2}
                className={`${BASE_TEXTAREA} focus:ring-2 focus:ring-purple-200 focus:border-purple-300`}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleCall}
                  disabled={!callOutcome}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-40 transition-colors"
                >
                  Log Call
                </button>
              </div>
            </div>
          )}

          {/* ── APPOINTMENT ───────────────────────────────────────────── */}
          {activeTab === 'appointment' && (
            <div className="space-y-2">
              <select
                value={apptType}
                onChange={(e) => setApptType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-colors"
              >
                <option>Phone Call</option>
                <option>In Person</option>
                <option>Video</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-colors"
                />
                <input
                  type="time"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-colors"
                />
              </div>
              <textarea
                value={apptNotes}
                onChange={(e) => setApptNotes(e.target.value)}
                placeholder="Notes…"
                rows={2}
                className={`${BASE_TEXTAREA} focus:ring-2 focus:ring-amber-200 focus:border-amber-300`}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAppointment}
                  disabled={!apptDate || !apptTime}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white disabled:opacity-40 transition-colors"
                  style={{ backgroundColor: '#C6A76F' }}
                >
                  Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FILTER BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-100 flex gap-1.5 overflow-x-auto bg-white">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap transition-colors',
              filter === f.key ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            ].join(' ')}
            style={filter === f.key ? { backgroundColor: '#1A3E61' } : {}}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span
                className={[
                  'text-[10px] rounded-full px-1 min-w-[16px] text-center',
                  filter === f.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-500',
                ].join(' ')}
              >
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TIMELINE
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-20 md:pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <svg
              className="w-10 h-10 mb-3"
              style={{ color: '#E2E8F0' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">
              {filter === 'all' ? 'No activity yet' : `No ${filter} yet`}
            </p>
          </div>
        ) : (
          filtered.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.25), duration: 0.18 }}
            >
              <TimelineEvent
                event={event}
                onEdit={editEvent}
                onDelete={deleteEvent}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE FAB — scroll to composer
      ══════════════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => composerRef.current?.scrollIntoView({ behavior: 'smooth' })}
        className="md:hidden fixed bottom-20 right-4 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white z-40 active:scale-95 transition-transform"
        style={{ backgroundColor: '#C6A76F' }}
        aria-label="Open composer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  )
}
