// Demo seed data — loads realistic timeline events + tasks into localStorage
// on first app load when USE_MOCK=true. Key: tf_demo_seeded_v3

import { USE_MOCK } from './apiConfig.js'

const SEED_KEY = 'tf_demo_seeded_v3'

// ─── Helper: build an event object ───────────────────────────────────────────
function evt(id, leadRowNumber, timestamp, type, fields) {
  const body = fields.body || ''
  return {
    id,
    leadRowNumber,
    timestamp,
    createdBy: 'Nick Flores',
    type,
    body,
    preview: body.slice(0, 100),
    ...fields,
  }
}

const INTRO_EMAIL_BODY = (firstName, loanType) =>
`Hi ${firstName},

Thank you for reaching out about your ${loanType} inquiry! My name is Nick Flores with Team Flores at Sunnyhill Mortgage, and I'd love to help you navigate the home loan process.

Based on your information, I believe we can find a great ${loanType} solution tailored to your needs. I specialize in helping Las Vegas families find the right mortgage — whether you're purchasing, refinancing, or accessing your equity, I'm here to guide you every step of the way.

I'd love to schedule a quick 15-minute call to discuss your goals and walk you through your options. Feel free to call me directly at (702) 497-6370, or simply reply to this email — I'm here to help!

Best,
Nick Flores
Mortgage Loan Originator | Team Flores | Sunnyhill Mortgage
(702) 497-6370 | NMLS# 1234567
"Closing Deals, Opening Doors"`

const REPLY_EMAIL_BODY = (firstName, loanType) =>
`Hi Nick,

Thanks for reaching out! I'm definitely interested in learning more. A few questions:

- What rates are you currently seeing for a ${loanType}?
- How long does the process typically take from start to close?
- What documents will I need to gather upfront?

I'm available for a call most mornings this week — let me know what time works best for you!

Thanks,
${firstName}`

const FOLLOW_UP_TEXT = (firstName, loanType) =>
`Hi ${firstName}, this is Nick Flores from Team Flores. I sent you an email about your ${loanType} inquiry. Would love to connect — feel free to call me at (702) 497-6370 or reply here!`

const CALL_NOTE = (firstName, situation, loanType, creditScore) =>
`Spoke with ${firstName} for 15 minutes. They are ${situation}. Discussed ${loanType} options. Very interested. Sending loan estimate tomorrow. Credit score ${creditScore}.`

const APPT_NOTE = (price) =>
`Phone consultation scheduled. Will discuss loan options and next steps. Lead is pre-approved target range $${Number(price).toLocaleString()}.`

const CLOSING_NOTE = (firstName, propertyType, action) =>
`Loan successfully funded. ${firstName} ${action} in Las Vegas. Great client to work with. Request referrals.`

const QUAL_NOTE = (firstName, detail) =>
`Gathering documents for ${firstName}. ${detail} Moving forward with pre-approval.`

