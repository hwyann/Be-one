import { renderHook, waitFor } from '@testing-library/react'
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
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  }
}

describe('useActiveQuarter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null while loading', () => {
    mocks.from.mockReturnValue(makeQuartersMock(new Promise(() => {})))
    const { result } = renderHook(() => useActiveQuarter())
    expect(result.current.quarterId).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns the active quarter id on success', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: { id: 'q1' }, error: null }))
    const { result } = renderHook(() => useActiveQuarter())
    await waitFor(() => expect(result.current.quarterId).toBe('q1'))
    expect(result.current.error).toBeNull()
  })

  it('queries the quarters table filtered by is_active', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: { id: 'q1' }, error: null }))
    renderHook(() => useActiveQuarter())
    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith('quarters'))
  })

  it('returns error on fetch failure', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useActiveQuarter())
    await waitFor(() => expect(result.current.error).toBe('DB down'))
    expect(result.current.quarterId).toBeNull()
  })
})
