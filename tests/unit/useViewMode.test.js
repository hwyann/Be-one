import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import useViewMode from '../../src/hooks/useViewMode'

const STORAGE_KEY = 'be-one:view-mode'

describe('useViewMode', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('defaults to member view mode when nothing is persisted', () => {
    const { result } = renderHook(() => useViewMode())
    expect(result.current.viewMode).toBe('member')
  })

  it('reads a persisted manager view mode from localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'manager')
    const { result } = renderHook(() => useViewMode())
    expect(result.current.viewMode).toBe('manager')
  })

  it('falls back to the default when the persisted value is invalid', () => {
    window.localStorage.setItem(STORAGE_KEY, 'nonsense')
    const { result } = renderHook(() => useViewMode())
    expect(result.current.viewMode).toBe('member')
  })

  it('setViewMode updates the returned view mode', () => {
    const { result } = renderHook(() => useViewMode())
    act(() => { result.current.setViewMode('manager') })
    expect(result.current.viewMode).toBe('manager')
  })

  it('setViewMode persists the choice to localStorage', () => {
    const { result } = renderHook(() => useViewMode())
    act(() => { result.current.setViewMode('manager') })
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('manager')
  })
})
