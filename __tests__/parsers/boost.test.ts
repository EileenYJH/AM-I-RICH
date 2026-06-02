import { parseBoost } from '@/lib/parsers/boost'

const SAMPLE = `
Boost
My Balance
RM 45.00
Recent Activity
02 Jun 2026
TNB Electric Bill
-RM 110.00
`

describe('parseBoost', () => {
  it('returns null for unrelated text', () => {
    expect(parseBoost('hello world')).toBeNull()
  })

  it('extracts balance', () => {
    const result = parseBoost(SAMPLE)
    expect(result!.balance).toBe(45.00)
    expect(result!.institution).toBe('Boost')
    expect(result!.accountName).toBe('eWallet')
  })

  it('extracts transactions', () => {
    const result = parseBoost(SAMPLE)
    expect(result!.transactions[0].merchant).toBe('TNB Electric Bill')
    expect(result!.transactions[0].amount).toBe(-110.00)
  })
})
