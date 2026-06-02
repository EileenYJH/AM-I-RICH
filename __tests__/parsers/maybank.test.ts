import { parseMaybank } from '@/lib/parsers/maybank'
import { detectAndParse } from '@/lib/parsers/index'

const BALANCE_ONLY = `
MAE
Available Balance
RM 4,210.00
`

const WITH_TRANSACTIONS = `
MAE
Available Balance
RM 4,210.00
Recent Transactions
02 Jun 2026
Tealive
-RM 8.50
01 Jun 2026
GrabFood
-RM 25.00
01 Jun 2026
Salary
+RM 3,500.00
`

describe('parseMaybank', () => {
  it('returns null for unrelated text', () => {
    expect(parseMaybank('hello world')).toBeNull()
  })

  it('extracts balance from balance-only screenshot', () => {
    const result = parseMaybank(BALANCE_ONLY)
    expect(result).not.toBeNull()
    expect(result!.balance).toBe(4210.00)
    expect(result!.institution).toBe('Maybank')
    expect(result!.accountName).toBe('MAE')
  })

  it('extracts transactions when present', () => {
    const result = parseMaybank(WITH_TRANSACTIONS)
    expect(result!.transactions).toHaveLength(3)
    expect(result!.transactions[0].merchant).toBe('Tealive')
    expect(result!.transactions[0].amount).toBe(-8.50)
    expect(result!.transactions[0].date).toBe('2026-06-02')
    expect(result!.transactions[2].amount).toBe(3500.00)
  })

  it('detectAndParse routes MAE text to account result', () => {
    const out = detectAndParse(BALANCE_ONLY)
    expect(out.type).toBe('account')
    if (out.type === 'account') expect(out.result.institution).toBe('Maybank')
  })
})
