import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: { functions: { invoke: mocks.invoke } },
}))

import useKrSummary from '../../src/hooks/useKrSummary'

describe('useKrSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in loading status when an objective id is provided', () => {
    mocks.invoke.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useKrSummary('io-1'))
    expect(result.current.status).toBe('loading')
    expect(result.current.loading).toBe(true)
    expect(result.current.summary).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('invokes the generate-kr-summary edge function with the objective id', async () => {
    mocks.invoke.mockResolvedValue({
      data: { summary_text: 'On track overall.', based_on_check_in_count: 4, cached: true },
      error: null,
    })
    renderHook(() => useKrSummary('io-42'))
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1))
    expect(mocks.invoke).toHaveBeenCalledWith('generate-kr-summary', {
      body: { individual_objective_id: 'io-42' },
    })
  })

  it('returns ready status with the summary text when the function returns summary_text', async () => {
    mocks.invoke.mockResolvedValue({
      data: { summary_text: 'Improving trajectory; shipping steadily.', based_on_check_in_count: 5, cached: false },
      error: null,
    })
    const { result } = renderHook(() => useKrSummary('io-1'))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.summary).toBe('Improving trajectory; shipping steadily.')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns insufficient_data status when the function reports too few check-ins', async () => {
    mocks.invoke.mockResolvedValue({
      data: { status: 'insufficient_data', message: 'Need at least 3 check-ins to summarize.' },
      error: null,
    })
    const { result } = renderHook(() => useKrSummary('io-1'))
    await waitFor(() => expect(result.current.status).toBe('insufficient_data'))
    expect(result.current.summary).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns error status when the edge function call fails', async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { message: 'Function crashed' } })
    const { result } = renderHook(() => useKrSummary('io-1'))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.summary).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Function crashed')
  })

  it('returns error status when the response payload is unexpected', async () => {
    mocks.invoke.mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useKrSummary('io-1'))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.summary).toBeNull()
    expect(result.current.error).not.toBeNull()
  })

  it('does not invoke the function when the objective id is null', () => {
    const { result } = renderHook(() => useKrSummary(null))
    expect(mocks.invoke).not.toHaveBeenCalled()
    expect(result.current.status).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.summary).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('refetches when the objective id changes', async () => {
    mocks.invoke.mockResolvedValue({
      data: { summary_text: 'x', based_on_check_in_count: 3, cached: true },
      error: null,
    })
    const { rerender } = renderHook(({ id }) => useKrSummary(id), { initialProps: { id: 'io-1' } })
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(1))
    rerender({ id: 'io-2' })
    await waitFor(() => expect(mocks.invoke).toHaveBeenCalledTimes(2))
    expect(mocks.invoke).toHaveBeenLastCalledWith('generate-kr-summary', {
      body: { individual_objective_id: 'io-2' },
    })
  })
})
