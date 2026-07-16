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

  it('calls onSaved after a successful save', async () => {
    const onSaved = vi.fn()
    render(<CheckInPanel individualObjectiveId="io-1" onSaved={onSaved} onDone={() => {}} />)

    fireEvent.click(screen.getByRole('radio', { name: /on track/i }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1))
  })

  it('does not call onSaved when the save fails', async () => {
    mocks.save.mockResolvedValueOnce(false)
    const onSaved = vi.fn()
    render(<CheckInPanel individualObjectiveId="io-1" onSaved={onSaved} onDone={() => {}} />)

    fireEvent.click(screen.getByRole('radio', { name: /on track/i }))
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(mocks.save).toHaveBeenCalled())
    expect(onSaved).not.toHaveBeenCalled()
  })

  it('calls onDone without saving or firing onSaved when Cancel is clicked', () => {
    const onDone = vi.fn()
    const onSaved = vi.fn()
    render(<CheckInPanel individualObjectiveId="io-1" onSaved={onSaved} onDone={onDone} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mocks.save).not.toHaveBeenCalled()
    expect(onSaved).not.toHaveBeenCalled()
    expect(onDone).toHaveBeenCalled()
  })

  it('Save button uses the coral action styling, not the undefined --accent-strong token', () => {
    render(<CheckInPanel individualObjectiveId="io-1" onDone={() => {}} />)
    const saveBtn = screen.getByRole('button', { name: /save/i })
    expect(saveBtn.style.background).toBe('var(--coral-700)')
    expect(saveBtn.style.color).toBe('var(--surface)')
  })
})
