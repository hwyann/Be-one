import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useCompanyObjectives from '../../src/hooks/useCompanyObjectives'

const fakeObjectives = [
  { id: '1', category: 'Growth', title: 'Expand into new markets', status: 'on_track' },
  { id: '2', category: 'Retention', title: 'Improve NPS score', status: 'at_risk' },
]

function makeQuartersMock(result) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  }
}

function makeObjectivesMock(result) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(result),
    }),
  }
}

describe('useCompanyObjectives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: true initially', () => {
    mocks.from.mockReturnValue(makeQuartersMock(new Promise(() => {})))
    const { result } = renderHook(() => useCompanyObjectives())
    expect(result.current.loading).toBe(true)
    expect(result.current.objectives).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns objectives for the active quarter', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      return makeObjectivesMock({ data: fakeObjectives, error: null })
    })
    const { result } = renderHook(() => useCompanyObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.objectives).toEqual(fakeObjectives)
    expect(result.current.error).toBeNull()
  })

  it('returns error when quarters fetch fails', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: null, error: { message: 'DB error' } }))
    const { result } = renderHook(() => useCompanyObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB error')
    expect(result.current.objectives).toEqual([])
  })

  it('returns error when objectives fetch fails', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      return makeObjectivesMock({ data: null, error: { message: 'Fetch failed' } })
    })
    const { result } = renderHook(() => useCompanyObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Fetch failed')
    expect(result.current.objectives).toEqual([])
  })
})
