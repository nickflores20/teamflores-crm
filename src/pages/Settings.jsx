import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { APPS_SCRIPT_URL, USE_MOCK } from '../api/apiConfig.js'
import { getAutomationSettings, saveAutomationSettings } from '../services/coldLeadEngine.js'
import { SMS_TEMPLATES, EMAIL_TEMPLATES, fillTemplate } from '../services/templateEngine.js'

const SAMPLE_LEAD = {
  'First Name': 'Carlos', 'Last Name': 'Rivera', 'State': 'NV',
  'Loan Type': 'Home Purchase', 'How Found': 'LeadPops NV Purchase',
  'Purchase Price': '425000', 'Down Payment': '85000',
  'Credit Score': '740-759', 'Rate': '6.75%', 'APR': '6.89%',
  'Loan Balance': '310000', 'Property Value': '450000',
}

// ─── helpers ────────────────────────────────────────────────────────────────

function useLocalSetting(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try { const s = localStorage.getItem(key); return s !== null ? JSON.parse(s) : defaultValue }
    catch { return defaultValue }
  })
  const set = (v) => { localStorage.setItem(key, JSON.stringify(v)); setValue(v) }
  return [value, set]
}

// ─── sub-components ──────────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
      <div className="px-4 py-3 bg-navy-800 flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
        checked ? 'bg-gold' : 'bg-surface-tertiary'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-secondary block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
      />
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-border last:border-0">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className={`text-xs ${mono ? 'font-mono text-ink-secondary' : 'text-ink-secondary'}`}>{value}</span>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function Settings() {
  const { logout } = useAuth()
  const { addToast } = useToast()
  const fileRef = useRef(null)

  // Profile
  const [profile, setProfile] = useLocalSetting('tf_profile', {
    firstName: 'Nick',
    lastName: 'Flores Sr.',
    email: 'nick@sunnyhillfinancial.com',
    phone: '702-497-6370',
    title: 'Division Director',
    company: 'Sunnyhill Financial',
    bio: '',
    photo: null,
  })
  const [profileDirty, setProfileDirty] = useState(false)
  const [profileEdits, setProfileEdits] = useState({ ...profile })

  const updateEdit = (field, val) => {
    setProfileEdits(e => ({ ...e, [field]: val }))
    setProfileDirty(true)
  }

  const saveProfile = () => {
    setProfile(profileEdits)
    setProfileDirty(false)
    addToast({ type: 'success', message: 'Profile saved' })
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateEdit('photo', ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Appearance
  const [compact, setCompact]          = useLocalSetting('tf_compact', false)
  const [sidebarCollapsed, setSidebar] = useLocalSetting('tf_sidebar_default_collapsed', false)

  // Notifications
  const [notifs, setNotifs] = useLocalSetting('tf_notifs', {
    newLeads: true,
    statusChanges: true,
    taskReminders: true,
    weeklyDigest: false,
    dailySummaryTime: '08:00',
    weeklyReportDay: 'Monday',
  })

  const setNotif = (key, val) => setNotifs({ ...notifs, [key]: val })

  // Password
  const [pwCurrent, setPwCurrent]   = useState('')
  const [pwNew, setPwNew]           = useState('')
  const [pwConfirm, setPwConfirm]   = useState('')
  const [pwError, setPwError]       = useState('')

  const changePassword = () => {
    if (pwCurrent !== 'TeamFlores2026') { setPwError('Current password is incorrect'); return }
    if (pwNew.length < 8)               { setPwError('New password must be at least 8 characters'); return }
    if (pwNew !== pwConfirm)            { setPwError('Passwords do not match'); return }
    setPwError('')
    setPwCurrent(''); setPwNew(''); setPwConfirm('')
    addToast({ type: 'success', message: 'Password updated' })
  }

  // Automation settings
  const [automation, setAutomation] = useLocalSetting('tf_automation_settings', getAutomationSettings())
  const saveAutomation = (updates) => {
    const updated = { ...automation, ...updates }
    setAutomation(updated)
    saveAutomationSettings(updated)
    addToast({ type: 'success', message: 'Automation settings saved' })
  }

  // Integrations
  const [calendlyUrl, setCalendlyUrl]   = useLocalSetting('tf_calendly_url', 'calendly.com/floresnick')
  const [sonarUrl, setSonarUrl]         = useLocalSetting('tf_sonar_url', 'https://sunnyhillfinancial.pos.yoursonar.com/?originator=nick@sunnyhillfinancial.com')

  // Templates
  const [smsTemplates, setSmsTemplates] = useLocalSetting('tf_sms_templates', SMS_TEMPLATES)
  const [emailTemplates, setEmailTemplates] = useLocalSetting('tf_email_templates', EMAIL_TEMPLATES)
  const [editingTemplate, setEditingTemplate] = useState(null) // { type: 'sms'|'email', id }
  const [previewTpl, setPreviewTpl] = useState(null)

  const updateSmsTemplate = (id, body) => {
    const updated = smsTemplates.map(t => t.id === id ? { ...t, body } : t)
    setSmsTemplates(updated)
  }
  const updateEmailTemplate = (id, field, value) => {
    const updated = emailTemplates.map(t => t.id === id ? { ...t, [field]: value } : t)
    setEmailTemplates(updated)
  }

  // Integration
  const [pingStatus, setPingStatus] = useState(null)
  const [lastSynced] = useState(() => new Date().toLocaleString())

  // AI endpoint test
  const [aiTestStatus, setAiTestStatus] = useState(null)
  const [aiTestResult, setAiTestResult] = useState('')

  const testAiEndpoint = async () => {
    setAiTestStatus('pending')
    setAiTestResult('')
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadData: { firstName: 'Test', lastName: 'Lead', loanType: 'Purchase', rowNumber: 0 },
          timelineEvents: [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed: ' + res.status)
      setAiTestStatus('ok')
      setAiTestResult(data.summary)
    } catch (e) {
      setAiTestStatus('error')
      setAiTestResult(e.message)
    }
  }

  const pingApi = async () => {
    setPingStatus('pending')
    try {
      const res = await fetch(APPS_SCRIPT_URL, { method: 'GET' })
      if (!res.ok) throw new Error()
      setPingStatus('ok')
      addToast({ type: 'success', message: 'Connected to Google Sheets' })
    } catch {
      setPingStatus('error')
      addToast({ type: 'error', message: 'Could not reach Google Apps Script' })
    }
  }

  const handleLogout = () => { logout(); window.location.href = '/login' }

  const initials = `${profileEdits.firstName?.[0] || 'N'}${profileEdits.lastName?.[0] || 'F'}`.toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-y-auto bg-surface-secondary"
    >
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 border-b border-surface-border bg-white flex-shrink-0">
        <h1 className="text-base font-serif font-semibold text-ink">Settings</h1>
        <p className="text-xs text-ink-muted mt-0.5">Preferences and CRM configuration</p>
      </div>

      <div className="flex-1 px-4 lg:px-6 py-6 space-y-5 max-w-2xl">

        {/* ── Profile ── */}
        <Section title="Profile" icon="👤">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {profileEdits.photo ? (
                <img src={profileEdits.photo} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-gold/30" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-navy-800 flex items-center justify-center border-2 border-gold/30">
                  <span className="text-xl font-serif font-semibold text-gold">{initials}</span>
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center shadow-sm hover:bg-gold-light transition-colors"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{profileEdits.firstName} {profileEdits.lastName}</p>
              <p className="text-xs text-ink-secondary">{profileEdits.title} · {profileEdits.company}</p>
              <button onClick={() => fileRef.current?.click()} className="text-xs text-gold hover:underline mt-1">Change photo</button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" value={profileEdits.firstName} onChange={v => updateEdit('firstName', v)} placeholder="Nick" />
            <Field label="Last Name"  value={profileEdits.lastName}  onChange={v => updateEdit('lastName', v)}  placeholder="Flores" />
          </div>
          <Field label="Email"   type="email" value={profileEdits.email}   onChange={v => updateEdit('email', v)}   placeholder="nick@example.com" />
          <Field label="Phone"   type="tel"   value={profileEdits.phone}   onChange={v => updateEdit('phone', v)}   placeholder="(555) 800-1234" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title"   value={profileEdits.title}   onChange={v => updateEdit('title', v)}   placeholder="Loan Officer" />
            <Field label="Company" value={profileEdits.company} onChange={v => updateEdit('company', v)} placeholder="Sunnyhill Financial" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-secondary block mb-1.5">Bio</label>
            <textarea
              value={profileEdits.bio}
              onChange={e => updateEdit('bio', e.target.value)}
              placeholder="Short bio or tagline…"
              rows={2}
              className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink placeholder-ink-muted resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
            />
          </div>

          {profileDirty && (
            <div className="flex justify-end">
              <button
                onClick={saveProfile}
                className="px-4 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors"
              >
                Save Profile
              </button>
            </div>
          )}
        </Section>

        {/* ── License ── */}
        <Section title="License & Compliance" icon="🏦">
          <div className="divide-y divide-surface-border">
            <InfoRow label="NMLS Individual"  value="NMLS #422150" />
            <InfoRow label="NMLS Company"     value="NMLS #1850115" />
            <InfoRow label="Licensed States"  value="NV, AZ, CA, FL, TX, WA, OR" />
            <InfoRow label="Direct Line"      value="702-497-6370" />
            <InfoRow label="Company"          value="Sunnyhill Financial" />
          </div>
          <p className="text-[10px] text-ink-muted leading-relaxed">
            Nick Flores NMLS #422150 | Sunnyhill Financial NMLS #1850115 | Licensed by the Department of Financial Protection and Innovation under the California Residential Mortgage Lending Act. Equal Housing Opportunity.
          </p>
        </Section>

        {/* ── Appearance ── */}
        <Section title="Appearance" icon="🎨">
          <ToggleRow
            label="Compact Mode"
            description="Denser table rows and reduced padding"
            checked={compact}
            onChange={setCompact}
          />
          <ToggleRow
            label="Collapse Sidebar by Default"
            description="Start with sidebar in icon-only mode"
            checked={sidebarCollapsed}
            onChange={setSidebar}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notification Preferences" icon="🔔">
          <ToggleRow
            label="New Leads"
            description="Alert when a new lead comes in"
            checked={notifs.newLeads}
            onChange={v => setNotif('newLeads', v)}
          />
          <ToggleRow
            label="Status Changes"
            description="Alert when a lead status is updated"
            checked={notifs.statusChanges}
            onChange={v => setNotif('statusChanges', v)}
          />
          <ToggleRow
            label="Task Reminders"
            description="Notify when tasks are due"
            checked={notifs.taskReminders}
            onChange={v => setNotif('taskReminders', v)}
          />
          <ToggleRow
            label="Weekly Digest"
            description="Summary report every week"
            checked={notifs.weeklyDigest}
            onChange={v => setNotif('weeklyDigest', v)}
          />
          {notifs.weeklyDigest && (
            <div className="pl-0 pt-1 border-t border-surface-border">
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs font-medium text-ink-secondary block mb-1.5">Delivery Day</label>
                  <select
                    value={notifs.weeklyReportDay}
                    onChange={e => setNotif('weeklyReportDay', e.target.value)}
                    className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-secondary block mb-1.5">Send Time</label>
                  <input
                    type="time"
                    value={notifs.dailySummaryTime}
                    onChange={e => setNotif('dailySummaryTime', e.target.value)}
                    className="w-full bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── AI Summary ── */}
        <Section title="AI Smart Summary" icon="✨">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${aiTestStatus === 'ok' ? 'bg-green-500' : aiTestStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                <p className="text-sm font-medium text-ink">Serverless Endpoint</p>
              </div>
              <p className="text-xs text-ink-muted font-mono">/api/summarize</p>
              <p className="text-xs text-ink-muted mt-0.5">Calls Claude via Vercel function — API key stored server-side</p>
            </div>
            <button
              onClick={testAiEndpoint}
              disabled={aiTestStatus === 'pending'}
              className={[
                'flex-shrink-0 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors',
                aiTestStatus === 'ok'    ? 'border-green-500/40 text-green-700 bg-green-50' :
                aiTestStatus === 'error' ? 'border-red-500/40 text-red-600 bg-red-50' :
                'border-surface-border text-ink-secondary bg-white hover:bg-surface-secondary',
              ].join(' ')}
            >
              {aiTestStatus === 'pending' ? 'Testing…' :
               aiTestStatus === 'ok'      ? '✓ Working' :
               aiTestStatus === 'error'   ? '✗ Error' :
               'Test Endpoint'}
            </button>
          </div>
          {aiTestResult && (
            <div className={`rounded-xl p-3 border text-xs leading-relaxed ${aiTestStatus === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {aiTestResult}
            </div>
          )}
        </Section>

        {/* ── Password ── */}
        <Section title="Change Password" icon="🔐">
          <Field label="Current Password" type="password" value={pwCurrent} onChange={setPwCurrent} placeholder="Enter current password" />
          <Field label="New Password"     type="password" value={pwNew}     onChange={setPwNew}     placeholder="At least 8 characters" />
          <Field label="Confirm New"      type="password" value={pwConfirm} onChange={setPwConfirm} placeholder="Repeat new password" />
          {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          <div className="flex justify-end">
            <button
              onClick={changePassword}
              disabled={!pwCurrent || !pwNew || !pwConfirm}
              className="px-4 py-2 bg-navy-800 text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Update Password
            </button>
          </div>
        </Section>

        {/* ── Integration ── */}
        <Section title="Google Sheets Integration" icon="📊">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pingStatus === 'ok' ? 'bg-green-500' : pingStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
                <p className="text-sm font-medium text-ink">Apps Script</p>
              </div>
              <p className="text-xs text-ink-muted font-mono truncate">{APPS_SCRIPT_URL.slice(0, 44)}…</p>
              <p className="text-xs text-ink-muted mt-0.5">Last synced: {lastSynced}</p>
            </div>
            <button
              onClick={pingApi}
              disabled={pingStatus === 'pending'}
              className={[
                'flex-shrink-0 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors',
                pingStatus === 'ok'    ? 'border-green-500/40 text-green-700 bg-green-50' :
                pingStatus === 'error' ? 'border-red-500/40 text-red-600 bg-red-50' :
                'border-surface-border text-ink-secondary bg-white hover:bg-surface-secondary',
              ].join(' ')}
            >
              {pingStatus === 'pending' ? 'Checking…' :
               pingStatus === 'ok'      ? '✓ Connected' :
               pingStatus === 'error'   ? '✗ Error' :
               'Test Connection'}
            </button>
          </div>

          <div className="bg-surface-secondary rounded-xl p-3 border border-surface-border">
            <InfoRow label="Data Mode"    value={USE_MOCK ? 'Mock Data' : 'Live (Google Sheets)'} />
            <InfoRow label="Auto-refresh" value="Every 60 seconds" />
            <InfoRow label="Sheet"        value="Leads" />
            <InfoRow label="Write method" value="doPost (JSON / text/plain)" mono />
          </div>

          {USE_MOCK && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-amber-700">Mock mode active</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Set <code className="font-mono bg-amber-100 px-1 rounded">USE_MOCK = false</code> in{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">src/api/apiConfig.js</code> to connect live data.
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* ── CRM Info ── */}
        <Section title="CRM Information" icon="ℹ️">
          <div className="divide-y divide-surface-border">
            <InfoRow label="Version"     value="1.0.0" />
            <InfoRow label="Built for"   value="Nick Flores — Sunnyhill Financial" />
            <InfoRow label="Stack"       value="React 18 + Vite 5 + Tailwind CSS" mono />
            <InfoRow label="State"       value="Context API + localStorage" mono />
            <InfoRow label="Charts"      value="Recharts" />
            <InfoRow label="Drag & Drop" value="@dnd-kit/core" mono />
          </div>
        </Section>

        {/* ── Automation ── */}
        <Section title="Automation" icon="⚡">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-ink">Cold Threshold</p>
                <p className="text-xs text-ink-muted mt-0.5">Days without contact before a lead is marked Cold</p>
              </div>
              <span className="text-lg font-bold text-gold ml-4">{automation.coldThreshold}d</span>
            </div>
            <input
              type="range" min={1} max={30} value={automation.coldThreshold}
              onChange={e => saveAutomation({ coldThreshold: Number(e.target.value) })}
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-[10px] text-ink-muted mt-0.5">
              <span>1 day</span><span>30 days</span>
            </div>
          </div>
          <ToggleRow
            label="Auto Cold Sequence"
            description="Automatically start the cold follow-up sequence when a lead is marked Cold"
            checked={automation.autoSequence ?? true}
            onChange={v => saveAutomation({ autoSequence: v })}
          />
          <ToggleRow
            label="Auto-Pause on Reply"
            description="Pause sequence and alert you immediately when a cold lead replies"
            checked={automation.autoPauseOnReply ?? true}
            onChange={v => saveAutomation({ autoPauseOnReply: v })}
          />
        </Section>

        {/* ── Integrations ── */}
        <Section title="Integrations" icon="🔗">
          <Field label="Calendly URL" value={calendlyUrl} onChange={setCalendlyUrl} placeholder="calendly.com/floresnick" />
          <Field label="Sonar Pre-Approval URL" value={sonarUrl} onChange={setSonarUrl} placeholder="https://sunnyhillfinancial.pos.yoursonar.com/…" />
        </Section>

        {/* ── Text Templates ── */}
        <Section title="Text Message Templates" icon="📱">
          <p className="text-xs text-ink-muted -mt-1">
            Variables: <code className="font-mono bg-surface-secondary px-1 rounded">{'{firstName}'}</code>{' '}
            <code className="font-mono bg-surface-secondary px-1 rounded">{'{state}'}</code>{' '}
            <code className="font-mono bg-surface-secondary px-1 rounded">{'{purchasePrice}'}</code>{' '}
            <code className="font-mono bg-surface-secondary px-1 rounded">{'{downPayment}'}</code>{' '}
            and more.
          </p>
          <div className="space-y-3 mt-1">
            {smsTemplates.map(tpl => (
              <div key={tpl.id} className="border border-surface-border rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-surface-secondary flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{tpl.name}</p>
                    {tpl.state && <span className="text-[10px] text-ink-muted">{tpl.source} · {tpl.state} · {tpl.loanType}</span>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setPreviewTpl({ type: 'sms', tpl, filled: fillTemplate(tpl.body, SAMPLE_LEAD) })}
                      className="px-2 py-1 text-[10px] font-semibold rounded border border-surface-border text-ink-secondary hover:bg-white transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setEditingTemplate(editingTemplate === tpl.id ? null : tpl.id)}
                      className="px-2 py-1 text-[10px] font-semibold rounded border border-surface-border text-ink-secondary hover:bg-white transition-colors"
                    >
                      {editingTemplate === tpl.id ? 'Done' : 'Edit'}
                    </button>
                  </div>
                </div>
                {editingTemplate === tpl.id ? (
                  <textarea
                    value={tpl.body}
                    onChange={e => updateSmsTemplate(tpl.id, e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 text-xs font-mono text-ink resize-none focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                ) : (
                  <p className="px-3 py-2 text-xs text-ink-secondary leading-relaxed line-clamp-3">{tpl.body}</p>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* ── Email Templates ── */}
        <Section title="Email Templates" icon="📧">
          <div className="space-y-3">
            {emailTemplates.map(tpl => (
              <div key={tpl.id} className="border border-surface-border rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-surface-secondary flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink">{tpl.name}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPreviewTpl({ type: 'email', tpl, filled: fillTemplate(tpl.body, SAMPLE_LEAD), subject: fillTemplate(tpl.subject, SAMPLE_LEAD) })}
                      className="px-2 py-1 text-[10px] font-semibold rounded border border-surface-border text-ink-secondary hover:bg-white transition-colors"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setEditingTemplate(editingTemplate === tpl.id ? null : tpl.id)}
                      className="px-2 py-1 text-[10px] font-semibold rounded border border-surface-border text-ink-secondary hover:bg-white transition-colors"
                    >
                      {editingTemplate === tpl.id ? 'Done' : 'Edit'}
                    </button>
                  </div>
                </div>
                {editingTemplate === tpl.id ? (
                  <div className="px-3 py-2 space-y-2">
                    <input
                      value={tpl.subject}
                      onChange={e => updateEmailTemplate(tpl.id, 'subject', e.target.value)}
                      placeholder="Subject line…"
                      className="w-full text-xs px-2 py-1.5 border border-surface-border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/30"
                    />
                    <textarea
                      value={tpl.body}
                      onChange={e => updateEmailTemplate(tpl.id, 'body', e.target.value)}
                      rows={5}
                      className="w-full text-xs font-mono text-ink resize-none focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-ink-muted mb-0.5">Subject: {tpl.subject}</p>
                    <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3">{tpl.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Template preview modal */}
        {previewTpl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setPreviewTpl(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-3" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-800">Template Preview</h3>
                <button onClick={() => setPreviewTpl(null)} className="text-ink-muted hover:text-ink">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-[10px] text-ink-muted">Filled with sample lead: Carlos Rivera · NV · LeadPops · $425k purchase</p>
              {previewTpl.subject && (
                <div className="bg-surface-secondary rounded-xl px-3 py-2">
                  <p className="text-[10px] text-ink-muted mb-0.5 font-semibold">SUBJECT</p>
                  <p className="text-sm text-ink">{previewTpl.subject}</p>
                </div>
              )}
              <div className="bg-surface-secondary rounded-xl px-3 py-3">
                <p className="text-[10px] text-ink-muted mb-0.5 font-semibold">BODY</p>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{previewTpl.filled}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Danger Zone ── */}
        <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-card">
          <div className="px-4 py-3 bg-red-600">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Danger Zone</h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Sign Out</p>
              <p className="text-xs text-ink-muted mt-0.5">Clears authentication, returns to login</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
