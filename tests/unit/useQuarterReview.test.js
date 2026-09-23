import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useQuarterReview from '../../src/hooks/useQuarterReview'

function makeSelectMock(result) {
  const limitMock = vi.fn().mockResolvedValue(result)
  const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
  const eqMock = vi.fn().mockReturnValue({ order: orderMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { select: selectMock, __select: selectMock, __eq: eqMock, __order: orderMock, __limit: limitMock }
}

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

describe('useQuarterReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes review, loading, error, saving, save, refetch', () => {
    mocks.from.mockReturnValue(makeSelectMock(new Promise(() => {})))
    const { result } = renderHook(() => useQuarterReview('io-1'))
    expect(result.current.review).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.saving).toBe(false)
    expect(typeof result.current.save).toBe('function')
    expect(typeof result.current.refetch).toBe('function')
  })

  it('does not fetch when objectiveId is null', () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useQuarterReview(null))
    expect(mocks.from).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.review).toBeNull()
  })

  it('loads the most recent quarter_reviews row for the objective', async () => {
    const row = {
      id: 'qr-1',
      objective_id: 'io-1',
      final_status: 'on_track',
      member_reflection: 'Good quarter',
      member_confirmed_at: null,
      manager_comment: null,
      manager_confirmed_at: null,
      finalized_at: null,
      created_at: '2026-09-01T00:00:00Z',
    }
    const selectMock = makeSelectMock({ data: [row], error: null })
    mocks.from.mockReturnValue(selectMock)
    const { result } = renderHook(() => useQuarterReview('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mocks.from).toHaveBeenCalledWith('quarter_reviews')
    expect(selectMock.__eq).toHaveBeenCalledWith('objective_id', 'io-1')
    expect(selectMock.__order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(selectMock.__limit).toHaveBeenCalledWith(1)
    expect(result.current.review).toEqual(row)
  })

  it('sets review to null when no row exists yet', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const { result } = renderHook(() => useQuarterReview('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.review).toBeNull()
  })

  it('returns an error when the fetch fails', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useQuarterReview('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
    expect(result.current.review).toBeNull()
  })

  it('inserts a new draft row when only the member confirms, and does not finalize', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const insertMock = vi.fn().mockResolvedValue({ error: null })
    mocks.from.mockImplementation((table) => {
      if (table === 'quarter_reviews') return { ...makeSelectMock({ data: [], error: null }), insert: insertMock }
      return makeSelectMock({ data: [], error: null })
    })
    const { result } = renderHook(() => useQuarterReview('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.save({
        finalStatus: 'on_track',
        memberReflection: 'Good quarter',
        memberConfirmed: true,
        managerComment: '',
        managerConfirmed: false,
      })
    })

    expect(ok).toBe(true)
    expect(insertMock).toHaveBeenCalledTimes(1)
    const payload = insertMock.mock.calls[0][0]
    expect(payload).toMatchObject({
      objective_id: 'io-1',
      final_status: 'on_track',
      member_reflection: 'Good quarter',
      manager_comment: '',
      manager_confirmed_at: null,
      finalized_at: null,
    })
    expect(payload.member_confirmed_at).toMatch(ISO_TIMESTAMP)
  })

  it('finalizes with a timestamp once the second confirmation is saved', async () => {
    const existingRow = {
      id: 'qr-1',
      objective_id: 'io-1',
      final_status: 'on_track',
      member_reflection: 'Good quarter',
      member_confirmed_at: '2026-09-20T00:00:00Z',
      manager_comment: null,
      manager_confirmed_at: null,
      finalized_at: null,
      created_at: '2026-09-01T00:00:00Z',
    }
    const updateEqMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock })
    let selectCall = 0
    mocks.from.mockImplementation((table) => {
      if (table !== 'quarter_reviews') return makeSelectMock({ data: [], error: null })
      selectCall += 1
      const data = selectCall === 1 ? [existingRow] : [{ ...existingRow, manager_confirmed_at: '2026-09-23T10:00:00.000Z', finalized_at: '2026-09-23T10:00:00.000Z' }]
      return { ...makeSelectMock({ data, error: null }), update: updateMock }
    })

    const { result } = renderHook(() => useQuarterReview('io-1'))
    await waitFor(() => expect(result.current.review).toEqual(existingRow))

    let ok
    await act(async () => {
      ok = await result.current.save({
        finalStatus: 'on_track',
        memberReflection: 'Good quarter',
        memberConfirmed: true,
        managerComment: 'Agreed, strong quarter',
        managerConfirmed: true,
      })
    })

    expect(ok).toBe(true)
    expect(updateMock).toHaveBeenCalledTimes(1)
    const payload = updateMock.mock.calls[0][0]
    expect(payload).toMatchObject({
      objective_id: 'io-1',
      final_status: 'on_track',
      member_reflection: 'Good quarter',
      manager_comment: 'Agreed, strong quarter',
    })
    expect(payload.member_confirmed_at).toMatch(ISO_TIMESTAMP)
    expect(payload.manager_confirmed_at).toMatch(ISO_TIMESTAMP)
    expect(payload.finalized_at).toMatch(ISO_TIMESTAMP)
    expect(payload.member_confirmed_at).toBe(payload.manager_confirmed_at)
    expect(payload.manager_confirmed_at).toBe(payload.finalized_at)
    expect(updateEqMock).toHaveBeenCalledWith('id', 'qr-1')
    expect(result.current.review.finalized_at).toBe('2026-09-23T10:00:00.000Z')
  })

  it('returns false and sets error when the save fails', async () => {
    mocks.from.mockReturnValue(makeSelectMock({ data: [], error: null }))
    const insertMock = vi.fn().mockResolvedValue({ error: { message: 'Insert boom' } })
    mocks.from.mockImplementation((table) => {
      if (table === 'quarter_reviews') return { ...makeSelectMock({ data: [], error: null }), insert: insertMock }
      return makeSelectMock({ data: [], error: null })
    })
    const { result } = renderHook(() => useQuarterReview('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ok
    await act(async () => {
      ok = await result.current.save({
        finalStatus: 'on_track',
        memberReflection: 'x',
        memberConfirmed: false,
        managerComment: '',
        managerConfirmed: false,
      })
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Insert boom')
  })
})
