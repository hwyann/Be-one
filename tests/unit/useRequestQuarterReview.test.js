import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useRequestQuarterReview from '../../src/hooks/useRequestQuarterReview'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.from.mockReturnValue({ update: mocks.update })
  mocks.update.mockReturnValue({ eq: mocks.eq })
  mocks.eq.mockResolvedValue({ error: null })
})

describe('useRequestQuarterReview', () => {
  it('updates quarters.review_requested_at for the given quarter id', async () => {
    const { result } = renderHook(() => useRequestQuarterReview())
    let ok
    await act(async () => { ok = await result.current.requestReview('q1') })
    expect(ok).toBe(true)
    expect(mocks.from).toHaveBeenCalledWith('quarters')
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ review_requested_at: expect.any(String) })
    )
    expect(mocks.eq).toHaveBeenCalledWith('id', 'q1')
  })

  it('does nothing and returns false when quarterId is null', async () => {
    const { result } = renderHook(() => useRequestQuarterReview())
    let ok
    await act(async () => { ok = await result.current.requestReview(null) })
    expect(ok).toBe(false)
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('sets error and returns false on failure', async () => {
    mocks.eq.mockResolvedValue({ error: { message: 'DB down' } })
    const { result } = renderHook(() => useRequestQuarterReview())
    let ok
    await act(async () => { ok = await result.current.requestReview('q1') })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('DB down')
  })

  it('tracks requesting state while the update is in flight', async () => {
    let resolveUpdate
    mocks.eq.mockReturnValue(new Promise(resolve => { resolveUpdate = resolve }))
    const { result } = renderHook(() => useRequestQuarterReview())
    let promise
    act(() => { promise = result.current.requestReview('q1') })
    expect(result.current.requesting).toBe(true)
    await act(async () => { resolveUpdate({ error: null }); await promise })
    expect(result.current.requesting).toBe(false)
  })
})
