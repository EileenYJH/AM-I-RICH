import type { FDParseResult } from '@/lib/types'
import { parseDate } from './utils'

const BANK_NAMES = ['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong', 'AmBank', 'BSN', 'Bank Islam', 'Alliance']

/** Returns all FD placements found in the screenshot (may be multiple) */
export function parseFixedDeposit(text: string): FDParseResult[] | null {
  if (!/Fixed\s+Deposit|Term\s+Deposit|Maturity\s+Date/i.test(text)) return null

  const institution = detectBank(text)

  // Try multi-FD parsing first (HLB overview / Alliance Acct.Cert listing)
  const multi = parseMultiple(text, institution)
  if (multi && multi.length > 0) return multi

  // Single FD fallback
  const single = parseSingle(text, institution)
  return single ? [single] : null
}

function parseSingle(text: string, institution: string): FDParseResult | null {
  const principal = extractLabeledMYR(text, 'Principal Balance')
    ?? extractLabeledMYR(text, 'Principal')
    ?? extractLabeledMYR(text, 'Placement')
    ?? extractFirstMYR(text)
  if (!principal) return null

  const interestRate = extractRate(text)
  if (!interestRate) return null

  let placementDate = extractLabeledDate(text, 'Placement Date')
    ?? extractLabeledDate(text, 'From')
    ?? extractLabeledDate(text, 'Start Date')

  const maturityDate = extractLabeledDate(text, 'Maturity Date')
    ?? extractLabeledDate(text, 'To')
    ?? extractLabeledDate(text, 'End Date')
  if (!maturityDate) return null

  // Calculate placement date from maturity - tenure if not shown
  if (!placementDate) {
    placementDate = calcPlacementDate(text, maturityDate)
  }
  if (!placementDate) return null

  const reference = `${institution}-${placementDate}-${principal}-${interestRate}`
  return buildFD(institution, principal, interestRate, placementDate, maturityDate, text, reference)
}

function parseMultiple(text: string, institution: string): FDParseResult[] | null {
  const lines = text.split('\n').map(l => l.trim())
  const results: FDParseResult[] = []
  const sectionStarts: number[] = []

  for (let i = 0; i < lines.length; i++) {
    // HLB: bare 8+ digit line
    if (/^\d{8,}(\s+\d+)?$/.test(lines[i])) {
      sectionStarts.push(i)
    }
    // Alliance: "Acct./Cert No." label followed by cert number on next line
    if (/Acct\.\/Cert\s+No\./i.test(lines[i]) && i + 1 < lines.length && /^\d{8,}/.test(lines[i + 1])) {
      sectionStarts.push(i)
    }
  }

  if (sectionStarts.length < 2) return null

  for (let s = 0; s < sectionStarts.length; s++) {
    const start = sectionStarts[s]
    const end = sectionStarts[s + 1] ?? lines.length
    const block = lines.slice(start, end).join('\n')

    // Reference: cert number (line after "Acct./Cert No." or bare digit line)
    const reference = /Acct\.\/Cert\s+No\./i.test(lines[start])
      ? lines[start + 1]
      : lines[start].replace(/\s+/g, '-')

    const interestRate = extractRate(block)
    if (!interestRate) continue

    const principal = extractLabeledMYR(block, 'Principal Balance')
      ?? extractLabeledMYR(block, 'Placement')
      ?? extractLabeledMYR(block, 'Principal')
      ?? extractFirstMYR(block)
    if (!principal) continue

    let placementDate = extractLabeledDate(block, 'Placement Date')
      ?? extractLabeledDate(block, 'From')
    const maturityDate = extractLabeledDate(block, 'Maturity Date')
      ?? extractLabeledDate(block, 'To')
    if (!maturityDate) continue

    if (!placementDate) placementDate = calcPlacementDate(block, maturityDate)
    if (!placementDate) continue

    results.push(buildFD(institution, principal, interestRate, placementDate, maturityDate, block, reference))
  }

  return results.length > 0 ? results : null
}

function buildFD(
  institution: string,
  principal: number,
  interestRate: number,
  placementDate: string,
  maturityDate: string,
  text: string,
  reference: string,
): FDParseResult {
  const days = daysBetween(placementDate, maturityDate)
  const parsedInterest = extractLabeledMYR(text, 'Interest Amount')
    ?? extractLabeledMYR(text, 'Profit Amount')
  const interestAmount = parsedInterest
    ?? parseFloat((principal * (interestRate / 100) * (days / 365)).toFixed(2))
  const totalAtMaturity = parseFloat((principal + interestAmount).toFixed(2))
  return { institution, principal, interestRate, placementDate, maturityDate, interestAmount, totalAtMaturity, reference }
}

/** Extracts interest/profit rate — handles "3.75% p.a", "3.75% p.a.", or just "3.75%" after a rate label */
function extractRate(text: string): number | null {
  // Explicit p.a format
  const pa = text.match(/([\d.]+)\s*%\s*p\.a\.?/i)
  if (pa) return parseFloat(pa[1])
  // "Profit Rate (pa)" or "Interest Rate" label with bare percentage on next line
  const labeled = text.match(/(?:Profit\s+Rate|Interest\s+Rate)[^\n]*\n\s*([\d.]+)\s*%/i)
  if (labeled) return parseFloat(labeled[1])
  return null
}

/** Calculate placement date by subtracting tenure months from maturity date */
function calcPlacementDate(text: string, maturityDate: string): string | null {
  const m = text.match(/(\d+)\s+Month/i)
  if (!m) return null
  const months = parseInt(m[1])
  const d = new Date(maturityDate)
  d.setMonth(d.getMonth() - months)
  return d.toISOString().split('T')[0]
}

/** Extracts amount after a label, supports RM and MYR, inline and next-line */
function extractLabeledMYR(text: string, label: string): number | null {
  const escaped = label.replace(/[()]/g, '\\$&')
  const inlineColon = text.match(new RegExp(`${escaped}[^\\n]*:\\s*(?:MYR|RM)?\\s*([\\d,]+\\.\\d{2})`, 'i'))
  if (inlineColon) return parseFloat(inlineColon[1].replace(/,/g, ''))
  const nextLine = text.match(new RegExp(`${escaped}[^\\n]*\\n\\s*(?:MYR|RM)?\\s*([\\d,]+\\.\\d{2})`, 'i'))
  return nextLine ? parseFloat(nextLine[1].replace(/,/g, '')) : null
}

/** First MYR or RM amount in text */
function extractFirstMYR(text: string): number | null {
  const m = text.match(/(?:MYR|RM)\s*([\d,]+\.\d{2})/)
  return m ? parseFloat(m[1].replace(/,/g, '')) : null
}

function extractLabeledDate(text: string, label: string): string | null {
  const escaped = label.replace(/[()]/g, '\\$&')
  const inline = text.match(new RegExp(`${escaped}\\s*:\\s*([^\\n]+)`, 'i'))
  if (inline) { const d = parseDate(inline[1].trim()); if (d) return d }
  const next = text.match(new RegExp(`${escaped}[^\\n]*\\n([^\\n]+)`, 'i'))
  return next ? parseDate(next[1].trim()) : null
}

function detectBank(text: string): string {
  if (/e-Fixed\s+Deposit/i.test(text)) return 'Hong Leong Bank'
  if (/Term\s+Deposit.*Alliance|Alliance.*Term\s+Deposit/i.test(text)) return 'Alliance Bank'
  for (const bank of BANK_NAMES) {
    if (new RegExp(bank, 'i').test(text)) return bank
  }
  return 'Bank'
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000)
}
