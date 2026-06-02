import { parsePublicBank } from '@/lib/parsers/publicbank'

const SAMPLE = `
Public Bank Berhad
PBe
Available Balance
RM 2,100.00
Recent Transactions
31 May 2026
Secret Recipe
-RM 32.90
`

describe('parsePublicBank', () => {
  it('returns null for unrelated text', () => {
    expect(parsePublicBank('hello world')).toBeNull()
  })

  it('extracts balance', () => {
    const result = parsePublicBank(SAMPLE)
    expect(result!.balance).toBe(2100.00)
    expect(result!.institution).toBe('Public Bank')
    expect(result!.accountName).toBe('Savings')
  })

  it('extracts transactions', () => {
    const result = parsePublicBank(SAMPLE)
    expect(result!.transactions[0].merchant).toBe('Secret Recipe')
    expect(result!.transactions[0].amount).toBe(-32.90)
    expect(result!.transactions[0].date).toBe('2026-05-31')
  })
})
