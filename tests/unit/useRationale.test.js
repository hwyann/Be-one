import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useRationale from '../../src/hooks/useRationale'

const fakeRationale = [
  { id: 'r1', question_key: 'outcome_check', answer: 'Clients stop waiting.', created_at: '2026-07-01T09:00:00Z' },
  { id: 'r2', question_key: 'alignment_check', answer: 'Yes, still worth it.', created_at: '2026-07-01T09:01:00Z' },
]

function makeSelectMock(result) {
  const orderMock = vi.fn().mockResolvedValue(result)
  const eqMock = vi.fn().mockReturnValue({ order: orderMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { select: selectMock, __select: selectMock, __eq: eqMock, __order: orderMock }
}

describe('useRationale', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes rationale, loading, error, saving, save, refetch', () => {
    mocks.from.mockReturnValue(makeSelectMock(new Promise(() => {})))
    const { result } = renderHook(() => useRationale('obj-1'))
    expect(result.current.rationale).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.saving).toBe(false)
    expect(typeof result.current.save).toBe('function')
    expect(typeof result.current.refetch).toBe('function')
  })

  it('does not fetch when targetId is null', () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useRationale(null))
    expect(mocks.from).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.rationale).toEqual([])
  })

  it('loads rationale rows for the given target, ordered by created_at ascending', async () => {
    const selectMock = makeSelectMock({ data: fakeRationale, error: null })
    mocks.from.mockReturnValue(selectMock)
    const { result } = renderHook(() => useRationale('obj-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mocks.from).toHaveBeenCalledWith('rationale')
    expect(selectMock.__eq).toHaveBeenCalledWith('target_id', 'obj-1')
    expect(selectMock.__order).toHaveBeenCalledWith('created_at', { ascending: true })
    expect(result.current.rationale).toEqual(fakeRationale)
  })

  it('returns an error when the fetch fails', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useRationale('obj-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
    expect(result.current.rationale).toEqual([])
  })

  it('saves one row per answered question, linked to the target', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    mocks.from.mockImplementation((table) => {
      if (table === 'rationale') return { ...makeSelectMock({ data: [], error: null }), insert: insertMock }
      return makeSelectMock({ data: [], error: null })
    })
    const { result } = renderHook(() => useRationale(null))
    let ok
    await act(async () => {
      ok = await result.current.save({
        targetId: 'obj-1',
        answers: { outcome_check: 'Clients stop waiting.', alignment_check: 'Yes.' },
      })
    })
    expect(ok).toBe(true)
    expect(insertMock).toHaveBeenCalledWith([
      { target_id: 'obj-1', question_key: 'outcome_check', answer: 'Clients stop waiting.' },
      { target_id: 'obj-1', question_key: 'alignment_check', answer: 'Yes.' },
    ])
  })

  it('skips writing rows for unanswered (blank) questions', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    mocks.from.mockImplementation(() => ({ ...makeSelectMock({ data: [], error: null }), insert: insertMock }))
    const { result } = renderHook(() => useRationale(null))
    let ok
    await act(async () => {
      ok = await result.current.save({
        targetId: 'obj-1',
        answers: { outcome_check: 'Clients stop waiting.', alignment_check: '   ' },
      })
    })
    expect(ok).toBe(true)
    expect(insertMock).toHaveBeenCalledWith([
      { target_id: 'obj-1', question_key: 'outcome_check', answer: 'Clients stop waiting.' },
    ])
  })

  it('does not call insert when there are no answered questions (skip)', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    mocks.from.mockImplementation(() => ({ ...makeSelectMock({ data: [], error: null }), insert: insertMock }))
    const { result } = renderHook(() => useRationale(null))
    let ok
    await act(async () => {
      ok = await result.current.save({ targetId: 'obj-1', answers: {} })
    })
    expect(ok).toBe(true)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('returns false and sets error when the insert fails', async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: { message: 'Insert boom' } })
    mocks.from.mockImplementation(() => ({ ...makeSelectMock({ data: [], error: null }), insert: insertMock }))
    const { result } = renderHook(() => useRationale(null))
    let ok
    await act(async () => {
      ok = await result.current.save({ targetId: 'obj-1', answers: { outcome_check: 'x' } })
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Insert boom')
  })

  it('refetch reloads the rationale rows', async () => {
    let call = 0
    mocks.from.mockImplementation(() => {
      call += 1
      return makeSelectMock({ data: call === 1 ? [fakeRationale[0]] : fakeRationale, error: null })
    })
    const { result } = renderHook(() => useRationale('obj-1'))
    await waitFor(() => expect(result.current.rationale).toEqual([fakeRationale[0]]))
    await act(async () => { await result.current.refetch() })
    expect(result.current.rationale).toEqual(fakeRationale)
  })
})
