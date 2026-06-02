import { parseCIMB } from '@/lib/parsers/cimb'

const SAMPLE = `
CIMB Clicks
Hi, Eileen
Current Balance
RM 6,500.00
Recent Transactions
02 Jun 2026
Aeon Big
-RM 67.80
01 Jun 2026
Salary Credit
+RM 3,500.00
`

describe('parseCIMB', () => {
  it('returns null for unrelated text', () => {
    expect(parseCIMB('hello world')).toBeNull()
  })

  it('extracts balance', () => {
    const result = parseCIMB(SAMPLE)
    expect(result!.balance).toBe(6500.00)
    expect(result!.institution).toBe('CIMB')
    expect(result!.accountName).toBe('Savings')
  })

  it('extracts transactions', () => {
    const result = parseCIMB(SAMPLE)
    expect(result!.transactions).toHaveLength(2)
    expect(result!.transactions[0].merchant).toBe('Aeon Big')
    expect(result!.transactions[0].amount).toBe(-67.80)
  })
})
