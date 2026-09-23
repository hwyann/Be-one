import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useActiveQuarter from '../../src/hooks/useActiveQuarter'

function makeQuartersMock(result) {
  return {
    select: vi.fn().mockReturnValue(Promise.resolve(result)),
  }
}

const quarters = [
  { id: 'q1', label: 'Q1 2026', is_active: false },
  { id: 'q2', label: 'Q2 2026', is_active: true },
]

describe('useActiveQuarter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null quarterId and no quarters while loading', () => {
    mocks.from.mockReturnValue(makeQuartersMock(new Promise(() => {})))
    const { result } = renderHook(() => useActiveQuarter())
    expect(result.current.quarterId).toBeNull()
    expect(result.current.quarters).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('defaults the selected quarter to the active quarter once loaded', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: quarters, error: null }))
    const { result } = renderHook(() => useActiveQuarter())
    await waitFor(() => expect(result.current.quarterId).toBe('q2'))
    expect(result.current.error).toBeNull()
  })

  it('returns the full list of quarters for the selector', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: quarters, error: null }))
    const { result } = renderHook(() => useActiveQuarter())
    await waitFor(() => expect(result.current.quarters).toEqual(quarters))
  })

  it('queries the quarters table', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: quarters, error: null }))
    renderHook(() => useActiveQuarter())
    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith('quarters'))
  })

  it('returns error on fetch failure', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useActiveQuarter())
    await waitFor(() => expect(result.current.error).toBe('DB down'))
    expect(result.current.quarterId).toBeNull()
  })

  it('selectQuarter updates quarterId to the chosen quarter', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: quarters, error: null }))
    const { result } = renderHook(() => useActiveQuarter())
    await waitFor(() => expect(result.current.quarterId).toBe('q2'))
    act(() => { result.current.selectQuarter('q1') })
    expect(result.current.quarterId).toBe('q1')
  })
})
