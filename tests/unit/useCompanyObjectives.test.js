import { renderHook, waitFor, act } from '@testing-library/react'
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

  it('refetch reloads the objectives', async () => {
    const first = [{ id: '1', category: 'Growth', title: 'A', status: 'on_track' }]
    const second = [
      { id: '1', category: 'Growth', title: 'A', status: 'on_track' },
      { id: '2', category: 'Retention', title: 'B', status: 'at_risk' },
    ]
    let call = 0
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      call += 1
      return makeObjectivesMock({ data: call === 1 ? first : second, error: null })
    })
    const { result } = renderHook(() => useCompanyObjectives())
    await waitFor(() => expect(result.current.objectives).toEqual(first))
    await act(async () => { await result.current.refetch() })
    expect(result.current.objectives).toEqual(second)
  })
})
