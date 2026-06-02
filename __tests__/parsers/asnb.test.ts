import { parseASNB } from '@/lib/parsers/asnb'

const SAMPLE = `
ASNB
myASNB
Total Investment
RM 10,200.00
ASB
Units Held: 10,000.000
`

describe('parseASNB', () => {
  it('returns null for unrelated text', () => {
    expect(parseASNB('hello world')).toBeNull()
  })

  it('extracts total investment as balance', () => {
    const result = parseASNB(SAMPLE)
    expect(result!.balance).toBe(10200.00)
    expect(result!.institution).toBe('ASNB')
    expect(result!.accountName).toBe('Unit Trust')
  })

  it('returns empty transactions array', () => {
    const result = parseASNB(SAMPLE)
    expect(result!.transactions).toEqual([])
  })
})
