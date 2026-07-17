import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCompanyObjectives: vi.fn(),
  useIndividualObjectives: vi.fn(),
  useActiveQuarter: vi.fn(),
  OkrDialog: vi.fn(),
  MyThreadPage: vi.fn(),
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

vi.mock('../../src/components/MyThreadPage', () => ({
  default: (props) => mocks.MyThreadPage(props),
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
  { id: 'io-1', title: 'Ship MVP' },
  { id: 'io-2', title: 'Interview 10 users' },
]

describe('OkrMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.OkrDialog.mockReturnValue(<div data-testid="okr-dialog" />)
    mocks.MyThreadPage.mockReturnValue(<div data-testid="my-thread" />)
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    })
    mocks.useActiveQuarter.mockReturnValue({ quarterId: 'q1', error: null })
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

  it('renders a segmented toggle labeled "OKR map" and "My thread"', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.getByRole('button', { name: /^okr map$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /my thread/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^map$/i })).not.toBeInTheDocument()
  })

  it('defaults to Map view with the OKR map selected and My thread unselected', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    expect(screen.getByRole('button', { name: /^okr map$/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /my thread/i })).toHaveAttribute('aria-pressed', 'false')
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
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
    expect(screen.getByTestId('my-thread')).toBeInTheDocument()
    expect(screen.queryByText('Expand into new markets')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /my thread/i })).toHaveAttribute('aria-pressed', 'true')
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
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
    fireEvent.click(screen.getByRole('button', { name: /^okr map$/i }))
    expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
    expect(screen.queryByTestId('my-thread')).not.toBeInTheDocument()
  })

  it('preserves the active quarter across view toggles', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    mocks.useActiveQuarter.mockReturnValue({ quarterId: 'q42', error: null })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
    fireEvent.click(screen.getByRole('button', { name: /^okr map$/i }))
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
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
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
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
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
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.objective).toBeUndefined()
  })

  it('passes the company objectives tree to the dialog for the alignment selector', () => {
    mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /add objective/i }))
    const props = mocks.OkrDialog.mock.calls.at(-1)[0]
    expect(props.companyObjectives).toBe(objectives)
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
    fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
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
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
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
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
      expect(screen.queryByText('Company Objective')).not.toBeInTheDocument()
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

  describe('alignment summary strip', () => {
    const linkedIndividualObjectives = [
      { id: 'io-1', title: 'A', link_type: 'direct_kr' },
      { id: 'io-2', title: 'B', link_type: 'direct_kr' },
      { id: 'io-3', title: 'C', link_type: 'objective_level' },
      { id: 'io-4', title: 'D', link_type: null },
    ]

    it('shows a Direct KR card counting direct_kr links in Map view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: linkedIndividualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      render(<OkrMapPage />)
      expect(screen.getByText(/Direct KR · 2/)).toBeInTheDocument()
    })

    it('shows an Objective-level card counting objective_level and null links in Map view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: linkedIndividualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      render(<OkrMapPage />)
      expect(screen.getByText(/Objective-level · 2/)).toBeInTheDocument()
    })

    it('shows zero counts when there are no individual objectives', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      render(<OkrMapPage />)
      expect(screen.getByText(/Direct KR · 0/)).toBeInTheDocument()
      expect(screen.getByText(/Objective-level · 0/)).toBeInTheDocument()
    })

    it('does not render the summary strip in My thread view', () => {
      mocks.useCompanyObjectives.mockReturnValue({ objectives, loading: false, error: null, refetch: vi.fn() })
      mocks.useIndividualObjectives.mockReturnValue({
        objectives: linkedIndividualObjectives,
        loading: false,
        error: null,
        refetch: vi.fn(),
      })
      render(<OkrMapPage />)
      fireEvent.click(screen.getByRole('button', { name: /my thread/i }))
      expect(screen.queryByText(/Direct KR · /)).not.toBeInTheDocument()
      expect(screen.queryByText(/Objective-level · /)).not.toBeInTheDocument()
    })
  })
})
