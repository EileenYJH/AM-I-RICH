import type { ParseResult, ParsedTransaction } from '@/lib/types'
import { parseDate, parseAmount, firstRM } from './utils'

export function parseTNG(text: string): ParseResult | null {
  if (!/Touch|TNG|eWallet Balance|GOrewards|GOfinance|Fuel balance/i.test(text)) return null

  // Real TNG app shows balance as a standalone "RM X" line — just grab the first one
  const balance = firstRM(text)
  if (!balance) return null

  return { institution: 'Touch n Go', accountName: 'eWallet', balance, transactions: extractTransactions(text) }
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
