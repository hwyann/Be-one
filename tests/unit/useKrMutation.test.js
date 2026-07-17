import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useKrMutation from '../../src/hooks/useKrMutation'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.from.mockReturnValue({
    insert: mocks.insert,
    update: mocks.update,
  })
  mocks.insert.mockResolvedValue({ error: null })
  mocks.eq.mockResolvedValue({ error: null })
  mocks.update.mockReturnValue({ eq: mocks.eq })
})

describe('useKrMutation', () => {
  it('exposes create, update, saving, error', () => {
    const { result } = renderHook(() => useKrMutation())
    expect(typeof result.current.create).toBe('function')
    expect(typeof result.current.update).toBe('function')
    expect(result.current.saving).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('inserts a KR with objectiveId only', async () => {
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.create({
        objectiveId: 'co-1',
        title: 'Reach 100 accounts',
        targetNote: '',
      })
    })
    expect(ok).toBe(true)
    expect(mocks.from).toHaveBeenCalledWith('key_results')
    expect(mocks.insert).toHaveBeenCalledWith({
      objective_id: 'co-1',
      individual_objective_id: null,
      title: 'Reach 100 accounts',
      target_note: null,
    })
  })

  it('inserts a KR with individualObjectiveId only', async () => {
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.create({
        individualObjectiveId: 'io-1',
        title: 'Draft the brief',
        targetNote: 'by Friday',
      })
    })
    expect(ok).toBe(true)
    expect(mocks.insert).toHaveBeenCalledWith({
      objective_id: null,
      individual_objective_id: 'io-1',
      title: 'Draft the brief',
      target_note: 'by Friday',
    })
  })

  it('rejects a create with both objectiveId and individualObjectiveId set', async () => {
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.create({
        objectiveId: 'co-1',
        individualObjectiveId: 'io-1',
        title: 'Reach 100 accounts',
      })
    })
    expect(ok).toBe(false)
    expect(mocks.insert).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/exactly one/i)
  })

  it('rejects a create with neither objectiveId nor individualObjectiveId set', async () => {
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.create({ title: 'Orphan KR' })
    })
    expect(ok).toBe(false)
    expect(mocks.insert).not.toHaveBeenCalled()
    expect(result.current.error).toMatch(/exactly one/i)
  })

  it('rejects a create with an empty title', async () => {
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.create({ objectiveId: 'co-1', title: '   ' })
    })
    expect(ok).toBe(false)
    expect(mocks.insert).not.toHaveBeenCalled()
  })

  it('returns false and sets error when the insert fails', async () => {
    mocks.insert.mockResolvedValueOnce({ error: { message: 'Insert boom' } })
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.create({ objectiveId: 'co-1', title: 'X' })
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Insert boom')
  })

  it('updates a KR by id with title and target note', async () => {
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.update({
        id: 'kr-1',
        title: 'Reach 150 accounts',
        targetNote: 'stretch: 200',
      })
    })
    expect(ok).toBe(true)
    expect(mocks.from).toHaveBeenCalledWith('key_results')
    expect(mocks.update).toHaveBeenCalledWith({
      title: 'Reach 150 accounts',
      target_note: 'stretch: 200',
    })
    expect(mocks.eq).toHaveBeenCalledWith('id', 'kr-1')
  })

  it('normalizes an empty target note to null on update', async () => {
    const { result } = renderHook(() => useKrMutation())
    await act(async () => {
      await result.current.update({ id: 'kr-1', title: 'Updated', targetNote: '' })
    })
    expect(mocks.update).toHaveBeenCalledWith({
      title: 'Updated',
      target_note: null,
    })
  })

  it('rejects an update with an empty title', async () => {
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.update({ id: 'kr-1', title: '   ' })
    })
    expect(ok).toBe(false)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('returns false and sets error when the update fails', async () => {
    mocks.eq.mockResolvedValueOnce({ error: { message: 'Update boom' } })
    const { result } = renderHook(() => useKrMutation())
    let ok
    await act(async () => {
      ok = await result.current.update({ id: 'kr-1', title: 'Y' })
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Update boom')
  })
})
