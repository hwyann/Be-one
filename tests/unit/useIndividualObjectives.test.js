import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useIndividualObjectives from '../../src/hooks/useIndividualObjectives'

const fakeObjectives = [
  { id: 'io-1', title: 'Ship MVP' },
  { id: 'io-2', title: 'Interview 10 users' },
]

function makeSelectMock(result) {
  return { select: vi.fn().mockResolvedValue(result) }
}

describe('useIndividualObjectives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: true initially', () => {
    mocks.from.mockReturnValue({ select: vi.fn().mockReturnValue(new Promise(() => {})) })
    const { result } = renderHook(() => useIndividualObjectives())
    expect(result.current.loading).toBe(true)
    expect(result.current.objectives).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns individual objectives on success', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: fakeObjectives, error: null }))
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.objectives).toEqual(fakeObjectives)
    expect(result.current.error).toBeNull()
  })

  it('queries the individual_objectives table', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith('individual_objectives'))
  })

  it('returns error on fetch failure', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
    expect(result.current.objectives).toEqual([])
  })

  it('refetch reloads the objectives', async () => {
    const first = [{ id: 'io-1', title: 'A' }]
    const second = [
      { id: 'io-1', title: 'A' },
      { id: 'io-2', title: 'B' },
    ]
    let call = 0
    mocks.from.mockImplementation(() => {
      call += 1
      return makeSelectMock({ data: call === 1 ? first : second, error: null })
    })
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.objectives).toEqual(first))
    await act(async () => { await result.current.refetch() })
    expect(result.current.objectives).toEqual(second)
  })
})
