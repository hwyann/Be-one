import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useCheckInHistory from '../../src/hooks/useCheckInHistory'

const fakeCheckIns = [
  { id: 'c1', status: 'on_track', note: 'started', plan_next: 'ship', created_at: '2026-07-01T09:00:00Z' },
  { id: 'c2', status: 'at_risk',  note: 'stuck',   plan_next: 'pair', created_at: '2026-07-08T09:00:00Z' },
]

function makeCheckInsMock(result) {
  const orderMock = vi.fn().mockResolvedValue(result)
  const eqMock = vi.fn().mockReturnValue({ order: orderMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { select: selectMock, __select: selectMock, __eq: eqMock, __order: orderMock }
}

describe('useCheckInHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: true initially', () => {
    mocks.from.mockReturnValue(makeCheckInsMock(new Promise(() => {})))
    const { result } = renderHook(() => useCheckInHistory('io-1'))
    expect(result.current.loading).toBe(true)
    expect(result.current.checkIns).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns check-ins for the given individual objective', async () => {
    mocks.from.mockReturnValue(makeCheckInsMock({ data: fakeCheckIns, error: null }))
    const { result } = renderHook(() => useCheckInHistory('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.checkIns).toEqual(fakeCheckIns)
    expect(result.current.error).toBeNull()
  })

  it('queries check_ins filtered by individual_objective_id and ordered by created_at ascending', async () => {
    const checkInsMock = makeCheckInsMock({ data: fakeCheckIns, error: null })
    mocks.from.mockReturnValue(checkInsMock)
    const { result } = renderHook(() => useCheckInHistory('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mocks.from).toHaveBeenCalledWith('check_ins')
    expect(checkInsMock.__eq).toHaveBeenCalledWith('individual_objective_id', 'io-1')
    expect(checkInsMock.__order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('selects status, note, plan_next, and created_at', async () => {
    const checkInsMock = makeCheckInsMock({ data: fakeCheckIns, error: null })
    mocks.from.mockReturnValue(checkInsMock)
    const { result } = renderHook(() => useCheckInHistory('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    const selectArg = checkInsMock.__select.mock.calls[0][0]
    expect(selectArg).toContain('status')
    expect(selectArg).toContain('note')
    expect(selectArg).toContain('plan_next')
    expect(selectArg).toContain('created_at')
  })

  it('returns an error when the fetch fails', async () => {
    mocks.from.mockReturnValue(makeCheckInsMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useCheckInHistory('io-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
    expect(result.current.checkIns).toEqual([])
  })

  it('refetch reloads the check-ins', async () => {
    const first = [fakeCheckIns[0]]
    let call = 0
    mocks.from.mockImplementation(() => {
      call += 1
      return makeCheckInsMock({ data: call === 1 ? first : fakeCheckIns, error: null })
    })
    const { result } = renderHook(() => useCheckInHistory('io-1'))
    await waitFor(() => expect(result.current.checkIns).toEqual(first))
    await act(async () => { await result.current.refetch() })
    expect(result.current.checkIns).toEqual(fakeCheckIns)
  })

  it('refetches when the individual objective id changes', async () => {
    mocks.from.mockReturnValue(makeCheckInsMock({ data: fakeCheckIns, error: null }))
    const { rerender } = renderHook(({ id }) => useCheckInHistory(id), { initialProps: { id: 'io-1' } })
    await waitFor(() => expect(mocks.from).toHaveBeenCalledTimes(1))
    rerender({ id: 'io-2' })
    await waitFor(() => expect(mocks.from).toHaveBeenCalledTimes(2))
  })

  it('does not fetch when the individual objective id is null', () => {
    mocks.from.mockReturnValue(makeCheckInsMock({ data: [], error: null }))
    const { result } = renderHook(() => useCheckInHistory(null))
    expect(mocks.from).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.checkIns).toEqual([])
  })
})
