import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
}))

vi.mock('../../src/hooks/useCheckIns', () => ({
  default: () => ({ save: mocks.save, saving: false, error: null }),
}))

import CheckInPanel from '../../src/components/CheckInPanel'

describe('CheckInPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.save.mockResolvedValue(true)
  })

  it('renders the three traffic-light status options', () => {
    render(<CheckInPanel individualObjectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByRole('radio', { name: /on track/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /at risk/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /behind/i })).toBeInTheDocument()
  })

  it('renders a note input', () => {
    render(<CheckInPanel individualObjectiveId="io-1" onDone={() => {}} />)
    expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument()
  })

  it('disables Save until a status is selected', () => {
    render(<CheckInPanel individualObjectiveId="io-1" onDone={() => {}} />)
    const saveBtn = screen.getByRole('button', { name: /save/i })
    expect(saveBtn).toBeDisabled()

    fireEvent.click(screen.getByRole('radio', { name: /on track/i }))
    expect(saveBtn).toBeEnabled()
  })

  it('saves the check-in with the selected status and note, then calls onDone', async () => {
    const onDone = vi.fn()
    render(<CheckInPanel individualObjectiveId="io-1" onDone={onDone} />)

    fireEvent.click(screen.getByRole('radio', { name: /at risk/i }))
    fireEvent.change(screen.getByLabelText(/what changed/i), {
      target: { value: 'stuck on review' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(mocks.save).toHaveBeenCalled())
    expect(mocks.save).toHaveBeenCalledWith({
      individualObjectiveId: 'io-1',
      status: 'at_risk',
      note: 'stuck on review',
    })
    await waitFor(() => expect(onDone).toHaveBeenCalled())
  })

  it('calls onDone without saving when Cancel is clicked', () => {
    const onDone = vi.fn()
    render(<CheckInPanel individualObjectiveId="io-1" onDone={onDone} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mocks.save).not.toHaveBeenCalled()
    expect(onDone).toHaveBeenCalled()
  })
})
