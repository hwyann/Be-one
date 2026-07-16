import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useCheckIns from '../../src/hooks/useCheckIns'

describe('useCheckIns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.from.mockReturnValue({ insert: mocks.insert })
    mocks.insert.mockResolvedValue({ error: null })
  })

  it('exposes save, saving, error', () => {
    const { result } = renderHook(() => useCheckIns())
    expect(typeof result.current.save).toBe('function')
    expect(result.current.saving).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('inserts a check_in row with individual_objective_id, status, note, and plan_next', async () => {
    const { result } = renderHook(() => useCheckIns())
    await act(async () => {
      await result.current.save({
        individualObjectiveId: 'io-1',
        status: 'on_track',
        note: 'shipped the first draft',
        planNext: 'wire up the review flow',
      })
    })
    expect(mocks.from).toHaveBeenCalledWith('check_ins')
    expect(mocks.insert).toHaveBeenCalledWith({
      individual_objective_id: 'io-1',
      status: 'on_track',
      note: 'shipped the first draft',
      plan_next: 'wire up the review flow',
    })
  })

  it('returns true on success', async () => {
    const { result } = renderHook(() => useCheckIns())
    let ok
    await act(async () => {
      ok = await result.current.save({ individualObjectiveId: 'io-1', status: 'at_risk', note: '', planNext: '' })
    })
    expect(ok).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('sets error and returns false when the insert fails', async () => {
    mocks.insert.mockResolvedValueOnce({ error: { message: 'Insert failed' } })
    const { result } = renderHook(() => useCheckIns())
    let ok
    await act(async () => {
      ok = await result.current.save({ individualObjectiveId: 'io-1', status: 'behind', note: 'blocked', planNext: '' })
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Insert failed')
  })
})
