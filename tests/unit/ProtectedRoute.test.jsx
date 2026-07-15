import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: mocks.useAuth,
}))

import ProtectedRoute from '../../src/components/ProtectedRoute'

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    mocks.useAuth.mockReturnValue({ session: { user: { id: '1' } }, loading: false })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('renders nothing while loading', () => {
    mocks.useAuth.mockReturnValue({ session: null, loading: true })
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects to login when unauthenticated', () => {
    mocks.useAuth.mockReturnValue({ session: null, loading: false })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute><div>Protected content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})
