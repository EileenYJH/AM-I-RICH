import type { FDParseResult } from '@/lib/types'
import { parseDate, firstRM } from './utils'

const BANK_NAMES = ['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong', 'AmBank', 'BSN', 'Bank Islam']

export function parseFixedDeposit(text: string): FDParseResult | null {
  if (!/Fixed\s+Deposit|Maturity\s+Date/i.test(text)) return null

  const principal = extractLabeledRM(text, 'Principal') ?? firstRM(text)
  if (!principal) return null

  const rateMatch = text.match(/([\d.]+)\s*%\s*p\.a\./i)
  const interestRate = rateMatch ? parseFloat(rateMatch[1]) : null
  if (!interestRate) return null

  const placementDate =
    extractLabeledDate(text, 'Placement Date') ??
    extractLabeledDate(text, 'From') ??
    extractLabeledDate(text, 'Start Date')
  const maturityDate =
    extractLabeledDate(text, 'Maturity Date') ??
    extractLabeledDate(text, 'To') ??
    extractLabeledDate(text, 'End Date')
  if (!placementDate || !maturityDate) return null

  const institution = detectBank(text)
  const parsedInterest = extractLabeledRM(text, 'Interest Amount') ?? extractLabeledRM(text, 'Interest')
  const days = daysBetween(placementDate, maturityDate)
  const interestAmount = parsedInterest ?? parseFloat((principal * (interestRate / 100) * (days / 365)).toFixed(2))
  const totalAtMaturity = parseFloat((principal + interestAmount).toFixed(2))

  return { institution, principal, interestRate, placementDate, maturityDate, interestAmount, totalAtMaturity }
}

function extractLabeledRM(text: string, label: string): number | null {
  // Try inline format first (e.g. "Principal: RM 5,000.00"), then multiline
  const inlineM = text.match(new RegExp(`${label}\\s*:\\s*RM\\s*([\\d,]+\\.\\d{2})`, 'i'))
  if (inlineM) return parseFloat(inlineM[1].replace(/,/g, ''))
  const multilineM = text.match(new RegExp(`${label}[^\\n]*\\n\\s*RM\\s*([\\d,]+\\.\\d{2})`, 'i'))
  return multilineM ? parseFloat(multilineM[1].replace(/,/g, '')) : null
}

function extractLabeledDate(text: string, label: string): string | null {
  // Try inline format first (e.g. "From: 01 Jun 2026"), then multiline
  const inlineM = text.match(new RegExp(`${label}\\s*:\\s*([^\\n]+)`, 'i'))
  if (inlineM) {
    const d = parseDate(inlineM[1].trim())
    if (d) return d
  }
  const multilineM = text.match(new RegExp(`${label}[^\\n]*\\n([^\\n]+)`, 'i'))
  return multilineM ? parseDate(multilineM[1].trim()) : null
}

function detectBank(text: string): string {
  for (const bank of BANK_NAMES) {
    if (new RegExp(bank, 'i').test(text)) return bank
  }
  return 'Bank'
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000)
}
