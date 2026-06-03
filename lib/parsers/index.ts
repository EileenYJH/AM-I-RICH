import type { DetectorResult } from '@/lib/types'
import { parseMaybank } from './maybank'
import { parseCIMB } from './cimb'
import { parsePublicBank } from './publicbank'
import { parseTNG } from './tng'
import { parseGrabPay } from './grabpay'
import { parseBoost } from './boost'
import { parseASNB } from './asnb'
import { parseFixedDeposit } from './fixed-deposit'
import { parseAlliance } from './alliance'
import { parseHLB } from './hlb'
import { parseMBSB } from './mbsb'
import { parseKTMB } from './ktmb'

export function detectAndParse(text: string): DetectorResult {
  if (!text.trim()) return { type: 'unrecognised' }
  const up = text.toUpperCase()

  if (up.includes('MAE') || (up.includes('MAYBANK') && !up.includes('FIXED DEPOSIT'))) {
    const result = parseMaybank(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'Maybank' }
  }
  if (up.includes('CIMB') || up.includes('MYWEALTH') || up.includes('YOUTH SA')) {
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
  if (up.includes('ALLIANCE')) {
    const result = parseAlliance(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'Alliance Bank' }
  }
  if (up.includes('HONG LEONG') || up.includes('HLB')) {
    const result = parseHLB(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'Hong Leong Bank' }
  }
  if (up.includes('MBSB')) {
    const result = parseMBSB(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'MBSB Bank' }
  }
  if (up.includes('KTMB') || up.includes('KTM BERHAD') || up.includes('KTM WALLET')) {
    const result = parseKTMB(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'KTMB' }
  }
  if (up.includes('ASNB') || up.includes('AMANAH SAHAM')) {
    const result = parseASNB(text)
    return result ? { type: 'account', result } : { type: 'parse_failed', institution: 'ASNB' }
  }
  if (up.includes('FIXED DEPOSIT') || up.includes('E-FIXED DEPOSIT') || up.includes('MATURITY DATE') ||
      (up.includes('P.A') && (up.includes('PLACEMENT DATE') || up.includes('MATURITY')))) {
    const results = parseFixedDeposit(text)
    return results ? { type: 'fd', results } : { type: 'parse_failed', institution: 'Fixed Deposit' }
  }

  return { type: 'unrecognised' }
}
