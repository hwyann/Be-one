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

import useCompanyObjectiveStatus from '../../src/hooks/useCompanyObjectiveStatus'

describe('useCompanyObjectiveStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.from.mockReturnValue({ update: mocks.update })
    mocks.update.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockResolvedValue({ error: null })
  })

  it('exposes update, saving, error', () => {
    const { result } = renderHook(() => useCompanyObjectiveStatus())
    expect(typeof result.current.update).toBe('function')
    expect(result.current.saving).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('updates company_objectives.status by id', async () => {
    const { result } = renderHook(() => useCompanyObjectiveStatus())
    await act(async () => {
      await result.current.update({ id: 'co-1', status: 'at_risk' })
    })
    expect(mocks.from).toHaveBeenCalledWith('company_objectives')
    expect(mocks.update).toHaveBeenCalledWith({ status: 'at_risk' })
    expect(mocks.eq).toHaveBeenCalledWith('id', 'co-1')
  })

  it('returns true on success', async () => {
    const { result } = renderHook(() => useCompanyObjectiveStatus())
    let ok
    await act(async () => {
      ok = await result.current.update({ id: 'co-1', status: 'on_track' })
    })
    expect(ok).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('sets error and returns false when the update fails', async () => {
    mocks.eq.mockResolvedValueOnce({ error: { message: 'Update failed' } })
    const { result } = renderHook(() => useCompanyObjectiveStatus())
    let ok
    await act(async () => {
      ok = await result.current.update({ id: 'co-1', status: 'behind' })
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Update failed')
  })
})
