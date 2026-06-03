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

const HLB_SAMPLE = `
e-Fixed Deposit-i
32022009166 0
EQUIVALENT BALANCE (MYR)
25,000.00
32023005266
Withdraw
Tenure
10 Months
Profit Rate (%)
3.6000% p.a
Placement Date
21 Oct 2025
Maturity Date
21 Aug 2026
Placement (MYR)
5,000.00
32023005445
Withdraw
Tenure
8 Months
Profit Rate (%)
3.7000% p.a
Placement Date
07 Jan 2026
Maturity Date
07 Sep 2026
Placement (MYR)
5,000.00
`

describe('parseFixedDeposit', () => {
  it('returns null for unrelated text', () => {
    expect(parseFixedDeposit('hello world')).toBeNull()
  })

  it('extracts single FD as array of 1', () => {
    const results = parseFixedDeposit(SAMPLE)
    expect(results).not.toBeNull()
    expect(results!).toHaveLength(1)
    expect(results![0].institution).toBe('Maybank')
    expect(results![0].principal).toBe(1000.00)
    expect(results![0].interestRate).toBe(3.50)
    expect(results![0].placementDate).toBe('2026-01-01')
    expect(results![0].maturityDate).toBe('2027-01-01')
    expect(results![0].interestAmount).toBe(35.00)
    expect(results![0].totalAtMaturity).toBe(1035.00)
    expect(results![0].reference).toBe('Maybank-2026-01-01-1000-3.5')
  })

  it('same FD screenshot twice produces same reference (no duplicate)', () => {
    const r1 = parseFixedDeposit(SAMPLE)
    const r2 = parseFixedDeposit(SAMPLE)
    expect(r1![0].reference).toBe(r2![0].reference)
  })

  it('calculates interest when not shown', () => {
    const results = parseFixedDeposit(CALCULATED_SAMPLE)
    expect(results![0].principal).toBe(5000.00)
    expect(results![0].interestRate).toBe(4.00)
    expect(results![0].interestAmount).toBeGreaterThan(0)
    expect(results![0].totalAtMaturity).toBe(results![0].principal + results![0].interestAmount)
  })

  it('parses multiple HLB FDs from one screen with distinct references', () => {
    const results = parseFixedDeposit(HLB_SAMPLE)
    expect(results).not.toBeNull()
    expect(results!.length).toBeGreaterThanOrEqual(2)
    expect(results![0].institution).toBe('Hong Leong Bank')
    expect(results![0].principal).toBe(5000.00)
    expect(results![0].interestRate).toBe(3.6)
    expect(results![0].placementDate).toBe('2025-10-21')
    expect(results![0].maturityDate).toBe('2026-08-21')
    expect(results![0].reference).toBe('32023005266')
    expect(results![1].principal).toBe(5000.00)
    expect(results![1].interestRate).toBe(3.7)
    expect(results![1].reference).toBe('32023005445')
    // Different references — screenshot same screen twice won't duplicate
    expect(results![0].reference).not.toBe(results![1].reference)
  })
})
