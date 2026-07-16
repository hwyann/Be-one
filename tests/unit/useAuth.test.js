import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
  },
}))

import { useAuth } from '../../src/hooks/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mocks.unsubscribe } },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts loading with no session', () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    expect(result.current.session).toBeNull()
  })

  it('resolves session and clears loading after getSession', async () => {
    const fakeSession = { user: { id: 'abc' } }
    mocks.getSession.mockResolvedValue({ data: { session: fakeSession } })
    const { result } = renderHook(() => useAuth())
    await act(async () => {})
    expect(result.current.session).toEqual(fakeSession)
    expect(result.current.loading).toBe(false)
  })

  it('unsubscribes on unmount', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })
    const { unmount } = renderHook(() => useAuth())
    await act(async () => {})
    unmount()
    expect(mocks.unsubscribe).toHaveBeenCalled()
  })
})
