import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useIndividualObjectives from '../../src/hooks/useIndividualObjectives'

const fakeObjectives = [
  { id: 'io-1', title: 'Ship MVP' },
  { id: 'io-2', title: 'Interview 10 users' },
]

function makeQuartersMock(result) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  }
}

function makeObjectivesMock(result) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(result),
    }),
  }
}

describe('useIndividualObjectives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: true initially', () => {
    mocks.from.mockReturnValue(makeQuartersMock(new Promise(() => {})))
    const { result } = renderHook(() => useIndividualObjectives())
    expect(result.current.loading).toBe(true)
    expect(result.current.objectives).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns individual objectives for the active quarter', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      return makeObjectivesMock({ data: fakeObjectives, error: null })
    })
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.objectives).toEqual(fakeObjectives)
    expect(result.current.error).toBeNull()
  })

  it('filters individual_objectives by the active quarter_id', async () => {
    const objectivesMock = makeObjectivesMock({ data: fakeObjectives, error: null })
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      return objectivesMock
    })
    renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith('individual_objectives'))
    const selectResult = objectivesMock.select.mock.results[0].value
    expect(selectResult.eq).toHaveBeenCalledWith('quarter_id', 'q1')
  })

  it('returns error when quarters fetch fails', async () => {
    mocks.from.mockReturnValue(makeQuartersMock({ data: null, error: { message: 'Quarter down' } }))
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Quarter down')
    expect(result.current.objectives).toEqual([])
  })

  it('returns error when objectives fetch fails', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      return makeObjectivesMock({ data: null, error: { message: 'DB down' } })
    })
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
    expect(result.current.objectives).toEqual([])
  })

  it('queries individual_objectives by the given quarterId without looking up the active quarter', async () => {
    const objectivesMock = makeObjectivesMock({ data: fakeObjectives, error: null })
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') throw new Error('should not look up the active quarter when quarterId is given')
      return objectivesMock
    })
    const { result } = renderHook(() => useIndividualObjectives('q99'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mocks.from).toHaveBeenCalledWith('individual_objectives')
    const selectResult = objectivesMock.select.mock.results[0].value
    expect(selectResult.eq).toHaveBeenCalledWith('quarter_id', 'q99')
    expect(result.current.objectives).toEqual(fakeObjectives)
  })

  it('refetches with the new quarterId when the quarterId argument changes', async () => {
    const forQ1 = [{ id: 'io-1', title: 'Q1 objective' }]
    const forQ2 = [{ id: 'io-2', title: 'Q2 objective' }]
    mocks.from.mockImplementation((table) => {
      if (table === 'quarters') throw new Error('should not look up the active quarter when quarterId is given')
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation((_col, id) =>
            Promise.resolve({ data: id === 'q1' ? forQ1 : forQ2, error: null })
          ),
        }),
      }
    })
    const { result, rerender } = renderHook(({ quarterId }) => useIndividualObjectives(quarterId), {
      initialProps: { quarterId: 'q1' },
    })
    await waitFor(() => expect(result.current.objectives).toEqual(forQ1))
    rerender({ quarterId: 'q2' })
    await waitFor(() => expect(result.current.objectives).toEqual(forQ2))
  })

  it('selects owner_name and link fields', async () => {
    let capturedSelect
    const eqMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const selectSpy = vi.fn().mockImplementation(sel => {
      capturedSelect = sel
      return { eq: eqMock }
    })
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      return { select: selectSpy }
    })
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(capturedSelect).toContain('owner_name')
    expect(capturedSelect).toContain('linked_company_objective_id')
    expect(capturedSelect).toContain('key_result_id')
  })

  it('qualifies the key_results embed by its owning FK to avoid PostgREST ambiguity', async () => {
    let capturedSelect
    const eqMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const selectSpy = vi.fn().mockImplementation(sel => {
      capturedSelect = sel
      return { eq: eqMock }
    })
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      return { select: selectSpy }
    })
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(capturedSelect).toContain('key_results!key_results_individual_objective_id_fkey(id, title, target_note)')
  })

  it('refetch reloads the objectives', async () => {
    const first = [{ id: 'io-1', title: 'A' }]
    const second = [
      { id: 'io-1', title: 'A' },
      { id: 'io-2', title: 'B' },
    ]
    let call = 0
    mocks.from.mockImplementation(table => {
      if (table === 'quarters') return makeQuartersMock({ data: { id: 'q1' }, error: null })
      call += 1
      return makeObjectivesMock({ data: call === 1 ? first : second, error: null })
    })
    const { result } = renderHook(() => useIndividualObjectives())
    await waitFor(() => expect(result.current.objectives).toEqual(first))
    await act(async () => { await result.current.refetch() })
    expect(result.current.objectives).toEqual(second)
  })
})
