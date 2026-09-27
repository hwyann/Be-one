import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  useQuarterReviewMock: vi.fn(),
}))

vi.mock('../../src/hooks/useQuarterReview', () => ({
  default: (...args) => mocks.useQuarterReviewMock(...args),
}))

import AllOkrsReview from '../../src/components/AllOkrsReview'

const objectives = [
  { id: 'io-1', title: 'Ship MVP' },
  { id: 'io-2', title: 'Interview 10 users' },
]

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

describe('AllOkrsReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.save.mockResolvedValue(true)
    setReview(null)
  })

  it('renders as a dialog with a heading', () => {
    render(<AllOkrsReview objectives={objectives} onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: /review all okrs/i })).toBeInTheDocument()
    expect(screen.getByText(/review all okrs/i)).toBeInTheDocument()
  })

  it('renders a titled review section for every objective passed in', () => {
    render(<AllOkrsReview objectives={objectives} onClose={() => {}} />)
    expect(screen.getByText('Ship MVP')).toBeInTheDocument()
    expect(screen.getByText('Interview 10 users')).toBeInTheDocument()
  })

  it('calls useQuarterReview once per objective id', () => {
    render(<AllOkrsReview objectives={objectives} onClose={() => {}} />)
    expect(mocks.useQuarterReviewMock).toHaveBeenCalledWith('io-1')
    expect(mocks.useQuarterReviewMock).toHaveBeenCalledWith('io-2')
    expect(mocks.useQuarterReviewMock).toHaveBeenCalledTimes(2)
  })

  it("renders each objective's own reflection/comment fields independently editable", () => {
    render(<AllOkrsReview objectives={objectives} onClose={() => {}} />)
    const reflections = screen.getAllByLabelText(/member's reflection/i)
    expect(reflections).toHaveLength(2)
    fireEvent.change(reflections[0], { target: { value: 'Good quarter for MVP' } })
    fireEvent.change(reflections[1], { target: { value: 'Great interviews' } })
    expect(reflections[0]).toHaveValue('Good quarter for MVP')
    expect(reflections[1]).toHaveValue('Great interviews')
  })

  it('saves each section independently — one save call per objective, scoped to that objective', async () => {
    render(<AllOkrsReview objectives={objectives} onClose={() => {}} />)
    const saveButtons = screen.getAllByRole('button', { name: /^save$/i })
    expect(saveButtons).toHaveLength(2)

    fireEvent.change(screen.getAllByLabelText(/member's reflection/i)[0], { target: { value: 'First objective note' } })
    fireEvent.click(saveButtons[0])

    expect(mocks.save).toHaveBeenCalledTimes(1)
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ memberReflection: 'First objective note' }))
  })

  it('calls onClose when Close is clicked', () => {
    const onClose = vi.fn()
    render(<AllOkrsReview objectives={objectives} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders nothing extra when given an empty objectives list', () => {
    render(<AllOkrsReview objectives={[]} onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: /review all okrs/i })).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: /^save$/i })).toHaveLength(0)
  })
})
