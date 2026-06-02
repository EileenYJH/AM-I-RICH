import { parseTNG } from '@/lib/parsers/tng'

const SAMPLE = `
Touch 'n Go eWallet
eWallet Balance
RM 312.50
Recent Transactions
02 Jun 2026
Tealive KLCC
-RM 8.50
02 Jun 2026
Toll PLUS Expressway
-RM 2.30
`

describe('parseTNG', () => {
  it('returns null for unrelated text', () => {
    expect(parseTNG('hello world')).toBeNull()
  })

  it('extracts balance', () => {
    const result = parseTNG(SAMPLE)
    expect(result!.balance).toBe(312.50)
    expect(result!.institution).toBe('Touch n Go')
    expect(result!.accountName).toBe('eWallet')
  })

  it('extracts transactions', () => {
    const result = parseTNG(SAMPLE)
    expect(result!.transactions).toHaveLength(2)
    expect(result!.transactions[1].merchant).toBe('Toll PLUS Expressway')
    expect(result!.transactions[1].amount).toBe(-2.30)
  })
})
