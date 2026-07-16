import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const companyObjectivesFixture = [
  {
    id: 'co-1',
    title: 'Expand into new markets',
    key_results: [
      { id: 'kr-1', title: 'Launch in EU' },
      { id: 'kr-2', title: 'Sign 5 enterprise deals' },
    ],
  },
  {
    id: 'co-2',
    title: 'Improve NPS',
    key_results: [{ id: 'kr-3', title: 'Reach NPS 50' }],
  },
]

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
    mocks.insert.mockReturnValue({ select: mocks.select })
    mocks.update.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockReturnValue({ select: mocks.select })
    mocks.select.mockResolvedValue({ data: null, error: null })
  })

  it('renders title input and Save/Cancel buttons', () => {
    render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
    expect(screen.getByLabelText(/objective/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('pre-fills title when editing an existing objective', () => {
    const objective = { id: 'obj-1', title: 'Ship MVP' }
    render(<OkrDialog quarterId="q1" objective={objective} onSave={onSave} onClose={onClose} />)
    expect(screen.getByLabelText(/objective/i)).toHaveValue('Ship MVP')
  })

  it('calls onSave with the saved objective after insert', async () => {
    const saved = { id: 'new-1', title: 'Grow revenue' }
    mocks.select.mockResolvedValue({ data: [saved], error: null })
    render(
      <OkrDialog
        quarterId="q1"
        companyObjectives={companyObjectivesFixture}
        onSave={onSave}
        onClose={onClose}
      />
    )
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.change(screen.getByLabelText(/aligns with/i), {
      target: { value: 'objective_level:co-1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(saved))
  })

  it('blocks add save when no quarterId is available', async () => {
    render(<OkrDialog quarterId={null} onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mocks.insert).not.toHaveBeenCalled())
    expect(onSave).not.toHaveBeenCalled()
  })

  it('updates existing objective in supabase on save (no quarter_id needed)', async () => {
    mocks.select.mockResolvedValue({ data: [{ id: 'obj-1', title: 'Ship MVP v2' }], error: null })
    const objective = { id: 'obj-1', title: 'Ship MVP' }
    render(<OkrDialog quarterId="q1" objective={objective} onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Ship MVP v2' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({ title: 'Ship MVP v2' })
    )
    expect(mocks.eq).toHaveBeenCalledWith('id', 'obj-1')
  })

  it('allows editing an existing objective even when quarterId is null', async () => {
    mocks.select.mockResolvedValue({ data: [{ id: 'obj-1', title: 'Ship MVP v2' }], error: null })
    const objective = { id: 'obj-1', title: 'Ship MVP' }
    render(<OkrDialog quarterId={null} objective={objective} onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Ship MVP v2' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mocks.update).toHaveBeenCalled())
  })

  it('calls onSave with the updated objective after update', async () => {
    const updated = { id: 'obj-1', title: 'Ship MVP v2' }
    mocks.select.mockResolvedValue({ data: [updated], error: null })
    const objective = { id: 'obj-1', title: 'Ship MVP' }
    render(<OkrDialog quarterId="q1" objective={objective} onSave={onSave} onClose={onClose} />)
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Ship MVP v2' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(updated))
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not submit when title is empty', async () => {
    render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mocks.insert).not.toHaveBeenCalled())
    expect(onSave).not.toHaveBeenCalled()
  })

  it('renders alignment options for each company objective and each KR', () => {
    render(
      <OkrDialog
        quarterId="q1"
        companyObjectives={companyObjectivesFixture}
        onSave={onSave}
        onClose={onClose}
      />
    )
    const linkSelect = screen.getByLabelText(/aligns with/i)
    expect(linkSelect).toBeInTheDocument()
    expect(
      within(linkSelect).getByRole('option', { name: /Expand into new markets \(objective\)/i })
    ).toBeInTheDocument()
    expect(
      within(linkSelect).getByRole('option', { name: /Improve NPS \(objective\)/i })
    ).toBeInTheDocument()
    expect(within(linkSelect).getByRole('option', { name: /Launch in EU/ })).toBeInTheDocument()
    expect(
      within(linkSelect).getByRole('option', { name: /Sign 5 enterprise deals/ })
    ).toBeInTheDocument()
    expect(within(linkSelect).getByRole('option', { name: /Reach NPS 50/ })).toBeInTheDocument()
  })

  it('blocks add save when no company objective link is selected', async () => {
    render(
      <OkrDialog
        quarterId="q1"
        companyObjectives={companyObjectivesFixture}
        onSave={onSave}
        onClose={onClose}
      />
    )
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/company objective link is required/i)
    await waitFor(() => expect(mocks.insert).not.toHaveBeenCalled())
    expect(onSave).not.toHaveBeenCalled()
  })

  it('inserts with link_type "direct_kr" and linked_company_objective_id when a KR is selected', async () => {
    mocks.select.mockResolvedValue({ data: [{ id: 'new-1', title: 'Grow revenue' }], error: null })
    render(
      <OkrDialog
        quarterId="q1"
        companyObjectives={companyObjectivesFixture}
        onSave={onSave}
        onClose={onClose}
      />
    )
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.change(screen.getByLabelText(/aligns with/i), {
      target: { value: 'direct_kr:kr-2:co-1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mocks.insert).toHaveBeenCalledWith([
        {
          title: 'Grow revenue',
          quarter_id: 'q1',
          link_type: 'direct_kr',
          linked_company_objective_id: 'co-1',
          key_result_id: 'kr-2',
        },
      ])
    )
  })

  it('inserts with link_type "objective_level" when an objective is selected', async () => {
    mocks.select.mockResolvedValue({ data: [{ id: 'new-1', title: 'Grow revenue' }], error: null })
    render(
      <OkrDialog
        quarterId="q1"
        companyObjectives={companyObjectivesFixture}
        onSave={onSave}
        onClose={onClose}
      />
    )
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.change(screen.getByLabelText(/aligns with/i), {
      target: { value: 'objective_level:co-2' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mocks.insert).toHaveBeenCalledWith([
        {
          title: 'Grow revenue',
          quarter_id: 'q1',
          link_type: 'objective_level',
          linked_company_objective_id: 'co-2',
        },
      ])
    )
  })

  it('shows error message on supabase failure', async () => {
    mocks.select.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    render(
      <OkrDialog
        quarterId="q1"
        companyObjectives={companyObjectivesFixture}
        onSave={onSave}
        onClose={onClose}
      />
    )
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.change(screen.getByLabelText(/aligns with/i), {
      target: { value: 'objective_level:co-1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/DB error/i)
    expect(onSave).not.toHaveBeenCalled()
  })
})