// ─── Timeline events keyed by lead rowNumber ──────────────────────────────────
export const demoTimelineEvents = {

  // ── Maria Garcia (rowNumber 2) — Home Purchase — Contacted ─────────────────
  2: [
    evt('d2-4', 2, '2026-02-18T10:00:00Z', 'text_sent', {
      body: FOLLOW_UP_TEXT('Maria', 'Home Purchase'),
      to: '(702) 318-4521',
    }),
    evt('d2-3', 2, '2026-02-16T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Maria', 'Home Purchase'),
      to: 'maria.garcia@gmail.com',
    }),
    evt('d2-2', 2, '2026-02-16T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d2-1', 2, '2026-02-15T14:30:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. Home Purchase inquiry — $435,000 target, 20% down. Excellent credit.',
      source: 'Google',
    }),
  ],

  // ── James Wilson (rowNumber 3) — VA Loan — Qualified ──────────────────────
  3: [
    evt('d3-7', 3, '2026-02-14T10:00:00Z', 'note', {
      body: QUAL_NOTE('James', 'VA certificate of eligibility received. COE uploaded to file.'),
    }),
    evt('d3-6', 3, '2026-02-12T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d3-5', 3, '2026-02-05T10:30:00Z', 'call', {
      body: CALL_NOTE('James', 'a veteran ready to use his VA benefit for his first home purchase', 'VA Loan', '700-739'),
      to: '(702) 445-7832',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d3-4', 3, '2026-02-04T14:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('James', 'VA Loan'),
      from: 'james.wilson@gmail.com',
    }),
    evt('d3-3', 3, '2026-02-03T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('James', 'VA Loan'),
      to: 'james.wilson@gmail.com',
    }),
    evt('d3-2', 3, '2026-02-03T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d3-1', 3, '2026-02-01T10:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Zillow. VA Loan inquiry — $395,000, $0 down. Veteran. Good credit.',
      source: 'Zillow',
    }),
  ],

  // ── Sarah Johnson (rowNumber 4) — Home Refinance — Closed ─────────────────
  4: [
    evt('d4-10', 4, '2026-03-02T15:30:00Z', 'note', {
      body: CLOSING_NOTE('Sarah', 'single family home', 'refinanced her primary residence in Summerlin — lowered rate by 1.2%'),
    }),
    evt('d4-9', 4, '2026-03-02T15:00:00Z', 'status_change', {
      body: 'Status updated to Closed.',
      from: 'Qualified', to: 'Closed',
    }),
    evt('d4-8', 4, '2026-01-05T10:00:00Z', 'note', {
      body: APPT_NOTE('480000'),
    }),
    evt('d4-7', 4, '2025-12-29T14:00:00Z', 'appointment', {
      body: 'Phone consultation scheduled with Sarah to review refinance terms and lock rate.',
      appointmentType: 'Phone Call',
      appointmentDate: '2025-12-29T14:00:00Z',
    }),
    evt('d4-6', 4, '2025-12-26T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d4-5', 4, '2025-12-23T10:00:00Z', 'call', {
      body: CALL_NOTE('Sarah', 'looking to refinance her current home to take advantage of lower rates', 'Home Refinance', '760-799'),
      to: '(702) 562-9043',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d4-4', 4, '2025-12-22T11:30:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Sarah', 'Home Refinance'),
      from: 'sarah.johnson@gmail.com',
    }),
    evt('d4-3', 4, '2025-12-21T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Sarah', 'Home Refinance'),
      to: 'sarah.johnson@gmail.com',
    }),
    evt('d4-2', 4, '2025-12-21T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d4-1', 4, '2025-12-20T10:15:00Z', 'lead_submitted', {
      body: 'New lead submitted via Sunnyhill Past Client Referral. Home Refinance — $480,000. Excellent credit. Past client of Sunnyhill.',
      source: 'Sunnyhill Past Client Referral',
    }),
  ],

  // ── Robert Martinez (rowNumber 5) — HELOC/Equity — New ────────────────────
  5: [
    evt('d5-1', 5, '2026-03-10T14:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. HELOC/Equity inquiry — home value $355,000. Average credit. Wants to access equity.',
      source: 'Google',
    }),
  ],

  // ── Jennifer Davis (rowNumber 6) — Home Purchase — Contacted ──────────────
  6: [
    evt('d6-4', 6, '2026-02-23T10:00:00Z', 'text_sent', {
      body: FOLLOW_UP_TEXT('Jennifer', 'Home Purchase'),
      to: '(702) 891-2354',
    }),
    evt('d6-3', 6, '2026-02-21T09:35:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Jennifer', 'Home Purchase'),
      to: 'jennifer.davis@gmail.com',
    }),
    evt('d6-2', 6, '2026-02-21T09:30:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d6-1', 6, '2026-02-20T11:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Zillow. Home Purchase — $385,000, 20% down. First-time buyer. Good credit.',
      source: 'Zillow',
    }),
  ],

  // ── Michael Brown (rowNumber 7) — VA Loan — Qualified ─────────────────────
  7: [
    evt('d7-7', 7, '2026-02-18T10:00:00Z', 'note', {
      body: QUAL_NOTE('Michael', 'Documents submitted. Pre-approval letter issued. VA appraisal eligibility confirmed.'),
    }),
    evt('d7-6', 7, '2026-02-15T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d7-5', 7, '2026-02-08T10:00:00Z', 'call', {
      body: CALL_NOTE('Michael', 'a veteran with excellent credit ready to purchase a single family home', 'VA Loan', '760-799'),
      to: '(702) 677-5129',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d7-4', 7, '2026-02-07T11:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Michael', 'VA Loan'),
      from: 'michael.brown@gmail.com',
    }),
    evt('d7-3', 7, '2026-02-06T09:35:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Michael', 'VA Loan'),
      to: 'michael.brown@gmail.com',
    }),
    evt('d7-2', 7, '2026-02-06T09:30:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d7-1', 7, '2026-02-05T14:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. VA Loan — $450,000, $0 down. Veteran. Excellent credit 760-799.',
      source: 'Google',
    }),
  ],

  // ── Lisa Anderson (rowNumber 8) — Home Purchase — New ─────────────────────
  8: [
    evt('d8-1', 8, '2026-03-08T11:30:00Z', 'lead_submitted', {
      body: 'New lead submitted via Social Media. Home Purchase — $275,000 condo, 3.5% down. First-time buyer. Fair credit.',
      source: 'Social Media',
    }),
  ],

  // ── David Taylor (rowNumber 9) — Home Refinance — Closed ──────────────────
  9: [
    evt('d9-10', 9, '2026-02-25T15:30:00Z', 'note', {
      body: CLOSING_NOTE('David', 'single family home', 'refinanced his primary residence — lowered monthly payment by $420/mo'),
    }),
    evt('d9-9', 9, '2026-02-25T15:00:00Z', 'status_change', {
      body: 'Status updated to Closed.',
      from: 'Qualified', to: 'Closed',
    }),
    evt('d9-8', 9, '2026-01-12T10:00:00Z', 'note', {
      body: APPT_NOTE('525000'),
    }),
    evt('d9-7', 9, '2026-01-08T14:00:00Z', 'appointment', {
      body: 'Phone consultation scheduled with David to review refinance options and 2-year cost savings analysis.',
      appointmentType: 'Phone Call',
      appointmentDate: '2026-01-08T14:00:00Z',
    }),
    evt('d9-6', 9, '2026-01-06T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d9-5', 9, '2026-01-02T10:00:00Z', 'call', {
      body: CALL_NOTE('David', 'a self-employed business owner looking to refinance and lower his monthly payment', 'Home Refinance', '720-739'),
      to: '(702) 718-4307',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d9-4', 9, '2025-12-30T11:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('David', 'Home Refinance'),
      from: 'david.taylor@gmail.com',
    }),
    evt('d9-3', 9, '2025-12-29T09:35:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('David', 'Home Refinance'),
      to: 'david.taylor@gmail.com',
    }),
    evt('d9-2', 9, '2025-12-29T09:30:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d9-1', 9, '2025-12-28T14:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Sunnyhill Past Client Referral. Home Refinance — $525,000. Self-employed. Good credit.',
      source: 'Sunnyhill Past Client Referral',
    }),
  ],

  // ── Ashley Thomas (rowNumber 10) — Conv Hybrid — Contacted ────────────────
  10: [
    evt('d10-4', 10, '2026-02-28T10:00:00Z', 'text_sent', {
      body: FOLLOW_UP_TEXT('Ashley', 'Conv Hybrid'),
      to: '(702) 523-6741',
    }),
    evt('d10-3', 10, '2026-02-26T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Ashley', 'Conv Hybrid'),
      to: 'ashley.thomas@gmail.com',
    }),
    evt('d10-2', 10, '2026-02-26T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d10-1', 10, '2026-02-25T16:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Realtor Referral. Conv Hybrid ARM — $595,000, 20% down. Excellent credit. Realtor referral from Lisa Chen.',
      source: 'Realtor Referral',
    }),
  ],

  // ── Christopher Jackson (rowNumber 11) — Home Purchase — Lost ─────────────
  11: [
    evt('d11-5', 11, '2026-02-05T09:30:00Z', 'note', {
      body: 'Lead went with another lender. Was rate shopping on Bankrate and found a lower advertised rate. Followed up twice with no response. Marking as lost. Credit score 660-699.',
    }),
    evt('d11-4', 11, '2026-02-05T09:00:00Z', 'status_change', {
      body: 'Status updated to Lost.',
      from: 'Contacted', to: 'Lost',
    }),
    evt('d11-3', 11, '2026-01-16T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Christopher', 'Home Purchase'),
      to: 'christopher.jackson@gmail.com',
    }),
    evt('d11-2', 11, '2026-01-16T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d11-1', 11, '2026-01-15T10:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Bankrate. Home Purchase — $320,000, 5% down. First-time buyer. Average credit.',
      source: 'Bankrate',
    }),
  ],

  // ── Amanda White (rowNumber 12) — VA Loan — Qualified ─────────────────────
  12: [
    evt('d12-7', 12, '2026-02-22T10:00:00Z', 'note', {
      body: QUAL_NOTE('Amanda', 'COE received and verified. VA appraisal ordered. Pre-approval letter issued.'),
    }),
    evt('d12-6', 12, '2026-02-20T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d12-5', 12, '2026-02-13T10:30:00Z', 'call', {
      body: CALL_NOTE('Amanda', 'active military purchasing her first primary residence using her VA benefit', 'VA Loan', '700-739'),
      to: '(702) 834-5627',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d12-4', 12, '2026-02-12T14:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Amanda', 'VA Loan'),
      from: 'amanda.white@gmail.com',
    }),
    evt('d12-3', 12, '2026-02-11T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Amanda', 'VA Loan'),
      to: 'amanda.white@gmail.com',
    }),
    evt('d12-2', 12, '2026-02-11T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d12-1', 12, '2026-02-10T11:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. VA Loan — $410,000, $0 down. Active military. Good credit.',
      source: 'Google',
    }),
  ],

  // ── Matthew Harris (rowNumber 13) — Home Purchase — New (today) ───────────
  13: [
    evt('d13-1', 13, '2026-03-16T10:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Zillow. Home Purchase — $485,000, 20% down. Excellent credit. Ready to buy.',
      source: 'Zillow',
    }),
  ],

  // ── Stephanie Martin (rowNumber 14) — Home Refinance — Contacted ──────────
  14: [
    evt('d14-4', 14, '2026-03-04T10:00:00Z', 'text_sent', {
      body: FOLLOW_UP_TEXT('Stephanie', 'Home Refinance'),
      to: '(702) 614-3782',
    }),
    evt('d14-3', 14, '2026-03-02T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Stephanie', 'Home Refinance'),
      to: 'stephanie.martin@gmail.com',
    }),
    evt('d14-2', 14, '2026-03-02T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d14-1', 14, '2026-03-01T10:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. Home Refinance — $440,000. Good credit. Looking to lower rate.',
      source: 'Google',
    }),
  ],

  // ── Joshua Thompson (rowNumber 15) — HELOC/Equity — Qualified ─────────────
  15: [
    evt('d15-7', 15, '2026-03-02T10:00:00Z', 'note', {
      body: QUAL_NOTE('Joshua', 'HELOC application submitted. Appraisal ordered. Accessing equity for kitchen remodel and ADU.'),
    }),
    evt('d15-6', 15, '2026-02-28T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d15-5', 15, '2026-02-21T10:00:00Z', 'call', {
      body: CALL_NOTE('Joshua', 'a homeowner wanting to access his home equity for a kitchen remodel and ADU addition', 'HELOC/Equity', '660-699'),
      to: '(702) 789-4523',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d15-4', 15, '2026-02-20T11:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Joshua', 'HELOC/Equity'),
      from: 'joshua.thompson@gmail.com',
    }),
    evt('d15-3', 15, '2026-02-19T09:35:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Joshua', 'HELOC/Equity'),
      to: 'joshua.thompson@gmail.com',
    }),
    evt('d15-2', 15, '2026-02-19T09:30:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d15-1', 15, '2026-02-18T15:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Bankrate. HELOC/Equity — home value $390,000. Average credit. Home improvement project.',
      source: 'Bankrate',
    }),
  ],

  // ── Megan Garcia (rowNumber 16) — Home Purchase — Closed ──────────────────
  16: [
    evt('d16-10', 16, '2026-03-05T16:30:00Z', 'note', {
      body: CLOSING_NOTE('Megan', 'single family home', 'purchased a beautiful single family home in Summerlin'),
    }),
    evt('d16-9', 16, '2026-03-05T16:00:00Z', 'status_change', {
      body: 'Status updated to Closed.',
      from: 'Qualified', to: 'Closed',
    }),
    evt('d16-8', 16, '2026-01-20T10:00:00Z', 'note', {
      body: APPT_NOTE('545000'),
    }),
    evt('d16-7', 16, '2026-01-16T14:00:00Z', 'appointment', {
      body: 'Phone consultation scheduled with Megan to discuss purchase timeline, pre-approval, and loan options.',
      appointmentType: 'Phone Call',
      appointmentDate: '2026-01-16T14:00:00Z',
    }),
    evt('d16-6', 16, '2026-01-14T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d16-5', 16, '2026-01-08T10:30:00Z', 'call', {
      body: CALL_NOTE('Megan', 'a self-employed professional ready to purchase her first single family home in Las Vegas', 'Home Purchase', '780-799'),
      to: '(702) 351-8076',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d16-4', 16, '2026-01-07T14:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Megan', 'Home Purchase'),
      from: 'megan.garcia@gmail.com',
    }),
    evt('d16-3', 16, '2026-01-06T09:10:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Megan', 'Home Purchase'),
      to: 'megan.garcia@gmail.com',
    }),
    evt('d16-2', 16, '2026-01-06T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d16-1', 16, '2026-01-05T11:30:00Z', 'lead_submitted', {
      body: 'New lead submitted via Realtor Referral. Home Purchase — $545,000, 20% down. Realtor referral from Tom Bradley. Excellent credit.',
      source: 'Realtor Referral',
    }),
  ],

  // ── Andrew Martinez (rowNumber 17) — VA Loan — New ────────────────────────
  17: [
    evt('d17-1', 17, '2026-03-10T16:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. VA Loan — $345,000, $0 down. Veteran. Fair credit 620-659. Will need credit counseling guidance.',
      source: 'Google',
    }),
  ],

  // ── Lauren Robinson (rowNumber 18) — Home Purchase — Contacted (yesterday) ─
  18: [
    evt('d18-4', 18, '2026-03-16T08:00:00Z', 'text_sent', {
      body: FOLLOW_UP_TEXT('Lauren', 'Home Purchase'),
      to: '(702) 956-2847',
    }),
    evt('d18-3', 18, '2026-03-15T16:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Lauren', 'Home Purchase'),
      to: 'lauren.robinson@gmail.com',
    }),
    evt('d18-2', 18, '2026-03-15T16:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d18-1', 18, '2026-03-15T14:30:00Z', 'lead_submitted', {
      body: 'New lead submitted via Zillow. Home Purchase — $400,000 townhouse, 20% down. First-time buyer. Good credit. Realtor already engaged.',
      source: 'Zillow',
    }),
  ],

  // ── Ryan Clark (rowNumber 19) — Conv Hybrid — Qualified (yesterday) ────────
  19: [
    evt('d19-7', 19, '2026-03-16T10:35:00Z', 'note', {
      body: QUAL_NOTE('Ryan', 'Pre-approval letter issued for $625,000. 5/1 ARM is the right product for his 5-year plan.'),
    }),
    evt('d19-6', 19, '2026-03-16T10:30:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d19-5', 19, '2026-03-16T09:00:00Z', 'call', {
      body: CALL_NOTE('Ryan', 'a self-employed professional looking for a 5/1 ARM for his move-up purchase', 'Conv Hybrid', '760-799'),
      to: '(702) 723-4819',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d19-4', 19, '2026-03-15T16:30:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Ryan', 'Conv Hybrid'),
      from: 'ryan.clark@gmail.com',
    }),
    evt('d19-3', 19, '2026-03-15T14:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Ryan', 'Conv Hybrid'),
      to: 'ryan.clark@gmail.com',
    }),
    evt('d19-2', 19, '2026-03-15T14:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d19-1', 19, '2026-03-15T10:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Realtor Referral. Conv Hybrid ARM — $625,000, 20% down. Self-employed. Excellent credit.',
      source: 'Realtor Referral',
    }),
  ],

  // ── Brittany Rodriguez (rowNumber 20) — Home Purchase — New ───────────────
  20: [
    evt('d20-1', 20, '2026-03-11T13:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Social Media. Home Purchase — $310,000 condo, 5% down. First-time buyer. Average credit.',
      source: 'Social Media',
    }),
  ],

  // ── Kevin Lewis (rowNumber 21) — Home Refinance — Closed ──────────────────
  21: [
    evt('d21-10', 21, '2026-03-10T15:30:00Z', 'note', {
      body: CLOSING_NOTE('Kevin', 'single family home', 'refinanced his primary residence — lowered monthly payment by $380/mo. Has already referred a neighbor!'),
    }),
    evt('d21-9', 21, '2026-03-10T15:00:00Z', 'status_change', {
      body: 'Status updated to Closed.',
      from: 'Qualified', to: 'Closed',
    }),
    evt('d21-8', 21, '2026-01-25T10:00:00Z', 'note', {
      body: APPT_NOTE('465000'),
    }),
    evt('d21-7', 21, '2026-01-20T14:00:00Z', 'appointment', {
      body: 'Phone consultation scheduled with Kevin to review refinance options and break-even analysis.',
      appointmentType: 'Phone Call',
      appointmentDate: '2026-01-20T14:00:00Z',
    }),
    evt('d21-6', 21, '2026-01-18T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d21-5', 21, '2026-01-11T10:00:00Z', 'call', {
      body: CALL_NOTE('Kevin', 'looking to reduce his monthly payment by refinancing to a lower rate', 'Home Refinance', '720-739'),
      to: '(702) 547-9321',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d21-4', 21, '2026-01-10T11:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Kevin', 'Home Refinance'),
      from: 'kevin.lewis@gmail.com',
    }),
    evt('d21-3', 21, '2026-01-09T09:35:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Kevin', 'Home Refinance'),
      to: 'kevin.lewis@gmail.com',
    }),
    evt('d21-2', 21, '2026-01-09T09:30:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d21-1', 21, '2026-01-08T09:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Sunnyhill Past Client Referral. Home Refinance — $465,000. Good credit. Past Sunnyhill client.',
      source: 'Sunnyhill Past Client Referral',
    }),
  ],

  // ── Samantha Lee (rowNumber 22) — Home Purchase — Contacted ───────────────
  22: [
    evt('d22-4', 22, '2026-03-08T10:00:00Z', 'text_sent', {
      body: FOLLOW_UP_TEXT('Samantha', 'Home Purchase'),
      to: '(702) 829-4615',
    }),
    evt('d22-3', 22, '2026-03-06T09:35:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Samantha', 'Home Purchase'),
      to: 'samantha.lee@gmail.com',
    }),
    evt('d22-2', 22, '2026-03-06T09:30:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d22-1', 22, '2026-03-05T15:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. Home Purchase — $510,000, 20% down. Excellent credit. Looking at Summerlin and Henderson.',
      source: 'Google',
    }),
  ],

  // ── Tyler Walker (rowNumber 23) — VA Loan — Qualified (2 days ago) ─────────
  23: [
    evt('d23-7', 23, '2026-03-16T09:15:00Z', 'note', {
      body: QUAL_NOTE('Tyler', 'VA pre-approval letter issued. COE verified. Agent notified.'),
    }),
    evt('d23-6', 23, '2026-03-16T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d23-5', 23, '2026-03-15T14:00:00Z', 'call', {
      body: CALL_NOTE('Tyler', 'a veteran using his VA benefit for the first time to purchase his primary residence', 'VA Loan', '720-739'),
      to: '(702) 634-8172',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d23-4', 23, '2026-03-15T10:00:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Tyler', 'VA Loan'),
      from: 'tyler.walker@gmail.com',
    }),
    evt('d23-3', 23, '2026-03-14T14:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Tyler', 'VA Loan'),
      to: 'tyler.walker@gmail.com',
    }),
    evt('d23-2', 23, '2026-03-14T14:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d23-1', 23, '2026-03-14T09:15:00Z', 'lead_submitted', {
      body: 'New lead submitted via Google. VA Loan — $420,000, $0 down. Veteran, first VA loan. Good credit.',
      source: 'Google',
    }),
  ],

  // ── Nicole Hall (rowNumber 24) — HELOC/Equity — New (today) ───────────────
  24: [
    evt('d24-1', 24, '2026-03-16T05:15:00Z', 'lead_submitted', {
      body: 'New lead submitted via Bankrate. HELOC/Equity — home value $365,000. Average credit. Equity access inquiry.',
      source: 'Bankrate',
    }),
  ],

  // ── Brandon Allen (rowNumber 25) — Home Purchase — Closed ─────────────────
  25: [
    evt('d25-10', 25, '2026-03-12T16:30:00Z', 'note', {
      body: CLOSING_NOTE('Brandon', 'single family home', 'purchased a beautiful single family home in Summerlin. Smooth, fast transaction — 32 days start to close'),
    }),
    evt('d25-9', 25, '2026-03-12T16:00:00Z', 'status_change', {
      body: 'Status updated to Closed.',
      from: 'Qualified', to: 'Closed',
    }),
    evt('d25-8', 25, '2026-02-05T10:00:00Z', 'note', {
      body: APPT_NOTE('580000'),
    }),
    evt('d25-7', 25, '2026-02-01T14:00:00Z', 'appointment', {
      body: 'Phone consultation scheduled with Brandon to review pre-approval letter and next steps in purchase process.',
      appointmentType: 'Phone Call',
      appointmentDate: '2026-02-01T14:00:00Z',
    }),
    evt('d25-6', 25, '2026-01-30T09:00:00Z', 'status_change', {
      body: 'Status updated to Qualified.',
      from: 'Contacted', to: 'Qualified',
    }),
    evt('d25-5', 25, '2026-01-23T11:00:00Z', 'call', {
      body: CALL_NOTE('Brandon', 'ready to purchase a single family home in Las Vegas with strong income and excellent credit', 'Home Purchase', '780-799'),
      to: '(702) 918-6347',
      outcome: 'Spoke with Lead',
      duration: 15,
    }),
    evt('d25-4', 25, '2026-01-22T10:30:00Z', 'email_received', {
      subject: 'Re: Your Home Loan Options',
      body: REPLY_EMAIL_BODY('Brandon', 'Home Purchase'),
      from: 'brandon.allen@gmail.com',
    }),
    evt('d25-3', 25, '2026-01-21T09:05:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Brandon', 'Home Purchase'),
      to: 'brandon.allen@gmail.com',
    }),
    evt('d25-2', 25, '2026-01-21T09:00:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d25-1', 25, '2026-01-20T14:00:00Z', 'lead_submitted', {
      body: 'New lead submitted via Zillow. Home Purchase — $580,000, 20% down. Excellent credit 780-799. Ready to buy immediately.',
      source: 'Zillow',
    }),
  ],

  // ── Kayla Young (rowNumber 26) — Home Purchase — Contacted (today) ─────────
  26: [
    evt('d26-4', 26, '2026-03-16T09:00:00Z', 'text_sent', {
      body: FOLLOW_UP_TEXT('Kayla', 'Home Purchase'),
      to: '(702) 265-7483',
    }),
    evt('d26-3', 26, '2026-03-16T08:40:00Z', 'email_sent', {
      subject: 'Your Home Loan Options — Nick Flores, Team Flores',
      body: INTRO_EMAIL_BODY('Kayla', 'Home Purchase'),
      to: 'kayla.young@gmail.com',
    }),
    evt('d26-2', 26, '2026-03-16T08:35:00Z', 'status_change', {
      body: 'Status updated to Contacted.',
      from: 'New', to: 'Contacted',
    }),
    evt('d26-1', 26, '2026-03-16T08:30:00Z', 'lead_submitted', {
      body: 'New lead submitted via Realtor Referral. Home Purchase — $385,000, 20% down. First-time buyer. Good credit. Referral from realtor Mark Davis.',
      source: 'Realtor Referral',
    }),
  ],
}

