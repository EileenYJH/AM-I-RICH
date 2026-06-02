import type { DetectorResult } from '@/lib/types'
import { parseMaybank } from './maybank'
import { parseCIMB } from './cimb'
import { parsePublicBank } from './publicbank'
import { parseTNG } from './tng'
import { parseGrabPay } from './grabpay'
import { parseBoost } from './boost'
import { parseASNB } from './asnb'
import { parseFixedDeposit } from './fixed-deposit'

export function detectAndParse(text: string): DetectorResult {
  if (!text.trim()) return { type: 'unrecognised' }
  const up = text.toUpperCase()

  if (up.includes('MAE') || (up.includes('MAYBANK') && !up.includes('FIXED DEPOSIT'))) {
    const result = parseMaybank(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'Maybank' }
  }
  if (up.includes('CIMB')) {
    const result = parseCIMB(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'CIMB' }
  }
  if (up.includes('PUBLIC BANK') || up.includes('PBE')) {
    const result = parsePublicBank(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'Public Bank' }
  }
  if (up.includes("TOUCH 'N GO") || up.includes('TNG') || up.includes('EWALLET BALANCE') ||
      up.includes('GOREWARDS') || up.includes('GOFINANCE') || up.includes('FUEL BALANCE') ||
      (up.includes('ADD MONEY') && up.includes('TRANSACTIONS'))) {
    const result = parseTNG(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'Touch n Go' }
  }
  if (up.includes('GRABPAY') || up.includes('GRAB WALLET')) {
    const result = parseGrabPay(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'GrabPay' }
  }
  if (up.includes('BOOST')) {
    const result = parseBoost(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'Boost' }
  }
  if (up.includes('ASNB') || up.includes('AMANAH SAHAM')) {
    const result = parseASNB(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'ASNB' }
  }
  if (up.includes('FIXED DEPOSIT') || up.includes('MATURITY DATE') || (up.includes('P.A.') && up.includes('FD'))) {
    const result = parseFixedDeposit(text)
    return result ? { type: 'fd', result } : { type: 'parse_failed', institution: 'Fixed Deposit' }
  }

  return { type: 'unrecognised' }
}
