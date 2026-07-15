import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOtp: mocks.signInWithOtp,
    },
  },
}))

import LoginPage from '../../src/components/LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input and send button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument()
  })

  it('shows error for unauthorized email', async () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'other@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/not authorized/i)
    expect(mocks.signInWithOtp).not.toHaveBeenCalled()
  })

  it('calls signInWithOtp for authorized email', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jessica@bekindlabs.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    await waitFor(() =>
      expect(mocks.signInWithOtp).toHaveBeenCalledWith({
        email: 'jessica@bekindlabs.com',
        options: expect.any(Object),
      })
    )
  })

  it('shows confirmation after link sent', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jessica@bekindlabs.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
  })
})
