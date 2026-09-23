import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  useQuarterReviewMock: vi.fn(),
}))

vi.mock('../../src/hooks/useQuarterReview', () => ({
  default: (...args) => mocks.useQuarterReviewMock(...args),
}))

import QuarterReviewModal from '../../src/components/QuarterReviewModal'

function setReview(review) {
  mocks.useQuarterReviewMock.mockReturnValue({
    review,
    loading: false,
    error: null,
    saving: false,
    save: mocks.save,
    refetch: vi.fn(),
  })
}

describe('QuarterReviewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.save.mockResolvedValue(true)
    setReview(null)
  })

  it('renders as a dialog', () => {
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByRole('dialog', { name: /quarter review/i })).toBeInTheDocument()
  })

  it('fetches the review scoped to the objective id', () => {
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(mocks.useQuarterReviewMock).toHaveBeenCalledWith('io-1')
  })

  it('shows a visible note that this is not used for salary or performance calibration', () => {
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByText(/給与査定・人事考課には使用されません/)).toBeInTheDocument()
    expect(screen.getByText(/not used for salary or performance calibration/i)).toBeInTheDocument()
  })

  it('renders the three traffic-light final status options', () => {
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    const group = screen.getByRole('radiogroup', { name: /final status/i })
    expect(within(group).getByRole('radio', { name: /on track/i })).toBeInTheDocument()
    expect(within(group).getByRole('radio', { name: /at risk/i })).toBeInTheDocument()
    expect(within(group).getByRole('radio', { name: /behind/i })).toBeInTheDocument()
  })

  it('renders a member reflection textarea and a member confirm checkbox', () => {
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByLabelText(/member's reflection/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /member confirms/i })).toBeInTheDocument()
  })

  it('renders a manager comment textarea and a manager confirm checkbox', () => {
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByLabelText(/manager's comment/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /manager confirms/i })).toBeInTheDocument()
  })

  it('pre-fills fields from an existing draft review', () => {
    setReview({
      id: 'qr-1',
      final_status: 'at_risk',
      member_reflection: 'Tough quarter',
      member_confirmed_at: '2026-09-20T00:00:00Z',
      manager_comment: 'Needs support',
      manager_confirmed_at: null,
      finalized_at: null,
    })
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByLabelText(/member's reflection/i)).toHaveValue('Tough quarter')
    expect(screen.getByLabelText(/manager's comment/i)).toHaveValue('Needs support')
    expect(screen.getByRole('checkbox', { name: /member confirms/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /manager confirms/i })).not.toBeChecked()
    const group = screen.getByRole('radiogroup', { name: /final status/i })
    expect(within(group).getByRole('radio', { name: /at risk/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('saves a draft with only the member side confirmed and shows it is not yet finalized', async () => {
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    fireEvent.click(screen.getByRole('radio', { name: /on track/i }))
    fireEvent.change(screen.getByLabelText(/member's reflection/i), { target: { value: 'Good quarter' } })
    fireEvent.click(screen.getByRole('checkbox', { name: /member confirms/i }))
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({
      finalStatus: 'on_track',
      memberReflection: 'Good quarter',
      memberConfirmed: true,
      managerComment: '',
      managerConfirmed: false,
    }))
  })

  it('shows the review is not yet finalized when only one side has confirmed', () => {
    setReview({
      id: 'qr-1',
      final_status: 'on_track',
      member_reflection: 'Good quarter',
      member_confirmed_at: '2026-09-20T00:00:00Z',
      manager_comment: null,
      manager_confirmed_at: null,
      finalized_at: null,
    })
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByText(/not yet finalized/i)).toBeInTheDocument()
  })

  it('shows the review finalized with a timestamp once both sides have confirmed', () => {
    setReview({
      id: 'qr-1',
      final_status: 'on_track',
      member_reflection: 'Good quarter',
      member_confirmed_at: '2026-09-20T00:00:00Z',
      manager_comment: 'Agreed',
      manager_confirmed_at: '2026-09-23T10:00:00.000Z',
      finalized_at: '2026-09-23T10:00:00.000Z',
    })
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByText(/finalized/i)).toBeInTheDocument()
    expect(screen.getByText(/2026-09-23/)).toBeInTheDocument()
  })

  it('calls onDone when Close is clicked, without saving', () => {
    const onDone = vi.fn()
    render(<QuarterReviewModal objectiveId="io-1" onDone={onDone} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(mocks.save).not.toHaveBeenCalled()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('shows a save error when the save fails', async () => {
    mocks.useQuarterReviewMock.mockReturnValue({
      review: null,
      loading: false,
      error: 'Save boom',
      saving: false,
      save: mocks.save,
      refetch: vi.fn(),
    })
    render(<QuarterReviewModal objectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Save boom')
  })
})
