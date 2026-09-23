import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useCheckInQuestions from '../../src/hooks/useCheckInQuestions'

const fakeQuestions = [
  { id: 'q1', check_in_id: 'c1', question_text: 'What blocked this?', reply_text: null, created_at: '2026-07-01T09:00:00Z', replied_at: null },
  { id: 'q2', check_in_id: 'c2', question_text: 'Who else is involved?', reply_text: 'Just me for now.', created_at: '2026-07-02T09:00:00Z', replied_at: '2026-07-03T09:00:00Z' },
]

function makeSelectMock(result) {
  const inMock = vi.fn().mockResolvedValue(result)
  const selectMock = vi.fn().mockReturnValue({ in: inMock })
  return { select: selectMock, __select: selectMock, __in: inMock }
}

function makeInsertMock(result) {
  const singleMock = vi.fn().mockResolvedValue(result)
  const selectMock = vi.fn().mockReturnValue({ single: singleMock })
  const insertMock = vi.fn().mockReturnValue({ select: selectMock })
  return { insert: insertMock, __insert: insertMock, __select: selectMock, __single: singleMock }
}

function makeUpdateMock(result) {
  const singleMock = vi.fn().mockResolvedValue(result)
  const selectMock = vi.fn().mockReturnValue({ single: singleMock })
  const eqMock = vi.fn().mockReturnValue({ select: selectMock })
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { update: updateMock, __update: updateMock, __eq: eqMock, __select: selectMock, __single: singleMock }
}

describe('useCheckInQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: true initially when check-in ids are provided', () => {
    mocks.from.mockReturnValue(makeSelectMock(new Promise(() => {})))
    const { result } = renderHook(() => useCheckInQuestions(['c1', 'c2']))
    expect(result.current.loading).toBe(true)
    expect(result.current.questionsByCheckInId).toEqual({})
    expect(result.current.error).toBeNull()
  })

  it('does not fetch when checkInIds is empty', () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useCheckInQuestions([]))
    expect(mocks.from).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.questionsByCheckInId).toEqual({})
  })

  it('batch-fetches questions for the given check-in ids, keyed by check_in_id', async () => {
    const selectMock = makeSelectMock({ data: fakeQuestions, error: null })
    mocks.from.mockReturnValue(selectMock)
    const { result } = renderHook(() => useCheckInQuestions(['c1', 'c2']))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mocks.from).toHaveBeenCalledWith('check_in_questions')
    expect(selectMock.__in).toHaveBeenCalledWith('check_in_id', ['c1', 'c2'])
    expect(result.current.questionsByCheckInId).toEqual({
      c1: fakeQuestions[0],
      c2: fakeQuestions[1],
    })
  })

  it('returns an error when the fetch fails', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useCheckInQuestions(['c1']))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
    expect(result.current.questionsByCheckInId).toEqual({})
  })

  it('askQuestion inserts a question row scoped to one check-in and stores it in state', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useCheckInQuestions([]))
    const insertMock = makeInsertMock({ data: fakeQuestions[0], error: null })
    mocks.from.mockReturnValue(insertMock)

    let ok
    await act(async () => {
      ok = await result.current.askQuestion('c1', 'What blocked this?')
    })

    expect(ok).toBe(true)
    expect(mocks.from).toHaveBeenCalledWith('check_in_questions')
    expect(insertMock.__insert).toHaveBeenCalledWith({ check_in_id: 'c1', question_text: 'What blocked this?' })
    expect(result.current.questionsByCheckInId.c1).toEqual(fakeQuestions[0])
  })

  it('askQuestion returns false and sets error when the insert fails', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useCheckInQuestions([]))
    mocks.from.mockReturnValue(makeInsertMock({ data: null, error: { message: 'Insert boom' } }))

    let ok
    await act(async () => {
      ok = await result.current.askQuestion('c1', 'What blocked this?')
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('Insert boom')
  })

  it('askQuestion surfaces a friendly "already asked" message on a 23505 uniqueness violation', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useCheckInQuestions([]))
    mocks.from.mockReturnValue(makeInsertMock({ data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint "check_in_questions_check_in_id_key"' } }))

    let ok
    await act(async () => {
      ok = await result.current.askQuestion('c1', 'What blocked this?')
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('A question has already been asked on this check-in.')
  })

  it('replyToQuestion updates reply_text and replied_at, and merges into state', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useCheckInQuestions([]))
    const replied = { ...fakeQuestions[0], reply_text: 'Waiting on design.', replied_at: '2026-07-04T09:00:00Z' }
    const updateMock = makeUpdateMock({ data: replied, error: null })
    mocks.from.mockReturnValue(updateMock)

    let ok
    await act(async () => {
      ok = await result.current.replyToQuestion('q1', 'Waiting on design.')
    })

    expect(ok).toBe(true)
    expect(updateMock.__update).toHaveBeenCalledWith(expect.objectContaining({ reply_text: 'Waiting on design.' }))
    expect(updateMock.__eq).toHaveBeenCalledWith('id', 'q1')
    expect(result.current.questionsByCheckInId.c1).toEqual(replied)
  })

  it('replyToQuestion returns false and sets error when the update fails', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useCheckInQuestions([]))
    mocks.from.mockReturnValue(makeUpdateMock({ data: null, error: { message: 'Update boom' } }))

    let ok
    await act(async () => {
      ok = await result.current.replyToQuestion('q1', 'Waiting on design.')
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('Update boom')
  })

  it('refetch reloads the questions', async () => {
    let call = 0
    mocks.from.mockImplementation(() => {
      call += 1
      return makeSelectMock({ data: call === 1 ? [fakeQuestions[0]] : fakeQuestions, error: null })
    })
    const { result } = renderHook(() => useCheckInQuestions(['c1', 'c2']))
    await waitFor(() => expect(result.current.questionsByCheckInId).toEqual({ c1: fakeQuestions[0] }))
    await act(async () => { await result.current.refetch() })
    expect(result.current.questionsByCheckInId).toEqual({ c1: fakeQuestions[0], c2: fakeQuestions[1] })
  })
})
