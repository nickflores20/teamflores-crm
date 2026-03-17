// Lead score calculation — Team Flores CRM
// Score 0–100 based on 5 dimensions

function parseCreditLower(raw) {
  if (!raw) return 0
  // "760-799" → take the lower bound
  const match = String(raw).match(/(\d{3,})/)
  return match ? parseInt(match[1]) : 0
}

function creditPoints(raw) {
  const n = parseCreditLower(raw)
  if (n >= 740) return 30
  if (n >= 700) return 25
  if (n >= 660) return 15
  if (n >= 600) return 10
  if (n > 0)    return 5
  return 0
}

function employmentPoints(raw) {
  const v = (raw || '').toLowerCase()
  if (v === 'employed')                                    return 20
  if (v === 'military' || v.includes('veteran'))           return 20
  if (v === 'self-employed' || v === 'self employed')      return 15
  if (v === 'retired')                                     return 10
  return 0
}

function downPaymentPoints(lead) {
  const price = Number(String(lead['Purchase Price'] || '0').replace(/[^0-9.-]/g, '')) || 0
  const down  = Number(String(lead['Down Payment']   || '0').replace(/[^0-9.-]/g, '')) || 0
  if (price === 0) return 8
  const pct = (down / price) * 100
  if (pct >= 20) return 20
  if (pct >= 15) return 18
  if (pct >= 10) return 15
  if (pct >= 5)  return 12
  if (pct >= 3)  return 8
  return 5
}

function incomePoints(raw) {
  const v = (raw || '').toLowerCase()
  if (v === 'yes')                                         return 15
  if (v.includes('working') || v.includes('progress'))    return 5
  return 0
}

function situationPoints(raw) {
  const v = (raw || '').toLowerCase()
  if (v.includes('signed') || v.includes('agreement'))    return 15
  if (v.includes('offer') || v.includes('pending'))       return 12
  if (v.includes('ready') || v.includes('month') || v.includes('buy')) return 8
  if (v.includes('research') || v.includes('explor'))     return 3
  return 3
}

export function calculateLeadScore(lead) {
  const score = Math.min(100,
    creditPoints(lead['Credit Score']) +
    employmentPoints(lead['Employment Status']) +
    downPaymentPoints(lead) +
    incomePoints(lead['Proof of Income']) +
    situationPoints(lead['Purchase Situation'])
  )

  let label, color, bg, textColor
  if (score >= 80) {
    label = 'Hot';  color = '#16A34A'; bg = '#DCFCE7'; textColor = '#15803D'
  } else if (score >= 60) {
    label = 'Warm'; color = '#C6A76F'; bg = '#FEF9E7'; textColor = '#92400E'
  } else if (score >= 40) {
    label = 'Cool'; color = '#64748B'; bg = '#F1F5F9'; textColor = '#475569'
  } else {
    label = 'Cold'; color = '#94A3B8'; bg = '#F8FAFC'; textColor = '#94A3B8'
  }

  return { score, label, color, bg, textColor }
}
