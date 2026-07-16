import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProtectedRoute from '../../src/components/ProtectedRoute'

describe('ProtectedRoute', () => {
  it('always renders children', () => {
    render(
      <ProtectedRoute><div>Protected content</div></ProtectedRoute>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
