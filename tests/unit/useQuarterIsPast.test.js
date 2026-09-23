import { describe, it, expect } from 'vitest'
import useQuarterIsPast from '../../src/hooks/useQuarterIsPast'

const quarters = [
  { id: 'q1', label: 'Q1 2026', is_active: false },
  { id: 'q2', label: 'Q2 2026', is_active: true },
]

describe('useQuarterIsPast', () => {
  it('returns true when the selected quarter is not the active quarter', () => {
    expect(useQuarterIsPast(quarters, 'q1')).toBe(true)
  })

  it('returns false when the selected quarter is the active quarter', () => {
    expect(useQuarterIsPast(quarters, 'q2')).toBe(false)
  })

  it('returns false when the selected quarter cannot be found yet (loading)', () => {
    expect(useQuarterIsPast([], null)).toBe(false)
  })

  it('returns false when quarters is undefined', () => {
    expect(useQuarterIsPast(undefined, 'q1')).toBe(false)
  })
})
