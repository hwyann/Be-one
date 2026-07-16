import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCompanyObjectives: vi.fn(),
  useIndividualObjectives: vi.fn(),
  useActiveQuarter: vi.fn(),
  OkrDialog: vi.fn(),
}))

vi.mock('../../src/hooks/useCompanyObjectives', () => ({
  default: mocks.useCompanyObjectives,
}))

vi.mock('../../src/hooks/useIndividualObjectives', () => ({
  default: mocks.useIndividualObjectives,
}))

vi.mock('../../src/hooks/useActiveQuarter', () => ({
  default: mocks.useActiveQuarter,
}))

vi.mock('../../src/components/OkrDialog', () => ({
  default: (props) => mocks.OkrDialog(props),
}))

import OkrMapPage from '../../src/components/OkrMapPage'

const objectives = [
  { id: '1', category: 'Growth', title: 'Expand into new markets', status: 'on_track' },
  { id: '2', category: 'Retention', title: 'Improve NPS score', status: 'at_risk' },
]

const individualObjectives = [
  { id: 'io-1', title: 'Ship MVP' },
  { id: 'io-2', title: 'Interview 10 users' },
]

describe('OkrMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.OkrDialog.mockReturnValue(<div data-testid="okr-dialog" />)
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useActiveQuarter.mockReturnValue({ quarterId: 'q1', error: null })
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

  it('renders an "Add objective" trigger', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
  })

  it('does not render the dialog until the trigger is clicked', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  it('opens the dialog when the trigger is clicked', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
  })

  it('closes the dialog and refetches on save', () => {
    const refetch = vi.fn()
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onSave({ id: 'new-1', title: 'New objective' }) })
    expect(refetch).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  it('closes the dialog on cancel without refetching', () => {
    const refetch = vi.fn()
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onClose() })
    expect(refetch).not.toHaveBeenCalled()
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  it('renders each individual objective title as a clickable edit trigger', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<OkrMapPage />)
    expect(screen.getByRole('button', { name: /^Ship MVP$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Interview 10 users$/ })).toBeInTheDocument()
  })

  it('opens the dialog in edit mode when an individual objective is clicked', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /^Ship MVP$/ }))
    expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.objective).toEqual(individualObjectives[0])
  })

  it('opens the dialog in add mode (no objective prop) when + Add objective is clicked', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.objective).toBeUndefined()
  })

  it('passes the active quarterId to the dialog', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useActiveQuarter.mockReturnValue({ quarterId: 'q42', error: null })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.quarterId).toBe('q42')
  })

  it('refetches individual objectives after an edit save', () => {
    const refetchIndividual = vi.fn()
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: refetchIndividual,
    })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /^Ship MVP$/ }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onSave({ id: 'io-1', title: 'Ship MVP v2' }) })
    expect(refetchIndividual).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  it('closes the edit dialog on cancel without refetching', () => {
    const refetchIndividual = vi.fn()
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: refetchIndividual,
    })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /^Ship MVP$/ }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onClose() })
    expect(refetchIndividual).not.toHaveBeenCalled()
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })
})
