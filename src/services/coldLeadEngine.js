/**
 * coldLeadEngine.js
 * Background service that runs every 60 minutes.
 * - Detects leads with no contact for >= coldThreshold days → sets stage to Cold
 * - Starts cold sequences for leads with no active sequence
 * - Marks Dead after day 31 with no reply
 * - Reverts to Active if lead replies while Cold
 * - Logs every stage change in the lead's localStorage timeline
 */

const SETTINGS_KEY        = 'tf_automation_settings'
const SEQUENCE_STATE_KEY  = (rowNumber) => `tf_cold_seq_${rowNumber}`
const TIMELINE_KEY        = (rowNumber) => `crm_timeline_${rowNumber}`
const LAST_RUN_KEY        = 'tf_cold_engine_last_run'

// ─── Settings ────────────────────────────────────────────────────────────────

export function getAutomationSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {
    coldThreshold:      7,    // days
    autoSequence:       true,
    autoPauseOnReply:   true,
  }
}

export function saveAutomationSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// ─── Timeline helpers ────────────────────────────────────────────────────────

function getTimeline(rowNumber) {
  try { return JSON.parse(localStorage.getItem(TIMELINE_KEY(rowNumber)) || '[]') }
  catch { return [] }
}

function saveTimeline(rowNumber, events) {
  localStorage.setItem(TIMELINE_KEY(rowNumber), JSON.stringify(events))
}

export function logStageChange(rowNumber, oldStage, newStage, reason) {
  const events = getTimeline(rowNumber)
  events.unshift({
    id:        `sc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type:      'stage_change',
    timestamp: new Date().toISOString(),
    from:      oldStage,
    to:        newStage,
    reason,
    auto:      true,
  })
  saveTimeline(rowNumber, events)
}

function logSequenceEvent(rowNumber, step, message) {
  const events = getTimeline(rowNumber)
  events.unshift({
    id:        `seq-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type:      'sequence_event',
    timestamp: new Date().toISOString(),
    step,
    message,
  })
  saveTimeline(rowNumber, events)
}

// ─── Sequence state ──────────────────────────────────────────────────────────

