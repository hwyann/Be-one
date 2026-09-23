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

describe('useCanCreateObjective', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading: true initially', () => {
    mocks.from.mockReturnValue(makeObjectivesMock(new Promise(() => {})))
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    expect(result.current.loading).toBe(true)
    expect(result.current.canCreate).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('does not query when quarterId is null', () => {
    const { result } = renderHook(() => useCanCreateObjective(null))
    expect(mocks.from).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.canCreate).toBe(false)
  })

  it('is true when the quarter has zero individual objectives', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') return makeObjectivesMock({ data: [], error: null })
      throw new Error('should not query quarter_reviews when there are no objectives')
    })
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('queries individual_objectives filtered by quarter_id', async () => {
    const objectivesMock = makeObjectivesMock({ data: [], error: null })
    mocks.from.mockReturnValue(objectivesMock)
    renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(objectivesMock.__eq).toHaveBeenCalledWith('quarter_id', 'q1'))
  })

  it('is false when at least one objective has no quarter_reviews row', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }, { id: 'io-2' }], error: null })
      }
      return makeReviewsMock({ data: [{ objective_id: 'io-1', finalized_at: '2026-09-01T00:00:00Z' }], error: null })
    })
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(false)
  })

  it('is false when an objective has a quarter_reviews row that is not finalized', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }], error: null })
      }
      return makeReviewsMock({ data: [{ objective_id: 'io-1', finalized_at: null }], error: null })
    })
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(false)
  })

  it('is true when every objective has a finalized quarter_reviews row', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }, { id: 'io-2' }], error: null })
      }
      return makeReviewsMock({
        data: [
          { objective_id: 'io-1', finalized_at: '2026-09-01T00:00:00Z' },
          { objective_id: 'io-2', finalized_at: '2026-09-02T00:00:00Z' },
        ],
        error: null,
      })
    })
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canCreate).toBe(true)
  })

  it('queries quarter_reviews scoped to the loaded objective ids', async () => {
    const reviewsMock = makeReviewsMock({ data: [], error: null })
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') {
        return makeObjectivesMock({ data: [{ id: 'io-1' }, { id: 'io-2' }], error: null })
      }
      return reviewsMock
    })
    renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(reviewsMock.__in).toHaveBeenCalledWith('objective_id', ['io-1', 'io-2']))
  })

  it('returns an error when the objectives fetch fails', async () => {
    mocks.from.mockReturnValue(makeObjectivesMock({ data: null, error: { message: 'DB down' } }))
    const { result } = renderHook(() => useCanCreateObjective('q1'))
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
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Reviews down')
    expect(result.current.canCreate).toBe(false)
  })

  it('refetches when the quarterId argument changes', async () => {
    mocks.from.mockImplementation(table => {
      if (table === 'individual_objectives') return makeObjectivesMock({ data: [], error: null })
      return makeReviewsMock({ data: [], error: null })
    })
    const { result, rerender } = renderHook(({ quarterId }) => useCanCreateObjective(quarterId), {
      initialProps: { quarterId: 'q1' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    mocks.from.mockClear()
    rerender({ quarterId: 'q2' })
    await waitFor(() => {
      const objectivesCall = mocks.from.mock.calls.find(c => c[0] === 'individual_objectives')
      expect(objectivesCall).toBeTruthy()
    })
  })

  it('exposes a refetch function', () => {
    mocks.from.mockReturnValue(makeObjectivesMock({ data: [], error: null }))
    const { result } = renderHook(() => useCanCreateObjective('q1'))
    expect(typeof result.current.refetch).toBe('function')
  })
})
