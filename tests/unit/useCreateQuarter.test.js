import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  quartersUpdate: vi.fn(),
  quartersUpdateIn: vi.fn(),
  quartersInsert: vi.fn(),
  quartersInsertSelect: vi.fn(),
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
    throw new Error(`unexpected table: ${table}`)
  })
  mocks.quartersUpdate.mockReturnValue({ in: mocks.quartersUpdateIn })
  mocks.quartersUpdateIn.mockResolvedValue({ error: null })
  mocks.quartersInsert.mockReturnValue({ select: mocks.quartersInsertSelect })
  mocks.quartersInsertSelect.mockResolvedValue({
    data: [{ id: 'q2', name: 'Q4 2026', start_date: '2026-10-01', end_date: '2026-12-31', is_active: true }],
    error: null,
  })
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

  // #B31: "+ New quarter" no longer clones Company OKR from the prior
  // quarter — every new quarter starts empty, and the Manager sets it
  // fresh via CompanyOkrDialog (opened directly by OkrMapPage right after
  // creation). Only the quarters table itself is ever touched here now.
  it('never touches company_objectives or key_results (no more cloning)', async () => {
    const { result } = renderHook(() => useCreateQuarter())
    await act(async () => { await result.current.createQuarter([sourceQuarter]) })
    expect(mocks.from).not.toHaveBeenCalledWith('company_objectives')
    expect(mocks.from).not.toHaveBeenCalledWith('key_results')
  })

  it('returns null and sets error when the quarter insert fails', async () => {
    mocks.quartersInsertSelect.mockResolvedValue({ data: null, error: { message: 'insert boom' } })
    const { result } = renderHook(() => useCreateQuarter())
    let created
    await act(async () => { created = await result.current.createQuarter([sourceQuarter]) })
    expect(created).toBeNull()
    expect(result.current.error).toBe('insert boom')
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
