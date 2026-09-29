import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useActiveQuarter: vi.fn(),
  useIndividualObjectives: vi.fn(),
  useQuarterReviewMock: vi.fn(),
  save: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('../../src/hooks/useActiveQuarter', () => ({
  default: mocks.useActiveQuarter,
}))

vi.mock('../../src/hooks/useIndividualObjectives', () => ({
  default: mocks.useIndividualObjectives,
}))

vi.mock('../../src/hooks/useQuarterReview', () => ({
  default: (...args) => mocks.useQuarterReviewMock(...args),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}))

import ReviewPage from '../../src/components/ReviewPage'

const quarters = [{ id: 'q1', name: 'Q3 2026' }]

const objectives = [
  { id: 'io-1', title: 'Ship MVP', owner_name: 'Satoshi Kimura', status: 'confirmed' },
  { id: 'io-2', title: 'Draft OKR', owner_name: 'Satoshi Kimura', status: 'draft' },
  { id: 'io-3', title: 'Someone else\'s OKR', owner_name: 'Hiroshi Tanaka', status: 'confirmed' },
]

describe('ReviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.save.mockResolvedValue(true)
    mocks.useActiveQuarter.mockReturnValue({ quarterId: 'q1', quarters })
    mocks.useIndividualObjectives.mockReturnValue({ objectives, loading: false })
    mocks.useQuarterReviewMock.mockReturnValue({
      review: null, loading: false, error: null, saving: false, save: mocks.save, refetch: vi.fn(),
    })
  })

  it('renders the quarter name in the heading', () => {
    render(<ReviewPage />)
    expect(screen.getByText(/review your okr.*q3 2026/i)).toBeInTheDocument()
  })

  it('renders a section for each of the viewer\'s own confirmed objectives only', () => {
    render(<ReviewPage />)
    expect(screen.getByText('Ship MVP')).toBeInTheDocument()
    expect(screen.queryByText('Draft OKR')).not.toBeInTheDocument()
    expect(screen.queryByText('Someone else\'s OKR')).not.toBeInTheDocument()
  })

  it('calls useQuarterReview once per confirmed objective', () => {
    render(<ReviewPage />)
    expect(mocks.useQuarterReviewMock).toHaveBeenCalledWith('io-1')
    expect(mocks.useQuarterReviewMock).toHaveBeenCalledTimes(1)
  })

  it('saves each section independently, without requiring navigation away (draft-friendly)', () => {
    render(<ReviewPage />)
    fireEvent.change(screen.getByLabelText(/member's reflection/i), { target: { value: 'Good progress' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ memberReflection: 'Good progress' }))
  })

  it('navigates back to the map when Back is clicked', () => {
    render(<ReviewPage />)
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    expect(mocks.navigate).toHaveBeenCalledWith('/')
  })

  it('renders a message when there are no confirmed objectives to review', () => {
    mocks.useIndividualObjectives.mockReturnValue({ objectives: [], loading: false })
    render(<ReviewPage />)
    expect(screen.getByText(/no confirmed okr to review yet/i)).toBeInTheDocument()
  })
})
