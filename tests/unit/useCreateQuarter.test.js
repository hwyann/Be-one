import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  quartersUpdate: vi.fn(),
  quartersUpdateIn: vi.fn(),
  quartersInsert: vi.fn(),
  quartersInsertSelect: vi.fn(),
  coSelect: vi.fn(),
  coSelectEq: vi.fn(),
  coInsert: vi.fn(),
  coInsertSelect: vi.fn(),
  krInsert: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useCreateQuarter from '../../src/hooks/useCreateQuarter'

const sourceQuarter = { id: 'q1', name: 'Q3 2026', end_date: '2026-09-30', is_active: true }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.from.mockImplementation((table) => {
    if (table === 'quarters') {
      return { update: mocks.quartersUpdate, insert: mocks.quartersInsert }
    }
    if (table === 'company_objectives') {
      return { select: mocks.coSelect, insert: mocks.coInsert }
    }
    if (table === 'key_results') {
      return { insert: mocks.krInsert }
    }
    throw new Error(`unexpected table: ${table}`)
  })
  mocks.quartersUpdate.mockReturnValue({ in: mocks.quartersUpdateIn })
  mocks.quartersUpdateIn.mockResolvedValue({ error: null })
  mocks.quartersInsert.mockReturnValue({ select: mocks.quartersInsertSelect })
  mocks.quartersInsertSelect.mockResolvedValue({
    data: [{ id: 'q2', name: 'Q4 2026', start_date: '2026-10-01', end_date: '2026-12-31', is_active: true }],
    error: null,
  })
  mocks.coSelect.mockReturnValue({ eq: mocks.coSelectEq })
  mocks.coSelectEq.mockResolvedValue({ data: [], error: null })
  mocks.coInsert.mockReturnValue({ select: mocks.coInsertSelect })
  mocks.coInsertSelect.mockResolvedValue({ data: [{ id: 'new-co-1' }], error: null })
  mocks.krInsert.mockResolvedValue({ error: null })
})

describe('useCreateQuarter', () => {
  it('exposes createQuarter, creating, error', () => {
    const { result } = renderHook(() => useCreateQuarter())
    expect(typeof result.current.createQuarter).toBe('function')
    expect(result.current.creating).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('deactivates the currently active quarter, then inserts the next one active', async () => {
    const { result } = renderHook(() => useCreateQuarter())
    let created
    await act(async () => { created = await result.current.createQuarter([sourceQuarter]) })

    expect(mocks.quartersUpdate).toHaveBeenCalledWith({ is_active: false })
    expect(mocks.quartersUpdateIn).toHaveBeenCalledWith('id', ['q1'])
    expect(mocks.quartersInsert).toHaveBeenCalledWith([
      { name: 'Q4 2026', start_date: '2026-10-01', end_date: '2026-12-31', is_active: true },
    ])
    expect(created).toEqual({ id: 'q2', name: 'Q4 2026', start_date: '2026-10-01', end_date: '2026-12-31', is_active: true })
  })

  it('does not try to deactivate anything when no quarter is currently active', async () => {
    const { result } = renderHook(() => useCreateQuarter())
    await act(async () => { await result.current.createQuarter([{ ...sourceQuarter, is_active: false }]) })
    expect(mocks.quartersUpdate).not.toHaveBeenCalled()
  })

  it('skips cloning company objectives when there is no prior quarter', async () => {
    const { result } = renderHook(() => useCreateQuarter())
    await act(async () => { await result.current.createQuarter([]) })
    expect(mocks.coSelect).not.toHaveBeenCalled()
  })

  it('clones each company objective and its key results into the new quarter', async () => {
    mocks.coSelectEq.mockResolvedValue({
      data: [{
        title: 'Ship the MVP',
        description: 'desc',
        category: 'Delivery',
        key_results: [
          { title: 'Zero critical bugs', description: null, target_value: 0, unit: 'bugs', target_note: null },
        ],
      }],
      error: null,
    })
    const { result } = renderHook(() => useCreateQuarter())
    await act(async () => { await result.current.createQuarter([sourceQuarter]) })

    expect(mocks.coSelectEq).toHaveBeenCalledWith('quarter_id', 'q1')
    expect(mocks.coInsert).toHaveBeenCalledWith([{
      quarter_id: 'q2',
      title: 'Ship the MVP',
      description: 'desc',
      category: 'Delivery',
      status: 'not_started',
    }])
    expect(mocks.krInsert).toHaveBeenCalledWith([{
      objective_id: 'new-co-1',
      title: 'Zero critical bugs',
      description: null,
      target_value: 0,
      unit: 'bugs',
      target_note: null,
      current_value: 0,
    }])
  })

  it('returns null and sets error when the quarter insert fails', async () => {
    mocks.quartersInsertSelect.mockResolvedValue({ data: null, error: { message: 'insert boom' } })
    const { result } = renderHook(() => useCreateQuarter())
    let created
    await act(async () => { created = await result.current.createQuarter([sourceQuarter]) })
    expect(created).toBeNull()
    expect(result.current.error).toBe('insert boom')
    expect(mocks.coSelect).not.toHaveBeenCalled()
  })

  it('returns null and sets error, without inserting, when deactivation fails', async () => {
    mocks.quartersUpdateIn.mockResolvedValue({ error: { message: 'deactivate boom' } })
    const { result } = renderHook(() => useCreateQuarter())
    let created
    await act(async () => { created = await result.current.createQuarter([sourceQuarter]) })
    expect(created).toBeNull()
    expect(result.current.error).toBe('deactivate boom')
    expect(mocks.quartersInsert).not.toHaveBeenCalled()
  })
})
