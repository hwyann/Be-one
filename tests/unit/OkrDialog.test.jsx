import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: mocks.insert,
      update: mocks.update,
    }),
  },
}))

import OkrDialog from '../../src/components/OkrDialog'

describe('OkrDialog', () => {
  const onSave = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.insert.mockResolvedValue({ data: null, error: null })
    mocks.update.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockResolvedValue({ data: null, error: null })
  })

  it('renders title input and Save/Cancel buttons', () => {
    render(<OkrDialog onSave={onSave} onClose={onClose} />)
    expect(screen.getByLabelText(/objective/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('pre-fills title when editing an existing objective', () => {
    const objective = { id: 'obj-1', title: 'Ship MVP' }
    render(<OkrDialog objective={objective} onSave={onSave} onClose={onClose} />)
    expect(screen.getByLabelText(/objective/i)).toHaveValue('Ship MVP')
  })

  it('inserts new objective to supabase on save', async () => {
    mocks.insert.mockResolvedValue({ data: [{ id: 'new-1', title: 'Grow revenue' }], error: null })
    render(<OkrDialog onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mocks.insert).toHaveBeenCalledWith([{ title: 'Grow revenue' }])
    )
  })

  it('calls onSave with the saved objective after insert', async () => {
    const saved = { id: 'new-1', title: 'Grow revenue' }
    mocks.insert.mockResolvedValue({ data: [saved], error: null })
    render(<OkrDialog onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(saved))
  })

  it('updates existing objective in supabase on save', async () => {
    mocks.eq.mockResolvedValue({ data: [{ id: 'obj-1', title: 'Ship MVP v2' }], error: null })
    const objective = { id: 'obj-1', title: 'Ship MVP' }
    render(<OkrDialog objective={objective} onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Ship MVP v2' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({ title: 'Ship MVP v2' })
    )
    expect(mocks.eq).toHaveBeenCalledWith('id', 'obj-1')
  })

  it('calls onSave with the updated objective after update', async () => {
    const updated = { id: 'obj-1', title: 'Ship MVP v2' }
    mocks.eq.mockResolvedValue({ data: [updated], error: null })
    const objective = { id: 'obj-1', title: 'Ship MVP' }
    render(<OkrDialog objective={objective} onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Ship MVP v2' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(updated))
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<OkrDialog onSave={onSave} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not submit when title is empty', async () => {
    render(<OkrDialog onSave={onSave} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mocks.insert).not.toHaveBeenCalled())
    expect(onSave).not.toHaveBeenCalled()
  })

  it('shows error message on supabase failure', async () => {
    mocks.insert.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    render(<OkrDialog onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/DB error/i)
    expect(onSave).not.toHaveBeenCalled()
  })
})
