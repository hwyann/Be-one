import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCompanyObjectives: vi.fn(),
  useIndividualObjectives: vi.fn(),
  useActiveQuarter: vi.fn(),
  useViewMode: vi.fn(),
  useCanCreateObjective: vi.fn(),
  useCreateQuarter: vi.fn(),
  useRequestQuarterReview: vi.fn(),
  OkrDialog: vi.fn(),
  MyThreadPage: vi.fn(),
  CompanyOkrDialog: vi.fn(),
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

vi.mock('../../src/hooks/useViewMode', () => ({
  default: mocks.useViewMode,
}))

vi.mock('../../src/hooks/useCanCreateObjective', () => ({
  default: mocks.useCanCreateObjective,
}))

vi.mock('../../src/hooks/useCreateQuarter', () => ({
  default: mocks.useCreateQuarter,
}))

vi.mock('../../src/hooks/useRequestQuarterReview', () => ({
  default: mocks.useRequestQuarterReview,
}))

vi.mock('../../src/components/OkrDialog', () => ({
  default: (props) => mocks.OkrDialog(props),
}))

vi.mock('../../src/components/MyThreadPage', () => ({
  default: (props) => mocks.MyThreadPage(props),
}))

vi.mock('../../src/components/CompanyOkrDialog', () => ({
  default: (props) => mocks.CompanyOkrDialog(props),
}))

import OkrMapPage from '../../src/components/OkrMapPage'

const objectives = [
  { id: '1', category: 'Growth', title: 'Expand into new markets', status: 'on_track' },
  { id: '2', category: 'Retention', title: 'Improve NPS score', status: 'at_risk' },
]

const threeObjectives = [
  { id: '1', category: 'Growth', title: 'Expand into new markets', status: 'on_track' },
  { id: '2', category: 'Retention', title: 'Improve NPS score', status: 'at_risk' },
  { id: '3', category: 'Efficiency', title: 'Reduce cycle time', status: 'on_track' },
]

