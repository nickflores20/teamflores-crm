import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { useLeadsContext } from '../../context/LeadsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { formatDate, formatCurrency } from '../../lib/dateUtils.js'
import { getFullName } from '../../api/mockData.js'

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']

export default function LeadDetailPanel({ lead }) {
  const navigate = useNavigate()
  const { setLeadStatus, addNote } = useLeadsContext()
  const { addToast } = useToast()
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-surface-secondary">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-tertiary flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-ink-secondary">Select a lead</p>
          <p className="text-xs text-ink-muted mt-1">Choose someone from the list to view details</p>
        </div>
      </div>
    )
  }

  const name = getFullName(lead)

  const handleStatusChange = async (status) => {
    try {
      await setLeadStatus(lead.rowNumber, status)
      addToast({ type: 'success', message: `Moved to ${status}` })
    } catch {
      addToast({ type: 'error', message: 'Failed to update' })
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    setSaving(true)
    try {
      await addNote(lead.rowNumber, note.trim())
      addToast({ type: 'success', message: 'Note saved' })
      setNote('')
    } catch {
      addToast({ type: 'error', message: 'Failed to save note' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-surface-border flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={name} size="lg" ring />
            <div>
              <h2 className="text-lg font-semibold text-ink font-serif">{name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge status={lead['Status']} size="sm" />
                {lead['Loan Type'] && (
                  <span className="text-xs text-ink-muted">{lead['Loan Type']}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/people/${lead.rowNumber}`)}
            className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-dark font-medium transition-colors flex-shrink-0"
          >
            Full Profile
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {lead['Phone'] && (
            <a
              href={`tel:${lead['Phone']}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call
            </a>
          )}
          {lead['Email'] && (
            <a
              href={`mailto:${lead['Email']}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email
            </a>
          )}
        </div>
      </div>

      {/* Key details */}
      <div className="px-6 py-4 border-b border-surface-border flex-shrink-0">
        <h3 className="text-xs font-semibold text-navy-800 uppercase tracking-wider mb-3">Key Details</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            { label: 'Phone',    value: lead['Phone'] },
            { label: 'Email',    value: lead['Email'] },
            { label: 'Price',    value: formatCurrency(lead['Purchase Price']) },
            { label: 'Zip',      value: lead['Zip Code'] },
            { label: 'Credit',   value: lead['Credit Score'] },
            { label: 'Source',   value: lead['How Found'] },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide">{label}</p>
              <p className="text-sm text-ink truncate mt-0.5">{value}</p>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Status change */}
      <div className="px-6 py-4 border-b border-surface-border flex-shrink-0">
        <h3 className="text-xs font-semibold text-navy-800 uppercase tracking-wider mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                lead['Status'] === s
                  ? 'bg-navy-800 text-white border-navy-800'
                  : 'bg-white text-ink-secondary border-surface-border hover:border-navy-800/30 hover:text-navy-800',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Add note */}
      <div className="px-6 py-4 flex-1">
        <h3 className="text-xs font-semibold text-navy-800 uppercase tracking-wider mb-3">Add Note</h3>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Write a note..."
          rows={4}
          className="w-full bg-white border border-surface-border rounded-lg px-3 py-2.5 text-sm text-ink placeholder-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
        />
        <div className="flex justify-end mt-2">
          <Button variant="gold" size="sm" onClick={handleAddNote} loading={saving} disabled={!note.trim()}>
            Save Note
          </Button>
        </div>
      </div>
    </div>
  )
}
