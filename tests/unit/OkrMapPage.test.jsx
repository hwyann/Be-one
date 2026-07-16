import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCompanyObjectives: vi.fn(),
}))

vi.mock('../../src/hooks/useCompanyObjectives', () => ({
  default: mocks.useCompanyObjectives,
}))

import OkrMapPage from '../../src/components/OkrMapPage'

const objectives = [
  { id: '1', category: 'Growth', title: 'Expand into new markets', status: 'on_track' },
  { id: '2', category: 'Retention', title: 'Improve NPS score', status: 'at_risk' },
]

describe('OkrMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a card for each objective', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null })
    render(<OkrMapPage />)
    expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
    expect(screen.getByText('Improve NPS score')).toBeInTheDocument()
  })

  it('renders kickers for each objective', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null })
    render(<OkrMapPage />)
    expect(screen.getByText('GROWTH')).toBeInTheDocument()
    expect(screen.getByText('RETENTION')).toBeInTheDocument()
  })

  it('shows loading state while fetching', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: true, error: null })
    render(<OkrMapPage />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error message on fetch failure', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: 'Network error' })
    render(<OkrMapPage />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Network error')
  })

  it('renders an empty grid with no objectives', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null })
    render(<OkrMapPage />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