export function getSequenceState(rowNumber) {
  try {
    const raw = localStorage.getItem(SEQUENCE_STATE_KEY(rowNumber))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null // null = no active sequence
}

export function saveSequenceState(rowNumber, state) {
  if (state === null) {
    localStorage.removeItem(SEQUENCE_STATE_KEY(rowNumber))
  } else {
    localStorage.setItem(SEQUENCE_STATE_KEY(rowNumber), JSON.stringify(state))
  }
}

// ─── Cold sequence definition ─────────────────────────────────────────────

const COLD_SEQUENCE_STEPS = [
  { day: 0,  type: 'text',  message: 'Send intro text using matched template for lead source/state/loanType' },
  { day: 3,  type: 'email', message: 'Email follow-up — check in, offer to answer questions' },
  { day: 7,  type: 'text',  message: 'Text: "Still looking to help with your {loanType}. Any questions?"' },
  { day: 14, type: 'email', message: 'Email: Final check-in — discuss current rates' },
  { day: 30, type: 'text',  message: 'Final text: "Last reach out — here if you need me."' },
  { day: 31, type: 'dead',  message: 'No reply after 31 days — moving to Dead' },
]

// ─── Last contact helper ──────────────────────────────────────────────────

const CONTACT_TYPES = ['email_sent', 'email_received', 'call', 'text_sent', 'text_received', 'note']

export function getDaysSinceLastContact(rowNumber) {
  const events = getTimeline(rowNumber)
  const contacts = events.filter(e => CONTACT_TYPES.includes(e.type))
  if (contacts.length === 0) return Infinity
  const latest = contacts.reduce((a, b) => new Date(a.timestamp) > new Date(b.timestamp) ? a : b)
  const diffMs = Date.now() - new Date(latest.timestamp).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

// ─── Main engine ──────────────────────────────────────────────────────────

/**
 * Run the cold lead engine against the current leads array.
 * Returns an array of { rowNumber, action, message } for any mutations made.
 * The caller (LeadsContext) is responsible for applying stage changes via setLeadStatus.
 */
export function runColdLeadEngine(leads) {
  const settings  = getAutomationSettings()
  const threshold = settings.coldThreshold || 7
  const now       = Date.now()
  const mutations = []

  for (const lead of leads) {
    const status     = lead['Status']
    const rowNumber  = lead.rowNumber
    const isProtected = ['Closed Won', 'Dead'].includes(status)

    if (isProtected) continue

    const daysSince = getDaysSinceLastContact(rowNumber)

    // 1. Inbound reply while Cold → revert to Active
    if (status === 'Cold') {
      const events  = getTimeline(rowNumber)
      const lastEv  = events[0]
      if (lastEv && lastEv.type === 'text_received' || (lastEv && lastEv.type === 'email_received')) {
        const seq = getSequenceState(rowNumber)
        if (seq && !seq.paused) {
          saveSequenceState(rowNumber, { ...seq, paused: true, pausedAt: new Date().toISOString() })
          logStageChange(rowNumber, 'Cold', 'Active', 'Lead replied — sequence paused automatically')
          mutations.push({
            rowNumber,
            newStatus: 'Active',
            action:    'reactivated',
            message:   `${lead['First Name']} ${lead['Last Name']} replied — sequence paused. Take over.`,
            alert:     true,
          })
        }
        continue
      }
    }

    // 2. Check cold threshold
    if (daysSince >= threshold && !isProtected) {
      if (status !== 'Cold' && status !== 'Dead') {
        logStageChange(rowNumber, status, 'Cold', `Auto-moved to Cold: no contact for ${daysSince} days`)
        mutations.push({
          rowNumber,
          newStatus: 'Cold',
          action:    'moved_cold',
          message:   `${lead['First Name']} ${lead['Last Name']} → Cold (${daysSince} days no contact)`,
        })

        // Start cold sequence if not already running
        if (settings.autoSequence) {
          const existingSeq = getSequenceState(rowNumber)
          if (!existingSeq) {
            const seqState = {
              startedAt:   new Date().toISOString(),
              currentStep: 0,
              paused:      false,
              nextStepDue: new Date(now + 0).toISOString(), // Day 0 = now
            }
            saveSequenceState(rowNumber, seqState)
            logSequenceEvent(rowNumber, 0, 'Cold sequence started automatically')
          }
        }
        continue
      }
    }

    // 3. Advance cold sequence steps
    const seq = getSequenceState(rowNumber)
    if (seq && !seq.paused && status === 'Cold') {
      const seqStartMs   = new Date(seq.startedAt).getTime()
      const daysSinceSeq = Math.floor((now - seqStartMs) / (1000 * 60 * 60 * 24))

      for (let i = seq.currentStep; i < COLD_SEQUENCE_STEPS.length; i++) {
        const step = COLD_SEQUENCE_STEPS[i]
        if (daysSinceSeq >= step.day) {
          if (step.type === 'dead') {
            logStageChange(rowNumber, 'Cold', 'Dead', 'Cold sequence exhausted — 31 days with no reply')
            saveSequenceState(rowNumber, null)
            mutations.push({ rowNumber, newStatus: 'Dead', action: 'dead', message: `${lead['First Name']} ${lead['Last Name']} → Dead (sequence exhausted)` })
            break
          } else {
            logSequenceEvent(rowNumber, step.day, `Day ${step.day}: ${step.type === 'text' ? '📱 Text' : '📧 Email'} — ${step.message}`)
            saveSequenceState(rowNumber, { ...seq, currentStep: i + 1, lastStepFiredAt: new Date().toISOString() })
          }
        }
      }
    }
  }

  localStorage.setItem(LAST_RUN_KEY, new Date().toISOString())
  return mutations
}

/**
 * Handle an inbound message for a lead.
 * Call this when a text/email is received.
 * Returns { shouldAlert, message } if the lead was on a cold sequence.
 */
export function handleInboundMessage(lead) {
  const status   = lead['Status']
  const settings = getAutomationSettings()

  if (!settings.autoPauseOnReply) return null

  if (status === 'Cold') {
    const seq = getSequenceState(lead.rowNumber)
    if (seq && !seq.paused) {
      saveSequenceState(lead.rowNumber, { ...seq, paused: true, pausedAt: new Date().toISOString() })
      logStageChange(lead.rowNumber, 'Cold', 'Active', 'Lead replied — sequence paused automatically')
      return {
        shouldAlert: true,
        newStatus:   'Active',
        message:     `${lead['First Name']} ${lead['Last Name']} replied — sequence paused. Take over.`,
      }
    }
  }

  return null
}

/**
 * Auto-assign stage when form is submitted (new lead).
 * Always returns 'New'.
 */
export function stageOnFormSubmit() {
  return 'New'
}

/**
 * Auto-assign stage when an outbound message is sent.
 * Only upgrades New → Contacted.
 */
export function stageOnOutboundMessage(currentStage) {
  if (currentStage === 'New') return 'Contacted'
  return currentStage
}

/**
 * Auto-assign stage when an inbound message is received.
 * Upgrades to Active unless already Qualified/In Progress/Closed Won.
 */
export function stageOnInboundMessage(currentStage) {
  const protected_ = ['Qualified', 'In Progress', 'Closed Won', 'Dead']
  if (protected_.includes(currentStage)) return currentStage
  return 'Active'
}
