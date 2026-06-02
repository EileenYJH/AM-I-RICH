import { detectAndParse } from '@/lib/parsers/index'

describe('detectAndParse — basic routing', () => {
  it('returns unrecognised for empty string', () => {
    expect(detectAndParse('')).toEqual({ type: 'unrecognised' })
  })

  it('returns unrecognised for irrelevant text', () => {
    expect(detectAndParse('hello world 123')).toEqual({ type: 'unrecognised' })
  })

  it('returns parse_failed (not unrecognised) when institution detected but balance missing', () => {
    const result = detectAndParse('CIMB bank page no balance here')
    expect(result.type).toBe('parse_failed')
  })
})
