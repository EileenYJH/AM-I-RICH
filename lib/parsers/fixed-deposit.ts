import type { FDParseResult } from '@/lib/types'
import { parseDate } from './utils'

const BANK_NAMES = ['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong', 'AmBank', 'BSN', 'Bank Islam', 'Alliance']

/** Returns all FD placements found in the screenshot (may be multiple) */
export function parseFixedDeposit(text: string): FDParseResult[] | null {
  if (!/Fixed\s+Deposit|Maturity\s+Date/i.test(text)) return null

  const institution = detectBank(text)

  // HLB overview screen: multiple FD blocks separated by account reference numbers
  // Try multi-FD parsing first, fall back to single
  const multi = parseMultiple(text, institution)
  if (multi && multi.length > 0) return multi

  // Single FD fallback (e.g. individual FD detail screens)
  const single = parseSingle(text, institution)
  return single ? [single] : null
}

function parseSingle(text: string, institution: string): FDParseResult | null {
  const principal = extractLabeledMYR(text, 'Principal')
    ?? extractLabeledMYR(text, 'Placement')
    ?? extractFirstMYR(text)
  if (!principal) return null

  // Rate: handles "3.6000% p.a" and "3.6000% p.a." (trailing dot optional)
  const rateMatch = text.match(/([\d.]+)\s*%\s*p\.a\.?/i)
  const interestRate = rateMatch ? parseFloat(rateMatch[1]) : null
  if (!interestRate) return null

  const placementDate = extractLabeledDate(text, 'Placement Date')
    ?? extractLabeledDate(text, 'From')
    ?? extractLabeledDate(text, 'Start Date')
  const maturityDate = extractLabeledDate(text, 'Maturity Date')
    ?? extractLabeledDate(text, 'To')
    ?? extractLabeledDate(text, 'End Date')
  if (!placementDate || !maturityDate) return null

  // Deterministic reference so re-scanning same FD doesn't duplicate
  const reference = `${institution}-${placementDate}-${principal}-${interestRate}`
  return buildFD(institution, principal, interestRate, placementDate, maturityDate, text, reference)
}

function parseMultiple(text: string, institution: string): FDParseResult[] | null {
  // HLB-style: sections separated by account reference numbers (8+ digit strings on their own line)
  const lines = text.split('\n').map(l => l.trim())
  const results: FDParseResult[] = []

  // Find section boundaries — lines that are just numbers (account reference numbers)
  const sectionStarts: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (/^\d{8,}(\s+\d+)?$/.test(lines[i])) sectionStarts.push(i)
  }

  if (sectionStarts.length < 2) return null // Not a multi-FD overview screen

  for (let s = 0; s < sectionStarts.length; s++) {
    const start = sectionStarts[s]
    const end = sectionStarts[s + 1] ?? lines.length
    const block = lines.slice(start, end).join('\n')
    // The first line of the section is the account reference number
    const reference = lines[start].replace(/\s+/g, '-')

    const rateMatch = block.match(/([\d.]+)\s*%\s*p\.a\.?/i)
    if (!rateMatch) continue

    const interestRate = parseFloat(rateMatch[1])
    const principal = extractLabeledMYR(block, 'Placement')
      ?? extractLabeledMYR(block, 'Principal')
    if (!principal) continue

    const placementDate = extractLabeledDate(block, 'Placement Date')
      ?? extractLabeledDate(block, 'From')
    const maturityDate = extractLabeledDate(block, 'Maturity Date')
      ?? extractLabeledDate(block, 'To')
    if (!placementDate || !maturityDate) continue

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

/** Extracts amount after a label, supports RM and MYR, inline and next-line */
function extractLabeledMYR(text: string, label: string): number | null {
  const escaped = label.replace(/[()]/g, '\\$&')
  // Inline: "Placement (MYR): 5,000.00" or "Placement: MYR 5,000.00"
  const inlineColon = text.match(new RegExp(`${escaped}[^\\n]*:\\s*(?:MYR|RM)?\\s*([\\d,]+\\.\\d{2})`, 'i'))
  if (inlineColon) return parseFloat(inlineColon[1].replace(/,/g, ''))
  // Next line: "Placement (MYR)\n5,000.00"
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
  // HLB-specific screen name
  if (/e-Fixed\s+Deposit/i.test(text)) return 'Hong Leong Bank'
  for (const bank of BANK_NAMES) {
    if (new RegExp(bank, 'i').test(text)) return bank
  }
  return 'Bank'
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000)
}
