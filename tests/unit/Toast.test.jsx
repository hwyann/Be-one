import { render, screen, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import Toast from '../../src/components/Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the message inside a status role', () => {
    render(<Toast message="KR check-in notes saved." visibleMs={5000} onDismiss={() => {}} />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('KR check-in notes saved.')
  })

  it('calls onDismiss after visibleMs', () => {
    const onDismiss = vi.fn()
    render(<Toast message="Saved." visibleMs={5000} onDismiss={onDismiss} />)

    expect(onDismiss).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(4999))
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('clears the timer on unmount', () => {
    const onDismiss = vi.fn()
    const { unmount } = render(<Toast message="Saved." visibleMs={5000} onDismiss={onDismiss} />)
    unmount()
    act(() => vi.advanceTimersByTime(10000))
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
