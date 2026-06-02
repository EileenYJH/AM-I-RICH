import { parseGrabPay } from '@/lib/parsers/grabpay'

const SAMPLE = `
GrabPay
Grab Wallet
Wallet Balance
RM 88.00
Transactions
02 Jun 2026
GrabCar
-RM 14.20
`

describe('parseGrabPay', () => {
  it('returns null for unrelated text', () => {
    expect(parseGrabPay('hello world')).toBeNull()
  })

  it('extracts balance', () => {
    const result = parseGrabPay(SAMPLE)
    expect(result!.balance).toBe(88.00)
    expect(result!.institution).toBe('GrabPay')
    expect(result!.accountName).toBe('eWallet')
  })

  it('extracts transactions', () => {
    const result = parseGrabPay(SAMPLE)
    expect(result!.transactions[0].merchant).toBe('GrabCar')
    expect(result!.transactions[0].amount).toBe(-14.20)
  })
})
