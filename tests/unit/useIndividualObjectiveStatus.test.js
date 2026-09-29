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

import useIndividualObjectiveStatus from '../../src/hooks/useIndividualObjectiveStatus'

describe('useIndividualObjectiveStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.from.mockReturnValue({ update: mocks.update })
    mocks.update.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockResolvedValue({ error: null })
  })

  it('exposes update, saving, error', () => {
    const { result } = renderHook(() => useIndividualObjectiveStatus())
    expect(typeof result.current.update).toBe('function')
    expect(result.current.saving).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('updates individual_objectives.progress_status by id (not the draft/confirmed `status` column, #B17)', async () => {
    const { result } = renderHook(() => useIndividualObjectiveStatus())
    await act(async () => {
      await result.current.update({ id: 'io-1', status: 'at_risk' })
    })
    expect(mocks.from).toHaveBeenCalledWith('individual_objectives')
    expect(mocks.update).toHaveBeenCalledWith({ progress_status: 'at_risk' })
    expect(mocks.eq).toHaveBeenCalledWith('id', 'io-1')
  })

  it('returns true on success', async () => {
    const { result } = renderHook(() => useIndividualObjectiveStatus())
    let ok
    await act(async () => {
      ok = await result.current.update({ id: 'io-1', status: 'on_track' })
    })
    expect(ok).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('sets error and returns false when the update fails', async () => {
    mocks.eq.mockResolvedValueOnce({ error: { message: 'Update failed' } })
    const { result } = renderHook(() => useIndividualObjectiveStatus())
    let ok
    await act(async () => {
      ok = await result.current.update({ id: 'io-1', status: 'behind' })
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Update failed')
  })
})
