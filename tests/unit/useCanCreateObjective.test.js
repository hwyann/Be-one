import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { from: mocks.from },
}))

import useCanCreateObjective from '../../src/hooks/useCanCreateObjective'

function makeObjectivesMock(result) {
  const eqMock = vi.fn().mockResolvedValue(result)
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { select: selectMock, __select: selectMock, __eq: eqMock }
}

function makeReviewsMock(result) {
  const inMock = vi.fn().mockResolvedValue(result)
  const selectMock = vi.fn().mockReturnValue({ in: inMock })
  return { select: selectMock, __select: selectMock, __in: inMock }
}

// q0 is the quarter immediately prior to q1 (the "selected"/new quarter).
// q-1 ends well before q0 too, to prove "nearest prior" wins over "any prior".
const quartersWithPrior = [
  { id: 'q-1', start_date: '2025-10-01', end_date: '2025-12-31' },
  { id: 'q0', start_date: '2026-01-01', end_date: '2026-03-31' },
  { id: 'q1', start_date: '2026-04-01', end_date: '2026-06-30' },
]

// q1 here has no chronologically-prior quarter (matches live Q3 2026 data).
const quartersNoPrior = [
  { id: 'q1', start_date: '2026-07-01', end_date: '2026-09-30' },
]

describe('useCanCreateObjective', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: true initially', () => {
    mocks.from.mockReturnValue(makeObjectivesMock(new Promise(() => {})))
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    expect(result.current.loading).toBe(true)
    expect(result.current.canCreate).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('does not query when quarterId is null', () => {
    const { result } = renderHook(() => useCanCreateObjective(null, quartersWithPrior))
    expect(mocks.from).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.canCreate).toBe(false)
  })

  it('is true without querying when there is no chronologically-prior quarter', async () => {
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersNoPrior))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(true)
    expect(result.current.error).toBeNull()
    expect(mocks.from).not.toHaveBeenCalled()
  })

  it('queries individual_objectives scoped to the prior quarter, not the selected quarter', async () => {
    const objectivesMock = makeObjectivesMock({ data: [], error: null })
    mocks.from.mockReturnValue(objectivesMock)
    renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(objectivesMock.__eq).toHaveBeenCalledWith('quarter_id', 'q0'))
  })

  it('picks the nearest prior quarter (latest end_date before the selected start_date)', async () => {
    const objectivesMock = makeObjectivesMock({ data: [], error: null })
    mocks.from.mockReturnValue(objectivesMock)
    renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(objectivesMock.__eq).toHaveBeenCalledWith('quarter_id', 'q0'))
    expect(objectivesMock.__eq).not.toHaveBeenCalledWith('quarter_id', 'q-1')
  })

  it('is true when the prior quarter has zero individual objectives', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') return makeObjectivesMock({ data: [], error: null })
      throw new Error('should not query quarter_reviews when there are no objectives')
    })
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('is false when at least one prior-quarter objective has no quarter_reviews row', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }, { id: 'io-2' }], error: null })
      }
      return makeReviewsMock({ data: [{ objective_id: 'io-1', finalized_at: '2026-03-01T00:00:00Z' }], error: null })
    })
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(false)
  })

  it('is false when a prior-quarter objective has a quarter_reviews row that is not finalized', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }], error: null })
      }
      return makeReviewsMock({ data: [{ objective_id: 'io-1', finalized_at: null }], error: null })
    })
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(false)
  })

  it('is true when every prior-quarter objective has a finalized quarter_reviews row', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }, { id: 'io-2' }], error: null })
      }
      return makeReviewsMock({
        data: [
          { objective_id: 'io-1', finalized_at: '2026-03-01T00:00:00Z' },
          { objective_id: 'io-2', finalized_at: '2026-03-02T00:00:00Z' },
        ],
        error: null,
      })
    })
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(true)
  })

  it('queries quarter_reviews scoped to the prior quarter objective ids', async () => {
    const reviewsMock = makeReviewsMock({ data: [], error: null })
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }, { id: 'io-2' }], error: null })
      }
      return reviewsMock
    })
    renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(reviewsMock.__in).toHaveBeenCalledWith('objective_id', ['io-1', 'io-2']))
  })

  it('returns an error when the prior-quarter objectives fetch fails', async () => {
    mocks.from.mockReturnValue(makeObjectivesMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('DB down')
    expect(result.current.canCreate).toBe(false)
  })

  it('returns an error when the quarter_reviews fetch fails', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }], error: null })
      }
      return makeReviewsMock({ data: null, error: { message: 'Reviews down' } })
    })
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersWithPrior))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Reviews down')
    expect(result.current.canCreate).toBe(false)
  })

  it('refetches against the new prior quarter when the quarterId argument changes', async () => {
    // q1's prior is q0; q2's prior is q1.
    const quarters = [
      ...quartersWithPrior,
      { id: 'q2', start_date: '2026-07-01', end_date: '2026-09-30' },
    ]
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') return makeObjectivesMock({ data: [], error: null })
      return makeReviewsMock({ data: [], error: null })
    })
    const { result, rerender } = renderHook(({ quarterId }) => useCanCreateObjective(quarterId, quarters), {
      initialProps: { quarterId: 'q1' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    mocks.from.mockClear()

    const objectivesMock = makeObjectivesMock({ data: [], error: null })
    mocks.from.mockReturnValue(objectivesMock)
    rerender({ quarterId: 'q2' })
    await waitFor(() => expect(objectivesMock.__eq).toHaveBeenCalledWith('quarter_id', 'q1'))
  })

  it('exposes a refetch function', () => {
    const { result } = renderHook(() => useCanCreateObjective('q1', quartersNoPrior))
    expect(typeof result.current.refetch).toBe('function')
  })

  it('treats a missing quarters list as no prior quarter (vacuously satisfied)', async () => {
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(true)
    expect(mocks.from).not.toHaveBeenCalled()
  })
})
