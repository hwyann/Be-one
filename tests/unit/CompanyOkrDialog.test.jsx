import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  coInsert: vi.fn(),
  coSelect: vi.fn(),
  quartersUpdate: vi.fn(),
  quartersUpdateEq: vi.fn(),
  krCreate: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: (table) => {
      if (table === 'company_objectives') {
        return { insert: mocks.coInsert }
      }
      if (table === 'quarters') {
        return { update: mocks.quartersUpdate }
      }
      throw new Error(`unexpected table: ${table}`)
    },
  },
}))

vi.mock('../../src/hooks/useKrMutation', () => ({
  default: () => ({ create: mocks.krCreate, update: vi.fn(), saving: false, error: null }),
}))

import CompanyOkrDialog from '../../src/components/CompanyOkrDialog'

describe('CompanyOkrDialog', () => {
  const onSaved = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.coInsert.mockReturnValue({ select: mocks.coSelect })
    mocks.coSelect.mockResolvedValue({ data: [{ id: 'new-co-1', title: 'Grow revenue' }], error: null })
    mocks.quartersUpdate.mockReturnValue({ eq: mocks.quartersUpdateEq })
    mocks.quartersUpdateEq.mockResolvedValue({ error: null })
    mocks.krCreate.mockResolvedValue(true)
  })

  async function addDraftKr() {
    fireEvent.click(screen.getByRole('button', { name: /add key result/i }))
    fireEvent.change(screen.getByLabelText(/key result/i), { target: { value: 'Sign 5 enterprise deals' } })
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
  }

  it('renders as a dialog with a heading, quarter name (pre-filled), title/category fields, and a close (x) button', () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /set company okr/i })).toBeInTheDocument()
    expect(screen.getByText(/^set company okr$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quarter name/i)).toHaveValue('Q3 2026')
    expect(screen.getByLabelText(/^objective$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument()
  })

  it('calls onClose when the close (x) button is clicked', () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('blocks save when the quarter name is cleared', async () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/quarter name/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/quarter name is required/i)
    expect(mocks.coInsert).not.toHaveBeenCalled()
  })

  it('blocks save when the objective has no title', async () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/needs a title/i)
    expect(mocks.coInsert).not.toHaveBeenCalled()
  })

  it('blocks save when the objective has no key results', async () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least one key result/i)
    expect(mocks.coInsert).not.toHaveBeenCalled()
  })

  it('inserts the company objective with quarter_id, title, category, and a not_started status', async () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Growth' } })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() =>
      expect(mocks.coInsert).toHaveBeenCalledWith([
        { quarter_id: 'q1', title: 'Grow revenue', category: 'Growth', status: 'not_started' },
      ])
    )
  })

  it('creates each key result against the new company objective via useKrMutation', async () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() =>
      expect(mocks.krCreate).toHaveBeenCalledWith({
        objectiveId: 'new-co-1',
        title: 'Sign 5 enterprise deals',
        targetNote: '',
      })
    )
  })

  it('calls onSaved with the saved objectives after a successful save', async () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith([{ id: 'new-co-1', title: 'Grow revenue' }]))
  })

  it('adds a second objective section via "+ Add another objective", each saved independently', async () => {
    mocks.coSelect
      .mockResolvedValueOnce({ data: [{ id: 'new-co-1', title: 'Grow revenue' }], error: null })
      .mockResolvedValueOnce({ data: [{ id: 'new-co-2', title: 'Improve retention' }], error: null })
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)

    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    await addDraftKr()

    fireEvent.click(screen.getByRole('button', { name: /add another objective/i }))
    const titleInputs = screen.getAllByLabelText(/^objective$/i)
    expect(titleInputs).toHaveLength(2)
    fireEvent.change(titleInputs[1], { target: { value: 'Improve retention' } })
    fireEvent.click(screen.getAllByRole('button', { name: /add key result/i })[1])
    fireEvent.change(screen.getAllByLabelText(/key result/i)[0], { target: { value: 'Cut churn 10%' } })
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }))

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(mocks.coInsert).toHaveBeenCalledTimes(2))
    expect(onSaved).toHaveBeenCalledWith([
      { id: 'new-co-1', title: 'Grow revenue' },
      { id: 'new-co-2', title: 'Improve retention' },
    ])
  })

  it('shows a Remove control on any objective section after the first', () => {
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /add another objective/i }))
    expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument()
  })

  it('shows an error and stops when the company_objectives insert fails', async () => {
    mocks.coSelect.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/db error/i)
    expect(onSaved).not.toHaveBeenCalled()
  })

  it('shows an error and stops when a key result fails to save', async () => {
    mocks.krCreate.mockResolvedValueOnce(false)
    render(<CompanyOkrDialog quarterId="q1" quarterName="Q3 2026" onSaved={onSaved} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/key result failed to save/i)
    expect(onSaved).not.toHaveBeenCalled()
  })

  // #B31: "+ New quarter" opens this dialog directly with an auto-suggested
  // name, and the Manager can rename it right here before saving.
  describe('editable quarter name (#B31)', () => {
    it('renames the quarter when the name is changed and Save is clicked', async () => {
      render(<CompanyOkrDialog quarterId="q1" quarterName="Q4 2026" onSaved={onSaved} onClose={onClose} />)
      fireEvent.change(screen.getByLabelText(/quarter name/i), { target: { value: 'Launch Quarter' } })
      fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
      await addDraftKr()
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
      await waitFor(() => expect(mocks.quartersUpdate).toHaveBeenCalledWith({ name: 'Launch Quarter' }))
      expect(mocks.quartersUpdateEq).toHaveBeenCalledWith('id', 'q1')
    })

    it('does not touch the quarters table when the name is left unchanged', async () => {
      render(<CompanyOkrDialog quarterId="q1" quarterName="Q4 2026" onSaved={onSaved} onClose={onClose} />)
      fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
      await addDraftKr()
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
      await waitFor(() => expect(mocks.coInsert).toHaveBeenCalled())
      expect(mocks.quartersUpdate).not.toHaveBeenCalled()
    })

    it('shows an error and stops when the rename fails', async () => {
      mocks.quartersUpdateEq.mockResolvedValue({ error: { message: 'rename failed' } })
      render(<CompanyOkrDialog quarterId="q1" quarterName="Q4 2026" onSaved={onSaved} onClose={onClose} />)
      fireEvent.change(screen.getByLabelText(/quarter name/i), { target: { value: 'Launch Quarter' } })
      fireEvent.change(screen.getByLabelText(/^objective$/i), { target: { value: 'Grow revenue' } })
      await addDraftKr()
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
      expect(await screen.findByRole('alert')).toHaveTextContent(/rename failed/i)
      expect(mocks.coInsert).not.toHaveBeenCalled()
      expect(onSaved).not.toHaveBeenCalled()
    })
  })
})
