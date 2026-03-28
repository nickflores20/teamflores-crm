/**
 * templateEngine.js
 * Auto-selects and fills the best SMS/email template for a lead.
 * Priority: source+state+loanType → source+loanType → source → generic
 */

const STATE_MAP = {
  NV: 'Nevada', AZ: 'Arizona', CA: 'California',
  FL: 'Florida', TX: 'Texas', WA: 'Washington', OR: 'Oregon',
}

// ─── SMS Templates ──────────────────────────────────────────────────────────

export const SMS_TEMPLATES = [
  // 1. LeadPops Purchase (any state)
  {
    id: 'leadpops-purchase-any',
    name: 'LeadPops Purchase (Any State)',
    source: 'LeadPops',
    loanType: 'purchase',
    state: null,
    body: `Hi Leadpops Purchase {state}, this is Nick Flores Division Director for the State of {stateFull} with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into website and how I can possibly help you get in at this low competitive rate for your purchase scenario. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 2. LeadPops Refi (any state)
  {
    id: 'leadpops-refi-any',
    name: 'LeadPops Refi (Any State)',
    source: 'LeadPops',
    loanType: 'refi',
    state: null,
    body: `Hi Leadpops Refi {state}, this is Nick Flores Division Director for the State of {stateFull} with Sunnyhill Financial. Let's discuss your refinance based on the information you inputted into website and how I can possibly help you get in at this low competitive rate for your refinance scenario. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 3. LeadPops NV Purchase (specific)
  {
    id: 'leadpops-nv-purchase',
    name: 'LeadPops NV Purchase',
    source: 'LeadPops',
    loanType: 'purchase',
    state: 'NV',
    body: `Hi Leadpops NV Purchase, this is Nick Flores Division Director for the State of Nevada with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into website and how I can possibly help you get in at this low competitive rate for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment}. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 4. Bankrate Purchase NV
  {
    id: 'bankrate-nv-purchase',
    name: 'Bankrate Purchase NV',
    source: 'Bankrate',
    loanType: 'purchase',
    state: 'NV',
    body: `Hi NV, this is Nick Flores Division Director for the State of Nevada with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with an excellent Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 5. Bankrate Purchase AZ
  {
    id: 'bankrate-az-purchase',
    name: 'Bankrate Purchase AZ',
    source: 'Bankrate',
    loanType: 'purchase',
    state: 'AZ',
    body: `Hi AZ, this is Nick Flores Division Director for the State of Arizona with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with an excellent Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 6. Bankrate Purchase WA
  {
    id: 'bankrate-wa-purchase',
    name: 'Bankrate Purchase WA',
    source: 'Bankrate',
    loanType: 'purchase',
    state: 'WA',
    body: `Hi WA, this is Nick Flores Division Director for the State of Washington with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with an excellent Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 7. Bankrate Purchase FL
  {
    id: 'bankrate-fl-purchase',
    name: 'Bankrate Purchase FL',
    source: 'Bankrate',
    loanType: 'purchase',
    state: 'FL',
    body: `Hi FL, this is Nick Flores Division Director for the State of Florida with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with a good Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 8. Bankrate Purchase CA
  {
    id: 'bankrate-ca-purchase',
    name: 'Bankrate Purchase CA',
    source: 'Bankrate',
    loanType: 'purchase',
    state: 'CA',
    body: `Hi CA, this is Nick Flores Division Director for the State of California with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with an excellent Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 9. Bankrate Purchase OR
  {
    id: 'bankrate-or-purchase',
    name: 'Bankrate Purchase OR',
    source: 'Bankrate',
    loanType: 'purchase',
    state: 'OR',
    body: `Hi OR, this is Nick Flores Division Director for the State of Oregon with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with an excellent Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 10. Bankrate Purchase TX
  {
    id: 'bankrate-tx-purchase',
    name: 'Bankrate Purchase TX',
    source: 'Bankrate',
    loanType: 'purchase',
    state: 'TX',
    body: `Hi TX, this is Nick Flores Division Director for the State of Texas with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with a good Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 11. Bankrate Refi NV
  {
    id: 'bankrate-nv-refi',
    name: 'Bankrate Refi NV',
    source: 'Bankrate',
    loanType: 'refi',
    state: 'NV',
    body: `Hi Refi Bankrate NV, this is Nick Flores Division Director for the State of Nevada with Sunnyhill Financial. Let's discuss your refinance based on the information you inputted into bankrate and how I can possibly help you get in at this low competitive rate. The {rate} with a {apr} APR is available for your refinance scenario. {propertyValue} property value with a fair Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 12. LeadPops TX Refi
  {
    id: 'leadpops-tx-refi',
    name: 'LeadPops TX Refi',
    source: 'LeadPops',
    loanType: 'refi',
    state: 'TX',
    body: `Hi Leadpops TX Refi, this is Nick Flores Division Director for the State of TX with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into website and how I can possibly help you get in at this low competitive rate for your refinance scenario. {loanBalance} balance with a fixed rate no cash out. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // 13. Zillow (any)
  {
    id: 'zillow-purchase-any',
    name: 'Zillow Purchase',
    source: 'Zillow',
    loanType: 'purchase',
    state: null,
    body: `Hi Zillow, this is Nick Flores Division Director with Sunnyhill Financial. Let's discuss your purchase based on the information you inputted into Zillow and how I can possibly help you get in at this low competitive rate for your purchase scenario. {purchasePrice} purchase with a downpayment of {downPayment} with a {ficoScore} Fico score. This is my direct line, so you can reply or call on this line. I will also send over an email to speed up the process. Thanks`,
  },
  // Generic fallback
  {
    id: 'generic-purchase',
    name: 'Generic Purchase Intro',
    source: null,
    loanType: 'purchase',
    state: null,
    body: `Hi {firstName}, this is Nick Flores Division Director for the State of {stateFull} with Sunnyhill Financial. I'd love to help with your {loanType} in {stateFull}. This is my direct line — reply or call anytime. Thanks`,
  },
  {
    id: 'generic-refi',
    name: 'Generic Refi Intro',
    source: null,
    loanType: 'refi',
    state: null,
    body: `Hi {firstName}, this is Nick Flores Division Director for the State of {stateFull} with Sunnyhill Financial. I'd love to help with your refinance in {stateFull}. This is my direct line — reply or call anytime. Thanks`,
  },
]

// ─── Email Templates ─────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES = [
  {
    id: 'credit-auth',
    name: 'Hard Credit Inquiry Authorization',
    subject: 'Credit Authorization — {firstName}',
    body: `In order to submit and lock with the best priced investor they require a hard credit pull. This will show as POC (paid outside closing) on your final settlement so you are not charged twice for the hard credit report. The other POC is the appraisal report. The cost for the credit report through Advantage Credit is $135 for a tri merge report. The link to click on is below 'Click Here To Run Your Credit'. Please let me know if you have any questions. https://credit.advcredit.com/smartpay/SmartPay.aspx?uid=8d121d8a-2ad8-44c8-8e17-83d2c2e423c0#forward`,
  },
  {
    id: 'initial-disclosures',
    name: 'Initial Disclosures — Action Required',
    subject: 'Initial Disclosures — Action Required, {firstName}',
    body: `Your initial disclosures have been sent to you by the Lender, NexBank. Please ensure you e-sign and return so we can submit your loan to Underwriting. PLEASE NOTE: These are initial disclosures only and the estimated fees may/will change when your loan closes. You are not committed in any way — esigning these just allows us to move your file to the next step, which is underwriting.`,
  },
  {
    id: 'pre-approval-link',
    name: 'Pre-Approval Link',
    subject: 'Your Pre-Approval Link — {firstName}',
    body: `In order to initiate the pre approval you can click this link here: https://sunnyhillfinancial.pos.yoursonar.com/?originator=nick@sunnyhillfinancial.com`,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeLoanType(loanType = '') {
  const lt = loanType.toLowerCase()
  if (lt.includes('refi') || lt.includes('refinan') || lt.includes('heloc') || lt.includes('equity')) return 'refi'
  return 'purchase'
}

function normalizeSource(source = '') {
  const s = source.toLowerCase()
  if (s.includes('bankrate')) return 'Bankrate'
  if (s.includes('leadpop') || s.includes('rebel') || s.includes('rebelpath')) return 'LeadPops'
  if (s.includes('zillow')) return 'Zillow'
  return null
}

/**
 * Returns the best-match SMS template for the given lead.
 * Selection priority: source+state+loanType → source+loanType → source-generic → loanType-generic → fallback
 */
export function selectSmsTemplate(lead) {
  const loanType  = normalizeLoanType(lead['Loan Type'] || '')
  const rawSource = lead['How Found'] || lead['Source'] || ''
  const source    = normalizeSource(rawSource)
  const state     = (lead['State'] || '').toUpperCase()

  // Priority 1: exact source + state + loanType
  if (source && state) {
    const exact = SMS_TEMPLATES.find(
      t => t.source === source && t.state === state && t.loanType === loanType
    )
    if (exact) return exact
  }

  // Priority 2: source + loanType (any state)
  if (source) {
    const bySourceLoan = SMS_TEMPLATES.find(
      t => t.source === source && t.state === null && t.loanType === loanType
    )
    if (bySourceLoan) return bySourceLoan
  }

  // Priority 3: source only (any loanType, any state)
  if (source) {
    const bySource = SMS_TEMPLATES.find(t => t.source === source && t.state === null)
    if (bySource) return bySource
  }

  // Priority 4: generic by loanType
  const generic = SMS_TEMPLATES.find(t => t.source === null && t.loanType === loanType)
  if (generic) return generic

  return SMS_TEMPLATES[SMS_TEMPLATES.length - 1]
}

/**
 * Fills template variables from a lead object.
 * Any missing variable is left as the original {placeholder}.
 */
export function fillTemplate(templateBody, lead) {
  const state  = (lead['State'] || '').toUpperCase()
  const vars = {
    firstName:     lead['First Name'] || '',
    state:         state || '',
    stateFull:     STATE_MAP[state] || state || '',
    loanType:      lead['Loan Type'] || '',
    source:        lead['How Found'] || '',
    purchasePrice: lead['Purchase Price'] ? `$${Number(lead['Purchase Price']).toLocaleString()}` : '{purchasePrice}',
    downPayment:   lead['Down Payment']   ? `$${Number(lead['Down Payment']).toLocaleString()}`   : '{downPayment}',
    ficoScore:     lead['Credit Score'] || '{ficoScore}',
    loanBalance:   lead['Loan Balance']   ? `$${Number(lead['Loan Balance']).toLocaleString()}`   : '{loanBalance}',
    propertyValue: lead['Property Value'] ? `$${Number(lead['Property Value']).toLocaleString()}` : '{propertyValue}',
    rate:          lead['Rate'] || '{rate}',
    apr:           lead['APR']  || '{apr}',
  }

  return templateBody.replace(/\{(\w+)\}/g, (match, key) => vars[key] !== undefined ? vars[key] : match)
}

/**
 * Returns a filled SMS body and metadata for a lead.
 */
export function getFilledSmsTemplate(lead) {
  const template = selectSmsTemplate(lead)
  return {
    templateId:   template.id,
    templateName: template.name,
    body:         fillTemplate(template.body, lead),
  }
}
