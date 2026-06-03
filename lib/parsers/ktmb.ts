import type { ParseResult, ParsedTransaction } from '@/lib/types'
import { parseDate, parseAmount, firstRM } from './utils'

export function parseKTMB(text: string): ParseResult | null {
  if (!/KTMB|KTM\s+Wallet|KTM\s+Berhad/i.test(text)) return null

  // Real KTM app: "KTM Wallet Balance" label then "MYR X.XX" or just "MYR X.XX" after "KTM Wallet"
  const balanceMatch = text.match(/KTM\s+Wallet(?:\s+Balance)?\s*\n\s*(?:MYR|RM)\s*([\d,]+\.\d{2})/i)
    ?? text.match(/(?:Wallet\s+Balance)\s*\n?\s*(?:MYR|RM)\s*([\d,]+\.\d{2})/i)
  if (!balanceMatch) {
    const fallback = firstRM(text)
    if (!fallback) return null
    return { institution: 'KTMB', accountName: 'eWallet', balance: fallback, transactions: [] }
  }

  const balance = parseFloat(balanceMatch[1].replace(/,/g, ''))
  return { institution: 'KTMB', accountName: 'eWallet', balance, transactions: extractTransactions(text) }
}

function extractTransactions(text: string): ParsedTransaction[] {
  // KTM format: description, MYR amount, date on next lines
  // e.g. "Refund\nMYR 2.50\n28 May 2026"
  const results: ParsedTransaction[] = []
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  for (let i = 0; i < lines.length - 2; i++) {
    const merchant = lines[i]
    if (!/^(Refund|Usage|Reload|Top.?up|Purchase)/i.test(merchant)) continue
    const amountLine = lines[i + 1]
    const myrMatch = amountLine.match(/(?:MYR|RM)\s*([\d,]+\.\d{2})/)
    if (!myrMatch) continue
    const rawAmount = parseFloat(myrMatch[1].replace(/,/g, ''))
    const dateStr = parseDate(lines[i + 2])
    if (!dateStr) continue
    // Usage/Purchase = debit (negative), Refund/Reload = credit (positive)
    const isDebit = /^(Usage|Purchase)/i.test(merchant)
    results.push({ amount: isDebit ? -rawAmount : rawAmount, merchant, date: dateStr, type: isDebit ? 'debit' : 'credit' })
    i += 2
  }
  return results
}
