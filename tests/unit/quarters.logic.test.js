import { describe, it, expect } from 'vitest'
import { pickLatestQuarter, nextQuarterLabel, nextQuarterDates } from '../../src/lib/quarters'

describe('pickLatestQuarter', () => {
  it('returns null for an empty list', () => {
    expect(pickLatestQuarter([])).toBeNull()
    expect(pickLatestQuarter()).toBeNull()
  })

  it('returns the quarter with the latest end_date', () => {
    const quarters = [
      { id: 'q1', end_date: '2026-03-31' },
      { id: 'q3', end_date: '2026-09-30' },
      { id: 'q2', end_date: '2026-06-30' },
    ]
    expect(pickLatestQuarter(quarters)).toEqual({ id: 'q3', end_date: '2026-09-30' })
  })

  it('ignores quarters with no end_date when a dated one exists', () => {
    const quarters = [
      { id: 'draft', end_date: null },
      { id: 'q1', end_date: '2026-03-31' },
    ]
    expect(pickLatestQuarter(quarters)).toEqual({ id: 'q1', end_date: '2026-03-31' })
  })
})

describe('nextQuarterLabel', () => {
  it('increments the quarter number within the same year', () => {
    expect(nextQuarterLabel('Q3 2026')).toBe('Q4 2026')
  })

  it('rolls over to Q1 of the next year after Q4', () => {
    expect(nextQuarterLabel('Q4 2026')).toBe('Q1 2027')
  })

  it('falls back to a generic label for an unparseable or missing name', () => {
    expect(nextQuarterLabel('Sprint 12')).toBe('New quarter')
    expect(nextQuarterLabel(undefined)).toBe('New quarter')
    expect(nextQuarterLabel(null)).toBe('New quarter')
  })
})

describe('nextQuarterDates', () => {
  it('starts the day after the prior quarter ends and spans ~3 months', () => {
    expect(nextQuarterDates('2026-09-30')).toEqual({
      start_date: '2026-10-01',
      end_date: '2026-12-31',
    })
  })

  it('handles a quarter boundary that crosses into a new year', () => {
    expect(nextQuarterDates('2026-12-31')).toEqual({
      start_date: '2027-01-01',
      end_date: '2027-03-31',
    })
  })

  it('starts today when there is no prior quarter', () => {
    const today = new Date('2026-05-15T00:00:00Z')
    expect(nextQuarterDates(null, today)).toEqual({
      start_date: '2026-05-15',
      end_date: '2026-08-14',
    })
  })
})