const individualObjectives = [
  { id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura' },
  { id: 'io-2', title: 'Interview 10 users', owner_name: 'Satoshi Kimura' },
]

describe('OkrMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.OkrDialog.mockReturnValue(<div data-testid="okr-dialog" />)
    mocks.MyThreadPage.mockReturnValue(<div data-testid="my-thread" />)
    mocks.CompanyOkrDialog.mockReturnValue(<div data-testid="company-okr-dialog" />)
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useActiveQuarter.mockReturnValue({
      quarterId: 'q1',
      quarters: [
        { id: 'q1', label: 'Q1 2026', is_active: true },
        { id: 'q2', label: 'Q2 2026', is_active: false },
      ],
      error: null,
      selectQuarter: vi.fn(),
      refetch: vi.fn(),
    })
    mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
    mocks.useCanCreateObjective.mockReturnValue({
      canCreate: true,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useCreateQuarter.mockReturnValue({
      createQuarter: vi.fn(),
      creating: false,
      error: null,
    })
    mocks.useRequestQuarterReview.mockReturnValue({
      requestReview: vi.fn().mockResolvedValue(true),
      requesting: false,
      error: null,
    })
  })

  it('renders only the first objective initially (carousel core)', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null })
    render(<OkrMapPage />)
    expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
    expect(screen.queryByText('Improve NPS score')).not.toBeInTheDocument()
  })

  it('renders the kicker for only the current objective', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null })
    render(<OkrMapPage />)
    expect(screen.getByText('GROWTH')).toBeInTheDocument()
    expect(screen.queryByText('RETENTION')).not.toBeInTheDocument()
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

  it('renders an "Add objective" trigger on My Thread', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
  })

  it('does not render the dialog until the trigger is clicked', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  it('opens the dialog when the trigger is clicked', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
  })

  it('closes the dialog and refetches on save', () => {
    const refetch = vi.fn()
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onSave({ id: 'new-1', title: 'New objective' }) })
    expect(refetch).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  it('also refetches individual objectives after creating a new objective (#B7)', () => {
    const refetchIndividual = vi.fn()
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: refetchIndividual,
    })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onSave({ id: 'new-1', title: 'New objective' }) })
    expect(refetchIndividual).toHaveBeenCalledTimes(1)
  })

  it('closes the dialog on cancel without refetching', () => {
    const refetch = vi.fn()
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onClose() })
    expect(refetch).not.toHaveBeenCalled()
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  it('does not show "+ Add objective" on Map view (#B8)', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: /add objective/i })).not.toBeInTheDocument()
  })

  it('shows "+ Add objective" on My Thread view when current quarter and canCreate (#B8)', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
  })

  it('renders a segmented toggle labeled "OKR map" and "My OKR"', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.getByRole('button', { name: /^okr map$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /my okr/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^map$/i })).not.toBeInTheDocument()
  })

  it('defaults to Map view with the OKR map selected and My thread not rendered in Manager mode (#B11)', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: /my okr/i })).not.toBeInTheDocument()
  })

  it('renders the map carousel and hides MyThreadPage in Map view', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<OkrMapPage />)
    expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
    expect(screen.queryByTestId('my-thread')).not.toBeInTheDocument()
  })

  it('shows MyThreadPage and hides the map carousel when My thread is selected', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    expect(screen.getByTestId('my-thread')).toBeInTheDocument()
    expect(screen.queryByText('Expand into new markets')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /my okr/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('returns to the map carousel when Map is selected again', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /^okr map$/i }))
    expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
    expect(screen.queryByTestId('my-thread')).not.toBeInTheDocument()
  })

  it('preserves the active quarter across view toggles', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useActiveQuarter.mockReturnValue({ quarterId: 'q42', error: null })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /^okr map$/i }))
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.quarterId).toBe('q42')
  })

  it('passes individual and company objectives to MyThreadPage when in my-thread view', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    expect(screen.getByTestId('my-thread')).toBeInTheDocument()
    const props = mocks.MyThreadPage.mock.calls.at(-1)[0]
    expect(props.objectives).toBe(individualObjectives)
    expect(props.companyObjectives).toBe(objectives)
    expect(props.ownerName).toBeTruthy()
  })

  it('opens the dialog in edit mode when MyThreadPage calls onEdit', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    const myThreadProps = mocks.MyThreadPage.mock.calls.at(-1)[0]
    act(() => { myThreadProps.onEdit(individualObjectives[0]) })
    expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.objective).toEqual(individualObjectives[0])
  })

  it('does not render the temporary "My objectives" heading', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives,
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<OkrMapPage />)
    expect(screen.queryByText('My objectives')).not.toBeInTheDocument()
  })

  it('opens the dialog in add mode (no objective prop) when + Add objective is clicked', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.objective).toBeUndefined()
  })

  it('passes the company objectives tree to the dialog for the alignment selector', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.companyObjectives).toBe(objectives)
  })

  it('passes the active quarterId to the dialog', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useActiveQuarter.mockReturnValue({ quarterId: 'q42', error: null })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.quarterId).toBe('q42')
  })

  it('passes viewMode through to OkrDialog (so it can gate the Manager-only "Ask a question" affordance, #B24)', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.viewMode).toBe('member')
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
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    const myThreadProps = mocks.MyThreadPage.mock.calls.at(-1)[0]
    act(() => { myThreadProps.onEdit(individualObjectives[0]) })
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
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
    const myThreadProps = mocks.MyThreadPage.mock.calls.at(-1)[0]
    act(() => { myThreadProps.onEdit(individualObjectives[0]) })
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    act(() => { props.onClose() })
    expect(refetchIndividual).not.toHaveBeenCalled()
    expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
  })

  describe('per-objective "Company Objective" header', () => {
    it('renders "Company Objective" (singular) above the current objective in Map view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByText('Company Objective')).toBeInTheDocument()
    })

    it('no longer renders the plural "Company Objectives" section title from #200029527', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByText('Company Objectives')).not.toBeInTheDocument()
    })

    it('styles the header with the kicker typographic pattern', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      const header = screen.getByText('Company Objective')
      const style = header.style
      expect(style.textTransform).toBe('uppercase')
      expect(style.letterSpacing).toBe('0.16em')
      expect(style.font).toMatch(/700 10px/)
    })

    it('does not render the header in My thread view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.queryByText('Company Objective')).not.toBeInTheDocument()
    })
  })

  describe('quarter selector', () => {
    it('renders a quarter selector populated with the available quarters', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      const selector = screen.getByRole('combobox', { name: /quarter/i })
      expect(selector).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Q1 2026' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Q2 2026' })).toBeInTheDocument()
    })

    it('defaults the selector to the currently selected quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      const selector = screen.getByRole('combobox', { name: /quarter/i })
      expect(selector.value).toBe('q1')
    })

    it('calls selectQuarter with the chosen quarter id when a new quarter is picked', () => {
      const selectQuarter = vi.fn()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1',
        quarters: [
          { id: 'q1', label: 'Q1 2026', is_active: false },
          { id: 'q2', label: 'Q2 2026', is_active: true },
        ],
        error: null,
        selectQuarter,
      })
      render(<OkrMapPage />)
      fireEvent.change(screen.getByRole('combobox', { name: /quarter/i }), { target: { value: 'q2' } })
      expect(selectQuarter).toHaveBeenCalledWith('q2')
    })

    it('passes the selected quarterId through to useCompanyObjectives and useIndividualObjectives', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q2',
        quarters: [
          { id: 'q1', label: 'Q1 2026', is_active: false },
          { id: 'q2', label: 'Q2 2026', is_active: true },
        ],
        error: null,
        selectQuarter: vi.fn(),
      })
      render(<OkrMapPage />)
      expect(mocks.useCompanyObjectives).toHaveBeenCalledWith('q2')
      expect(mocks.useIndividualObjectives).toHaveBeenCalledWith('q2')
    })

    it('keeps the same selected quarter when toggling between Map and My Thread', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q2',
        quarters: [
          { id: 'q1', label: 'Q1 2026', is_active: false },
          { id: 'q2', label: 'Q2 2026', is_active: true },
        ],
        error: null,
        selectQuarter: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      fireEvent.click(screen.getByRole('button', { name: /^okr map$/i }))
      expect(screen.getByRole('combobox', { name: /quarter/i }).value).toBe('q2')
    })
  })

  describe('carousel navigation', () => {
    it('shows a position indicator "1 of N" on initial render', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('advances to the next objective when Next is clicked', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText('Improve NPS score')).toBeInTheDocument()
      expect(screen.queryByText('Expand into new markets')).not.toBeInTheDocument()
      expect(screen.getByText('2 of 3')).toBeInTheDocument()
    })

    it('goes back to the previous objective when Previous is clicked', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /previous/i }))
      expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
      expect(screen.queryByText('Improve NPS score')).not.toBeInTheDocument()
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('disables Previous at the first position', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
    })

    it('disables Next at the last position', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled()
      expect(screen.getByText('3 of 3')).toBeInTheDocument()
    })

    it('centers the current objective at ~70% width', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      const slide = screen.getByTestId('carousel-slide')
      expect(slide.style.width).toBe('70%')
      expect(slide.style.marginLeft).toBe('auto')
      expect(slide.style.marginRight).toBe('auto')
    })
  })

  describe('slide animation between objectives', () => {
    function mockMatchMedia(reducedMatches) {
      const original = window.matchMedia
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? reducedMatches : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
      return () => { window.matchMedia = original }
    }

    it('does not apply a slide animation on the initial render', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      const slide = screen.getByTestId('carousel-slide')
      expect(slide).toHaveAttribute('data-direction', 'none')
      expect(slide.style.animation).toBe('')
    })

    it('applies a forward slide animation when Next is clicked', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      const slide = screen.getByTestId('carousel-slide')
      expect(slide).toHaveAttribute('data-direction', 'forward')
      expect(slide.style.animation).toMatch(/280ms/)
      expect(slide.style.animation).toMatch(/ease-out/)
      expect(slide.style.animation).toMatch(/forward/)
    })

    it('applies a backward slide animation when Previous is clicked', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /previous/i }))
      const slide = screen.getByTestId('carousel-slide')
      expect(slide).toHaveAttribute('data-direction', 'backward')
      expect(slide.style.animation).toMatch(/280ms/)
      expect(slide.style.animation).toMatch(/ease-out/)
      expect(slide.style.animation).toMatch(/backward/)
    })

    it('skips the animation when prefers-reduced-motion is set', () => {
      const restore = mockMatchMedia(true)
      try {
        mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
        render(<OkrMapPage />)
        fireEvent.click(screen.getByRole('button', { name: /next/i }))
        const slide = screen.getByTestId('carousel-slide')
        expect(slide.style.animation).toBe('')
      } finally {
        restore()
      }
    })

    it('still animates when prefers-reduced-motion is not set (matchMedia returns false)', () => {
      const restore = mockMatchMedia(false)
      try {
        mocks.useCompanyObjectives.mockReturnValue({ objectives: threeObjectives, loading: false, error: null, refetch: vi.fn() })
        render(<OkrMapPage />)
        fireEvent.click(screen.getByRole('button', { name: /next/i }))
        const slide = screen.getByTestId('carousel-slide')
        expect(slide.style.animation).toMatch(/280ms/)
      } finally {
        restore()
      }
    })
  })

  // The link-type legend and alignment-summary-strip describe blocks that
  // used to live here were removed in #B26 — members can only align to a
  // whole company Objective now (no more direct_kr), so the solid/dashed
  // distinction and its counts no longer mean anything.

  it('passes viewMode through to the Map carousel so a Manager can open the member-OKR drill-down on a company card (#B26)', () => {
    const withMember = [{
      ...objectives[0],
      individual_objectives: [
        { id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed', key_results: [] },
      ],
    }, objectives[1]]
    mocks.useCompanyObjectives.mockReturnValue({ objectives: withMember, loading: false, error: null, refetch: vi.fn() })
    mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /show member okrs/i }))
    expect(screen.getByRole('group', { name: /member okrs/i })).toHaveTextContent('Ship MVP')
  })

  describe('Manager Map-view right panel for a member\'s OKR (#B28)', () => {
    const memberObjective = { id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed', key_results: [] }
    const withMember = [{ ...objectives[0], individual_objectives: [memberObjective] }, objectives[1]]

    it('opens the right panel (OkrDialog with managerReview) when a member row is clicked', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: withMember, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /show member okrs/i }))
      fireEvent.click(screen.getByRole('button', { name: /ship mvp/i }))
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
      const props = mocks.OkrDialog.mock.calls.at(-1)[0]
      expect(props.objective).toEqual(memberObjective)
      expect(props.managerReview).toBe(true)
      expect(props.viewMode).toBe('manager')
    })

    it('does not render the right panel before a member row is clicked', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: withMember, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('closes the right panel when the dialog\'s onClose is called', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: withMember, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /show member okrs/i }))
      fireEvent.click(screen.getByRole('button', { name: /ship mvp/i }))
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
      const { onClose } = mocks.OkrDialog.mock.calls.at(-1)[0]
      act(() => { onClose() })
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Company OKR empty-state panel on the Map (#B30)', () => {
    it('auto-opens the Company OKR panel when a Manager is on Map view and the quarter has no company objectives', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByTestId('company-okr-dialog')).toBeInTheDocument()
    })

    it('does not auto-open in Member view even with no company objectives', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('company-okr-dialog')).not.toBeInTheDocument()
    })

    it('does not auto-open when there are already company objectives', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('company-okr-dialog')).not.toBeInTheDocument()
    })

    it('does not reopen automatically after the Manager closes it for the same quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByTestId('company-okr-dialog')).toBeInTheDocument()
      const { onClose } = mocks.CompanyOkrDialog.mock.calls.at(-1)[0]
      act(() => { onClose() })
      expect(screen.queryByTestId('company-okr-dialog')).not.toBeInTheDocument()
    })

    it('lets the Manager reopen it via the persistent "+ Add company objective" button after dismissing it', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      const { onClose } = mocks.CompanyOkrDialog.mock.calls.at(-1)[0]
      act(() => { onClose() })
      expect(screen.queryByTestId('company-okr-dialog')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /add company objective/i }))
      expect(screen.getByTestId('company-okr-dialog')).toBeInTheDocument()
    })

    it('does not render the "+ Add company objective" button in Member view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByRole('button', { name: /add company objective/i })).not.toBeInTheDocument()
    })

    it('opening the Company OKR panel while a member right panel is open closes the member panel (mutually exclusive slot)', () => {
      const memberObjective = { id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed', key_results: [] }
      const withMember = [{ ...objectives[0], individual_objectives: [memberObjective] }, objectives[1]]
      mocks.useCompanyObjectives.mockReturnValue({ objectives: withMember, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /show member okrs/i }))
      fireEvent.click(screen.getByRole('button', { name: /ship mvp/i }))
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /add company objective/i }))
      expect(screen.getByTestId('company-okr-dialog')).toBeInTheDocument()
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('selecting a member while the Company OKR panel is open closes the Company OKR panel', () => {
      const memberObjective = { id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed', key_results: [] }
      const withMember = [{ ...objectives[0], individual_objectives: [memberObjective] }, objectives[1]]
      mocks.useCompanyObjectives.mockReturnValue({ objectives: withMember, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /add company objective/i }))
      expect(screen.getByTestId('company-okr-dialog')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /show member okrs/i }))
      fireEvent.click(screen.getByRole('button', { name: /ship mvp/i }))
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
      expect(screen.queryByTestId('company-okr-dialog')).not.toBeInTheDocument()
    })

    it('refetches company objectives, closes the panel, and toasts when the dialog reports a save', async () => {
      const refetch = vi.fn()
      mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      const { onSaved } = mocks.CompanyOkrDialog.mock.calls.at(-1)[0]
      act(() => { onSaved([{ id: 'new-co-1', title: 'Grow revenue' }]) })
      expect(refetch).toHaveBeenCalled()
      expect(screen.queryByTestId('company-okr-dialog')).not.toBeInTheDocument()
      expect(await screen.findByText(/company okr saved/i)).toBeInTheDocument()
    })

    it('passes quarterId and quarterName down to the panel', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1',
        quarters: [{ id: 'q1', name: 'Q1 2026', label: 'Q1 2026', is_active: true }],
        error: null,
        selectQuarter: vi.fn(),
        refetch: vi.fn(),
      })
      render(<OkrMapPage />)
      const props = mocks.CompanyOkrDialog.mock.calls.at(-1)[0]
      expect(props.quarterId).toBe('q1')
      expect(props.quarterName).toBe('Q1 2026')
    })
  })

  describe('read-only past quarter (#5a-2)', () => {
    function mockPastQuarter(quarterId = 'q1') {
      mocks.useActiveQuarter.mockReturnValue({
        quarterId,
        quarters: [
          { id: 'q1', label: 'Q1 2026', is_active: false },
          { id: 'q2', label: 'Q2 2026', is_active: true },
        ],
        error: null,
        selectQuarter: vi.fn(),
      })
    }

    it('hides the "+ Add objective" trigger when the selected quarter is not the current quarter', () => {
      mockPastQuarter()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByRole('button', { name: /add objective/i })).not.toBeInTheDocument()
    })

    it('keeps the "+ Add objective" trigger when the selected quarter is the current quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
    })

    it('never exposes a status editor from the map carousel when the quarter is past, even in Manager view (#B12/#B29)', () => {
      mockPastQuarter()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByRole('button', { name: /on track/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('group', { name: /set status/i })).not.toBeInTheDocument()
    })

    // #B29 supersedes the old blanket "map is fully read-only" rule for
    // status specifically: a Manager can now edit a company objective's
    // status from the Map (for a non-past quarter); a Member still cannot.
    it('does not expose a status editor from the map carousel in Member view for the current quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByRole('button', { name: /on track/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('group', { name: /set status/i })).not.toBeInTheDocument()
    })

    it('does expose a clickable status editor from the map carousel in Manager view for the current quarter (#B29)', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /on track/i }))
      expect(screen.getByRole('group', { name: /set status/i })).toBeInTheDocument()
    })

    it('passes readOnly to MyThreadPage when the selected quarter is past', () => {
      mockPastQuarter()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      const props = mocks.MyThreadPage.mock.calls.at(-1)[0]
      expect(props.readOnly).toBe(true)
    })

    it('passes readOnly false to MyThreadPage for the current quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      const props = mocks.MyThreadPage.mock.calls.at(-1)[0]
      expect(props.readOnly).toBe(false)
    })
  })

  describe('quarter restart gated by finalized reviews (#8b)', () => {
    it('hides the "+ Add objective" trigger when useCanCreateObjective reports canCreate: false, even for the current quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useCanCreateObjective.mockReturnValue({
        canCreate: false,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      render(<OkrMapPage />)
      expect(screen.queryByRole('button', { name: /add objective/i })).not.toBeInTheDocument()
    })

    it('shows the "+ Add objective" trigger when useCanCreateObjective reports canCreate: true for the current quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useCanCreateObjective.mockReturnValue({
        canCreate: true,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
    })

    it('passes the active quarterId and quarters list to useCanCreateObjective', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(mocks.useCanCreateObjective).toHaveBeenCalledWith('q1', [
        { id: 'q1', label: 'Q1 2026', is_active: true },
        { id: 'q2', label: 'Q2 2026', is_active: false },
      ])
    })

    it('refetches creation eligibility after a new objective is created (#B2)', () => {
      const refetchCanCreate = vi.fn()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useCanCreateObjective.mockReturnValue({
        canCreate: true,
        loading: false,
        error: null,
        refetch: refetchCanCreate,
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
      const props = mocks.OkrDialog.mock.calls.at(-1)[0]
      act(() => { props.onSave({ id: 'new-1', title: 'New objective' }) })
      expect(refetchCanCreate).toHaveBeenCalledTimes(1)
    })

    it('does not refetch creation eligibility when saving an edit to an existing objective (#B2)', () => {
      const refetchCanCreate = vi.fn()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useCanCreateObjective.mockReturnValue({
        canCreate: true,
        loading: false,
        error: null,
        refetch: refetchCanCreate,
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      const myThreadProps = mocks.MyThreadPage.mock.calls.at(-1)[0]
      act(() => { myThreadProps.onEdit(individualObjectives[0]) })
      const props = mocks.OkrDialog.mock.calls.at(-1)[0]
      act(() => { props.onSave({ id: 'io-1', title: 'Ship MVP v2' }) })
      expect(refetchCanCreate).not.toHaveBeenCalled()
    })
  })

  describe('member/manager view-mode toggle (#7a)', () => {
    it('defaults to the Map screen when view mode is Manager', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'true')
      // My Thread is not a real manager identity in this demo, so the toggle
      // isn't rendered at all in Manager mode (#B11) rather than shown unselected.
      expect(screen.queryByRole('button', { name: /my okr/i })).not.toBeInTheDocument()
    })

    it('defaults to the My Thread screen when view mode is Member', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByTestId('my-thread')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /my okr/i })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'false')
    })

    it('renders Member and Manager view-mode controls in the header', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /^member$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^manager$/i })).toBeInTheDocument()
    })

    it('marks the active view mode control as pressed', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /^manager$/i })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: /^member$/i })).toHaveAttribute('aria-pressed', 'false')
    })

    it('calls setViewMode when the Manager control is clicked', () => {
      const setViewMode = vi.fn()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      // Give the viewer a confirmed-owner objective so the empty-state
      // mandatory prompt (#B15) doesn't auto-open and disable this control
      // (#B23 gates it while mandatory) — unrelated to what this test covers.
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives, loading: false, error: null, refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /^manager$/i }))
      expect(setViewMode).toHaveBeenCalledWith('manager')
    })

    it('calls setViewMode when the Member control is clicked', () => {
      const setViewMode = vi.fn()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /^member$/i }))
      expect(setViewMode).toHaveBeenCalledWith('member')
    })

    it('still allows switching from My Thread to Map in Member mode (existing toggle keeps working)', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /^okr map$/i }))
      expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
      expect(screen.queryByTestId('my-thread')).not.toBeInTheDocument()
    })

  })

  describe('My Thread hidden in Manager mode (#B11)', () => {
    it('does not render the "My OKR" toggle button in Manager mode, only "OKR map"', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /^okr map$/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /my okr/i })).not.toBeInTheDocument()
    })

    it('falls back to the OKR map (not a stale My Thread view) when switching to Manager mode while on My Thread', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      const { rerender } = render(<OkrMapPage />)
      expect(screen.getByTestId('my-thread')).toBeInTheDocument()

      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      rerender(<OkrMapPage />)

      expect(screen.queryByTestId('my-thread')).not.toBeInTheDocument()
      expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.queryByRole('button', { name: /my okr/i })).not.toBeInTheDocument()
    })

    it('makes My Thread available again when switching back to Member mode, without forcing the view away from the Map (#7a default-view unaffected)', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      const { rerender } = render(<OkrMapPage />)
      expect(screen.queryByRole('button', { name: /my okr/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'true')

      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      rerender(<OkrMapPage />)

      expect(screen.getByRole('button', { name: /my okr/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.getByTestId('my-thread')).toBeInTheDocument()
    })
  })

  describe('"+ New quarter" button (demo)', () => {
    it('renders a "+ New quarter" button in the header', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /new quarter/i })).toBeInTheDocument()
    })

    it('creates the next quarter from the current list, then refetches and selects it', async () => {
      const createQuarter = vi.fn().mockResolvedValue({ id: 'q3', name: 'Q3 2026' })
      const refetchQuarters = vi.fn().mockResolvedValue()
      const selectQuarter = vi.fn()
      const quarters = [
        { id: 'q1', label: 'Q1 2026', is_active: false },
        { id: 'q2', label: 'Q2 2026', is_active: true },
      ]
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q2', quarters, error: null, selectQuarter, refetch: refetchQuarters,
      })
      mocks.useCreateQuarter.mockReturnValue({ createQuarter, creating: false, error: null })

      render(<OkrMapPage />)
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /new quarter/i })) })

      expect(createQuarter).toHaveBeenCalledWith(quarters)
      expect(refetchQuarters).toHaveBeenCalled()
      expect(selectQuarter).toHaveBeenCalledWith('q3')
    })

    it('shows a confirmation toast naming the newly created quarter', async () => {
      const createQuarter = vi.fn().mockResolvedValue({ id: 'q3', name: 'Q4 2026' })
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1',
        quarters: [{ id: 'q1', label: 'Q1 2026', is_active: true }],
        error: null,
        selectQuarter: vi.fn(),
        refetch: vi.fn().mockResolvedValue(),
      })
      mocks.useCreateQuarter.mockReturnValue({ createQuarter, creating: false, error: null })

      render(<OkrMapPage />)
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /new quarter/i })) })

      expect(screen.getByText(/Q4 2026/)).toBeInTheDocument()
    })

    it('does not select a quarter or refetch when quarter creation fails (createQuarter resolves null)', async () => {
      const createQuarter = vi.fn().mockResolvedValue(null)
      const refetchQuarters = vi.fn()
      const selectQuarter = vi.fn()
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1',
        quarters: [{ id: 'q1', label: 'Q1 2026', is_active: true }],
        error: null,
        selectQuarter,
        refetch: refetchQuarters,
      })
      mocks.useCreateQuarter.mockReturnValue({ createQuarter, creating: false, error: null })

      render(<OkrMapPage />)
      await act(async () => { fireEvent.click(screen.getByRole('button', { name: /new quarter/i })) })

      expect(refetchQuarters).not.toHaveBeenCalled()
      expect(selectQuarter).not.toHaveBeenCalled()
    })
  })

  describe('empty-state auto-open of Add Objective modal', () => {
    function setEmptyMemberState({ companyObjectivesList = objectives, canCreate = true, isPast = false } = {}) {
      mocks.useCompanyObjectives.mockReturnValue({ objectives: companyObjectivesList, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      mocks.useCanCreateObjective.mockReturnValue({ canCreate, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1',
        quarters: [{ id: 'q1', label: 'Q1 2026', is_active: !isPast }],
        error: null,
        selectQuarter: vi.fn(),
        refetch: vi.fn(),
      })
    }

    it('opens the Add Objective dialog by default when Company OKR is set but the viewer has no individual OKR yet', () => {
      setEmptyMemberState()
      render(<OkrMapPage />)
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
      const props = mocks.OkrDialog.mock.calls.at(-1)[0]
      expect(props.mandatory).toBe(true)
      expect(props.objective).toBeUndefined()
    })

    it('does not auto-open when the viewer already has an individual OKR', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: [{ id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura' }],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('does not auto-open when there is no Company OKR set yet for the quarter', () => {
      setEmptyMemberState({ companyObjectivesList: [] })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('does not auto-open in Manager mode', () => {
      setEmptyMemberState()
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('does not auto-open on a past (read-only) quarter', () => {
      setEmptyMemberState({ isPast: true })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('does not auto-open when the quarter restart gate says canCreate: false', () => {
      setEmptyMemberState({ canCreate: false })
      render(<OkrMapPage />)
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('stays closed after the viewer cancels the auto-opened prompt (fires once, not on every render)', () => {
      setEmptyMemberState()
      render(<OkrMapPage />)
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
      const props = mocks.OkrDialog.mock.calls.at(-1)[0]
      act(() => { props.onClose() })
      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    describe('cannot be escaped once open (#B23, Codex review — split-view-review-all)', () => {
      it('disables "OKR map" while the mandatory prompt is open', () => {
        setEmptyMemberState()
        render(<OkrMapPage />)
        expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /^okr map$/i })).toBeDisabled()
      })

      it('disables "Manager" while the mandatory prompt is open', () => {
        setEmptyMemberState()
        render(<OkrMapPage />)
        expect(screen.getByRole('button', { name: /^manager$/i })).toBeDisabled()
      })

      it('re-enables both once the prompt is resolved (an objective now exists)', () => {
        setEmptyMemberState()
        const { rerender } = render(<OkrMapPage />)
        expect(screen.getByRole('button', { name: /^okr map$/i })).toBeDisabled()

        mocks.useIndividualObjectives.mockReturnValue({
          objectives: [{ id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed' }],
          loading: false, error: null, refetch: vi.fn(),
        })
        const props = mocks.OkrDialog.mock.calls.at(-1)[0]
        act(() => { props.onSave({ id: 'io-1', title: 'Ship MVP' }) })
        rerender(<OkrMapPage />)

        expect(screen.getByRole('button', { name: /^okr map$/i })).not.toBeDisabled()
        expect(screen.getByRole('button', { name: /^manager$/i })).not.toBeDisabled()
      })

      it('disables the quarter selector and "+ New quarter" while the mandatory prompt is open (Codex review round 2)', () => {
        // Otherwise switching quarters closes the mandatory panel (via the
        // quarter-change effect above) without ever creating an OKR for the
        // original quarter, and the auto-open ref means returning to it
        // later won't re-prompt -- a real bypass of "must set one to continue".
        setEmptyMemberState()
        render(<OkrMapPage />)
        expect(screen.getByRole('combobox', { name: /quarter/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /new quarter/i })).toBeDisabled()
      })

      it('does not disable "OKR map"/"Manager" for a normal (non-mandatory) open panel', () => {
        mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
        mocks.useIndividualObjectives.mockReturnValue({
          objectives: individualObjectives, loading: false, error: null, refetch: vi.fn(),
        })
        mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
        render(<OkrMapPage />)
        fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
        fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
        expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /^okr map$/i })).not.toBeDisabled()
        expect(screen.getByRole('button', { name: /^manager$/i })).not.toBeDisabled()
        expect(screen.getByRole('combobox', { name: /quarter/i })).not.toBeDisabled()
        expect(screen.getByRole('button', { name: /new quarter/i })).not.toBeDisabled()
      })
    })
  })

  describe('closes any open panel on quarter change (#B23, Codex review — split-view-review-all)', () => {
    it('closes the panel when the quarter changes, so a stale draft cannot be saved into the new quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives, loading: false, error: null, refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      const quarters = [
        { id: 'q1', label: 'Q1 2026', is_active: true },
        { id: 'q2', label: 'Q2 2026', is_active: false },
      ]
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1', quarters, error: null, selectQuarter: vi.fn(), refetch: vi.fn(),
      })
      const { rerender } = render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()

      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q2', quarters, error: null, selectQuarter: vi.fn(), refetch: vi.fn(),
      })
      rerender(<OkrMapPage />)

      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })

    it('does not close the panel on a re-render where the quarter did not actually change', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: individualObjectives, loading: false, error: null, refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /^okr map$/i }))
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))

      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()
    })

    it('also closes the Manager Map-view member-OKR right panel when the quarter changes (#B28)', () => {
      const memberObjective = { id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed', key_results: [] }
      const withMember = [{ ...objectives[0], individual_objectives: [memberObjective] }, objectives[1]]
      mocks.useCompanyObjectives.mockReturnValue({ objectives: withMember, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'manager', setViewMode: vi.fn() })
      const quarters = [
        { id: 'q1', label: 'Q1 2026', is_active: true },
        { id: 'q2', label: 'Q2 2026', is_active: false },
      ]
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1', quarters, error: null, selectQuarter: vi.fn(), refetch: vi.fn(),
      })
      const { rerender } = render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /show member okrs/i }))
      fireEvent.click(screen.getByRole('button', { name: /ship mvp/i }))
      expect(screen.getByTestId('okr-dialog')).toBeInTheDocument()

      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q2', quarters, error: null, selectQuarter: vi.fn(), refetch: vi.fn(),
      })
      rerender(<OkrMapPage />)

      expect(screen.queryByTestId('okr-dialog')).not.toBeInTheDocument()
    })
  })

  describe('confirmed OKR locks out further add/edit (#B17/#B18)', () => {
    it('hides "+ Add objective" once the viewer has a confirmed objective this quarter', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: [{ id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed' }],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.queryByRole('button', { name: /add objective/i })).not.toBeInTheDocument()
    })

    it('still shows "+ Add objective" when the viewer only has a draft (not confirmed)', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: [{ id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'draft' }],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
    })

    it('shows "+ Add objective" for an unconfirmed draft even when the #8b restart gate (canCreate) is false', () => {
      // Regression: a stricter, unrelated gate (prior-quarter reviews not
      // finalized) was swallowing an in-progress draft on a brand-new
      // quarter, leaving no way back into the modal to finish or confirm
      // it. Confirmation status is now the only thing that hides this
      // button; canCreate no longer factors in.
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: [{ id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'draft' }],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useCanCreateObjective.mockReturnValue({ canCreate: false, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
    })

    it('does not hide "+ Add objective" for a confirmed objective belonging to someone else', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: [{ id: 'io-1', title: 'Hire designer', owner_name: 'Hiroshi Tanaka', status: 'confirmed' }],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      expect(screen.getByRole('button', { name: /add objective/i })).toBeInTheDocument()
    })

    it('passes the viewer\'s draft objectives to the dialog as existingDrafts', () => {
      const myDraft = { id: 'io-1', title: 'Interview users', owner_name: 'Satoshi Kimura', status: 'draft' }
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: [myDraft],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
      const props = mocks.OkrDialog.mock.calls.at(-1)[0]
      expect(props.existingDrafts).toEqual([myDraft])
    })
  })

  describe('Manager "Request all members to review OKR" button (#B27)', () => {
    it('renders the request-review button in Manager view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /request all members to review okr/i })).toBeInTheDocument()
    })

    it('does not render the request-review button in Member view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      expect(screen.queryByRole('button', { name: /request all members to review okr/i })).not.toBeInTheDocument()
    })

    it('calls requestReview with the active quarter id when clicked', async () => {
      const requestReview = vi.fn().mockResolvedValue(true)
      mocks.useRequestQuarterReview.mockReturnValue({ requestReview, requesting: false, error: null })
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /request all members to review okr/i }))
      await waitFor(() => expect(requestReview).toHaveBeenCalledWith('q1'))
    })

    it('shows a "Re-request" label once the active quarter already has a review request', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1',
        quarters: [
          { id: 'q1', label: 'Q1 2026', is_active: true, review_requested_at: '2026-09-27T00:00:00Z' },
          { id: 'q2', label: 'Q2 2026', is_active: false },
        ],
        error: null,
        selectQuarter: vi.fn(),
        refetch: vi.fn(),
      })
      render(<OkrMapPage />)
      expect(screen.getByRole('button', { name: /re-request okr review/i })).toBeInTheDocument()
    })

    it('passes reviewEnabled=true to MyThreadPage when the active quarter has a review request', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useActiveQuarter.mockReturnValue({
        quarterId: 'q1',
        quarters: [
          { id: 'q1', label: 'Q1 2026', is_active: true, review_requested_at: '2026-09-27T00:00:00Z' },
          { id: 'q2', label: 'Q2 2026', is_active: false },
        ],
        error: null,
        selectQuarter: vi.fn(),
        refetch: vi.fn(),
      })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      const props = mocks.MyThreadPage.mock.calls.at(-1)[0]
      expect(props.reviewEnabled).toBe(true)
    })

    it('passes reviewEnabled=false to MyThreadPage when the active quarter has no review request', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my okr/i }))
      const props = mocks.MyThreadPage.mock.calls.at(-1)[0]
      expect(props.reviewEnabled).toBe(false)
    })
  })
})