// ─── Demo Tasks ───────────────────────────────────────────────────────────────
export const demoTasks = [
  {
    id: 'demo-task-1',
    title: 'Follow up with Maria Garcia',
    dueDate: '2026-03-16',
    priority: 'High',
    linkedLeadId: 2,
    notes: 'She submitted a Home Purchase inquiry 2/15. Emailed and texted — no response yet. Call her directly today.',
    completed: false,
    createdAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'demo-task-2',
    title: 'Send loan estimate to James Wilson',
    dueDate: '2026-03-16',
    priority: 'High',
    linkedLeadId: 3,
    notes: 'VA Loan — $395,000. COE received. Ready to issue pre-approval and loan estimate.',
    completed: false,
    createdAt: '2026-03-15T09:30:00Z',
  },
  {
    id: 'demo-task-3',
    title: 'Review documents from Amanda White',
    dueDate: '2026-03-17',
    priority: 'Medium',
    linkedLeadId: 12,
    notes: 'Active military VA loan. COE and pay stubs submitted. Review and confirm all docs are complete.',
    completed: false,
    createdAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'demo-task-4',
    title: 'Schedule call with Robert Martinez',
    dueDate: '2026-03-17',
    priority: 'Medium',
    linkedLeadId: 5,
    notes: 'New HELOC/Equity inquiry submitted 3/10. Reach out to schedule initial consultation.',
    completed: false,
    createdAt: '2026-03-15T10:30:00Z',
  },
  {
    id: 'demo-task-5',
    title: 'Send rate update to Jennifer Davis',
    dueDate: '2026-03-20',
    priority: 'Low',
    linkedLeadId: 6,
    notes: 'Contacted 2/21 but no response. Rates changed — send updated rate sheet as a re-engagement touch.',
    completed: false,
    createdAt: '2026-03-15T11:00:00Z',
  },
  {
    id: 'demo-task-6',
    title: 'Check in with Joshua Thompson',
    dueDate: '2026-03-19',
    priority: 'Medium',
    linkedLeadId: 15,
    notes: 'HELOC appraisal was ordered 3/2. Follow up on appraisal status and keep momentum.',
    completed: false,
    createdAt: '2026-03-15T11:30:00Z',
  },
  {
    id: 'demo-task-7',
    title: 'Prepare closing docs for Brandon Allen',
    dueDate: '2026-03-14',
    priority: 'High',
    linkedLeadId: 25,
    notes: 'OVERDUE — Closing docs need final review and e-signature links sent. Closing scheduled 3/12.',
    completed: false,
    createdAt: '2026-03-12T08:00:00Z',
  },
  {
    id: 'demo-task-8',
    title: 'Call Kayla Young back',
    dueDate: '2026-03-13',
    priority: 'High',
    linkedLeadId: 26,
    notes: 'OVERDUE — Hot realtor referral. Emailed and texted this morning. She wants to discuss rates today.',
    completed: false,
    createdAt: '2026-03-13T07:00:00Z',
  },
  {
    id: 'demo-task-9',
    title: 'Send referral thank-you to Sarah Johnson',
    dueDate: '2026-03-23',
    priority: 'Low',
    linkedLeadId: 4,
    notes: 'Loan closed 3/2. Sarah mentioned she would refer coworkers. Send a personal thank-you with referral card.',
    completed: false,
    createdAt: '2026-03-15T14:00:00Z',
  },
  {
    id: 'demo-task-10',
    title: 'Review new leads from this week',
    dueDate: '2026-03-20',
    priority: 'Medium',
    linkedLeadId: null,
    notes: 'Review Matthew Harris, Nicole Hall, and Kayla Young. Prioritize outreach order based on credit and loan type.',
    completed: false,
    createdAt: '2026-03-16T07:00:00Z',
  },
]

// ─── Seed function ────────────────────────────────────────────────────────────
export function seedDemoData() {
  if (!USE_MOCK) return
  if (localStorage.getItem(SEED_KEY)) return

  // Seed timeline events per lead
  Object.entries(demoTimelineEvents).forEach(([rowNumber, events]) => {
    const key = `crm_timeline_${rowNumber}`
    // Only seed if not already customized
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(events))
    }
  })

  // Seed tasks if none exist yet
  const existingTasks = localStorage.getItem('tf_tasks')
  if (!existingTasks || existingTasks === '[]') {
    localStorage.setItem('tf_tasks', JSON.stringify(demoTasks))
  }

  localStorage.setItem(SEED_KEY, 'true')
}
