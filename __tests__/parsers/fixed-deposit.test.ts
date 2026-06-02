import { parseFixedDeposit } from '@/lib/parsers/fixed-deposit'

const SAMPLE = `
Fixed Deposit
Maybank
Principal Amount
RM 1,000.00
Interest Rate
3.50% p.a.
Placement Date
01 Jan 2026
Maturity Date
01 Jan 2027
Interest Amount
RM 35.00
Total at Maturity
RM 1,035.00
`

const CALCULATED_SAMPLE = `
Fixed Deposit
CIMB
Principal: RM 5,000.00
Rate: 4.00% p.a.
From: 01 Jun 2026
To: 01 Dec 2026
`

describe('parseFixedDeposit', () => {
  it('returns null for unrelated text', () => {
    expect(parseFixedDeposit('hello world')).toBeNull()
  })

  it('extracts all FD fields from explicit text', () => {
    const result = parseFixedDeposit(SAMPLE)
    expect(result).not.toBeNull()
    expect(result!.institution).toBe('Maybank')
    expect(result!.principal).toBe(1000.00)
    expect(result!.interestRate).toBe(3.50)
    expect(result!.placementDate).toBe('2026-01-01')
    expect(result!.maturityDate).toBe('2027-01-01')
    expect(result!.interestAmount).toBe(35.00)
    expect(result!.totalAtMaturity).toBe(1035.00)
  })

  it('calculates interest when interest amount is not shown', () => {
    const result = parseFixedDeposit(CALCULATED_SAMPLE)
    expect(result!.principal).toBe(5000.00)
    expect(result!.interestRate).toBe(4.00)
    expect(result!.interestAmount).toBeGreaterThan(0)
    expect(result!.totalAtMaturity).toBe(result!.principal + result!.interestAmount)
  })
})
