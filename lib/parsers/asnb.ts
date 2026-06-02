import type { ParseResult } from '@/lib/types'
import { firstRM } from './utils'

export function parseASNB(text: string): ParseResult | null {
  if (!/ASNB|Amanah\s+Saham/i.test(text)) return null

  const balanceMatch = text.match(/(?:Total\s+Investment|Portfolio\s+Value|Balance)\s*\n\s*RM\s*([\d,]+\.\d{2})/i)
  if (!balanceMatch) {
    const fallback = firstRM(text)
    if (!fallback) return null
    return { institution: 'ASNB', accountName: 'Unit Trust', balance: fallback, transactions: [] }
  }

  const balance = parseFloat(balanceMatch[1].replace(/,/g, ''))
  return { institution: 'ASNB', accountName: 'Unit Trust', balance, transactions: [] }
}
