import type { ParseResult, ParsedTransaction } from '@/lib/types'
import { parseDate, parseAmount, firstRM } from './utils'

export function parseCIMB(text: string): ParseResult | null {
  if (!/CIMB/i.test(text)) return null

  const balanceMatch = text.match(/(?:Current\s+Balance|Account\s+Balance|Balance)\s*\n\s*RM\s*([\d,]+\.\d{2})/i)
  if (!balanceMatch) {
    const fallback = firstRM(text)
    if (!fallback) return null
    return { institution: 'CIMB', accountName: 'Savings', balance: fallback, transactions: [] }
  }

  const balance = parseFloat(balanceMatch[1].replace(/,/g, ''))
  return { institution: 'CIMB', accountName: 'Savings', balance, transactions: extractTransactions(text) }
}

function extractTransactions(text: string): ParsedTransaction[] {
  const results: ParsedTransaction[] = []
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  for (let i = 0; i < lines.length - 2; i++) {
    const dateStr = parseDate(lines[i])
    if (!dateStr) continue
    const merchant = lines[i + 1]
    const amount = parseAmount(lines[i + 2])
    if (!merchant || amount === null) continue
    if (/Balance/i.test(merchant)) continue
    results.push({ amount, merchant, date: dateStr, type: amount < 0 ? 'debit' : 'credit' })
    i += 2
  }
  return results
}
