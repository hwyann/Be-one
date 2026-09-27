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
  rationaleSave: vi.fn(),
  krInsert: vi.fn(),
  krUpdate: vi.fn(),
  krUpdateEq: vi.fn(),
  objectiveCardProps: vi.fn(),
}))

vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: (table) => {
      if (table === 'key_results') {
        return { insert: mocks.krInsert, update: mocks.krUpdate }
      }
      return {
        insert: mocks.insert,
        update: mocks.update,
      }
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { status: 'insufficient_data' }, error: null }),
    },
  },
}))

vi.mock('../../src/hooks/useRationale', () => ({
  default: () => ({
    rationale: [],
    loading: false,
    error: null,
    saving: false,
    save: mocks.rationaleSave,
    refetch: vi.fn(),
  }),
}))

// Wraps the real ObjectiveCard so most tests exercise its actual rendering
// (readOnly/Add-KR/Edit affordances etc.) while letting one dedicated test
// below spy on the props OkrDialog passes down to it (viewMode pass-through).
vi.mock('../../src/components/ObjectiveCard', async () => {
  const actual = await vi.importActual('../../src/components/ObjectiveCard')
  return {
    default: (props) => {
      mocks.objectiveCardProps(props)
      return actual.default(props)
    },
  }
})

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
    mocks.rationaleSave.mockResolvedValue(true)
    mocks.krInsert.mockResolvedValue({ error: null })
    mocks.krUpdate.mockReturnValue({ eq: mocks.krUpdateEq })
    mocks.krUpdateEq.mockResolvedValue({ error: null })
  })

  async function addDraftKr(title = 'Ship v1') {
    fireEvent.click(screen.getByRole('button', { name: /add key result/i }))
    fireEvent.change(screen.getByLabelText(/key result/i), { target: { value: title } })
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
  }

  it('renders title input, Save button, and a close (X) button', () => {
    render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
    expect(screen.getByLabelText(/objective/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument()
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
    await addDraftKr()
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

  it('calls onClose when the close (X) button is clicked', () => {
    render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }))
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
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mocks.insert).toHaveBeenCalledWith([
        {
          title: 'Grow revenue',
          quarter_id: 'q1',
          owner_name: 'Satoshi Kimura',
          status: 'draft',
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
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mocks.insert).toHaveBeenCalledWith([
        {
          title: 'Grow revenue',
          quarter_id: 'q1',
          owner_name: 'Satoshi Kimura',
          status: 'draft',
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
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/DB error/i)
    expect(onSave).not.toHaveBeenCalled()
  })

  it('expands the two coaching questions inline in the same dialog when "Coach me" is clicked', () => {
    render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
    expect(screen.queryByText(/これが達成されたら、他の誰か/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /coach me/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/これが達成されたら、他の誰か/)).toBeInTheDocument()
    expect(screen.getByText(/もしこれらのKRが目標の前進につながらなかったとしても/)).toBeInTheDocument()
  })

  it('closes the coach panel without requiring an answer when "Skip coaching" is clicked', () => {
    render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /coach me/i }))
    fireEvent.click(screen.getByRole('button', { name: /skip coaching/i }))
    expect(screen.queryByText(/これが達成されたら、他の誰か/)).not.toBeInTheDocument()
  })

  it('proceeds with saving normally when the coach panel is open and unanswered', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: /coach me/i }))
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.change(screen.getByLabelText(/aligns with/i), {
      target: { value: 'objective_level:co-1' },
    })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(saved))
  })

  it('persists both coach answers as rationale rows linked to the saved objective', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: /coach me/i }))
    fireEvent.change(screen.getByLabelText(/これが達成されたら、他の誰か/), {
      target: { value: 'Clients stop waiting.' },
    })
    fireEvent.change(screen.getByLabelText(/もしこれらのKRが目標の前進につながらなかったとしても/), {
      target: { value: 'Yes, still worth it.' },
    })
    fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
    fireEvent.change(screen.getByLabelText(/aligns with/i), {
      target: { value: 'objective_level:co-1' },
    })
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() =>
      expect(mocks.rationaleSave).toHaveBeenCalledWith({
        targetId: 'new-1',
        answers: {
          outcome_check: 'Clients stop waiting.',
          alignment_check: 'Yes, still worth it.',
        },
      })
    )
  })

  it('does not call rationale save when the coach panel was skipped (no answers)', async () => {
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
    await addDraftKr()
    fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(saved))
    expect(mocks.rationaleSave).not.toHaveBeenCalled()
  })

  it('blocks save when creating a new objective with no key results added', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/at least one key result is required/i)
    await waitFor(() => expect(mocks.insert).not.toHaveBeenCalled())
    expect(onSave).not.toHaveBeenCalled()
  })

  it('proceeds with saving once exactly one key result has been added', async () => {
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
    await addDraftKr('Ship v1')
    fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(saved))
    expect(mocks.krInsert).toHaveBeenCalledWith(
      expect.objectContaining({ individual_objective_id: 'new-1', title: 'Ship v1' })
    )
  })

  it('surfaces an error and does not close the dialog when a Key Result write fails', async () => {
    const saved = { id: 'new-1', title: 'Grow revenue' }
    mocks.select.mockResolvedValue({ data: [saved], error: null })
    mocks.krInsert.mockResolvedValue({ error: { message: 'KR insert failed' } })
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
    await addDraftKr('Ship v1')
    fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/key result/i)
    expect(onSave).not.toHaveBeenCalled()
  })

  describe('mandatory empty-state prompt', () => {
    it('hides the close (X) button when mandatory is true', () => {
      render(<OkrDialog quarterId="q1" mandatory onSave={onSave} onClose={onClose} />)
      expect(screen.queryByRole('button', { name: /^close$/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm okr/i })).toBeInTheDocument()
    })

    it('shows the close (X) button by default (mandatory not set)', () => {
      render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
      expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument()
    })

    it('shows a note naming the quarter when mandatory and creating a new objective', () => {
      render(<OkrDialog quarterId="q1" quarterName="Q4 2026" mandatory onSave={onSave} onClose={onClose} />)
      expect(screen.getByText(/set your okr for q4 2026 to continue/i)).toBeInTheDocument()
    })

    it('does not show the mandatory note when editing an existing objective', () => {
      const objective = { id: 'obj-1', title: 'Ship MVP' }
      render(<OkrDialog quarterId="q1" objective={objective} mandatory onSave={onSave} onClose={onClose} />)
      expect(screen.queryByText(/to continue/i)).not.toBeInTheDocument()
    })
  })

  describe('in-flow panel styling (split view, split-view-review-all)', () => {
    // OkrDialog no longer positions itself as a fixed, full-viewport-height
    // drawer — the parent column in OkrMapPage.jsx's my-thread split view now
    // owns width/position, rendering this inline as a sibling of the My
    // Thread list. This fills whatever container it's placed in and scrolls
    // its own contents instead of growing the whole page.
    it('renders the dialog root as a normal in-flow block that fills its container and scrolls internally', () => {
      render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog.style.position).toBe('')
      expect(dialog.style.top).toBe('')
      expect(dialog.style.right).toBe('')
      expect(dialog.style.height).toBe('')
      expect(dialog.style.width).toBe('100%')
      expect(dialog.style.minWidth).toBe('')
      expect(dialog.style.background).toBe('var(--surface)')
      expect(dialog.style.border).toContain('var(--hairline)')
      expect(dialog.style.padding).not.toBe('')
      expect(dialog.style.overflowY).toBe('auto')
      expect(dialog.style.maxHeight).not.toBe('')
    })

    it('styles the title input and Save button to match the app design language', () => {
      render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
      const titleInput = screen.getByLabelText(/objective/i)
      expect(titleInput.style.border).toContain('var(--hairline)')
      expect(titleInput.style.borderRadius).not.toBe('')
      expect(titleInput.style.padding).not.toBe('')

      const saveButton = screen.getByRole('button', { name: /confirm okr/i })
      expect(saveButton.style.borderRadius).not.toBe('')
      expect(saveButton.style.padding).not.toBe('')
      expect(saveButton.style.background).not.toBe('')
    })

    it('gives the close (X) button a real accessible name', () => {
      render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
      expect(screen.getByRole('button', { name: /^close$/i })).toHaveAccessibleName('Close')
    })
  })

  describe('viewMode pass-through to the embedded ObjectiveCard (#B24)', () => {
    // Check-in (and its Manager-only "Ask a question" gating) moved down
    // into per-KR cards inside ObjectiveCard; OkrDialog itself no longer
    // renders any check-in/history triggers, it just has to forward
    // viewMode so ObjectiveCard can compute the gating correctly.
    it('passes viewMode down to the embedded ObjectiveCard', () => {
      render(
        <OkrDialog
          quarterId="q1"
          objective={{ id: 'obj-1', title: 'Ship MVP' }}
          viewMode="manager"
          onSave={onSave}
          onClose={onClose}
        />
      )
      expect(mocks.objectiveCardProps).toHaveBeenCalledWith(
        expect.objectContaining({ viewMode: 'manager' })
      )
    })

    it('does not render any Check-in/History trigger itself (moved to per-KR cards)', () => {
      render(<OkrDialog quarterId="q1" objective={{ id: 'obj-1', title: 'Ship MVP' }} onSave={onSave} onClose={onClose} />)
      expect(screen.queryByRole('button', { name: /^check-in$/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^history$/i })).not.toBeInTheDocument()
    })
  })

  describe('multi-objective creation (full-width "+ Add another objective")', () => {
    function fillDraft(index, { title, link, krTitle }) {
      fireEvent.change(screen.getAllByLabelText(/objective/i)[index], { target: { value: title } })
      fireEvent.change(screen.getAllByLabelText(/aligns with/i)[index], { target: { value: link } })
      fireEvent.click(screen.getAllByRole('button', { name: /add key result/i })[index])
      fireEvent.change(screen.getByLabelText(/key result/i), { target: { value: krTitle } })
      fireEvent.click(screen.getByRole('button', { name: /^add$/i }))
    }

    it('renders a full-width "+ Add another objective" button when creating', () => {
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)
      const addObjective = screen.getByRole('button', { name: /add another objective/i })
      expect(addObjective).toBeInTheDocument()
      expect(addObjective.style.width).toBe('100%')
    })

    it('does not render "+ Add another objective" when editing an existing objective', () => {
      render(<OkrDialog quarterId="q1" objective={{ id: 'obj-1', title: 'Ship MVP' }} onSave={onSave} onClose={onClose} />)
      expect(screen.queryByRole('button', { name: /add another objective/i })).not.toBeInTheDocument()
    })

    it('adds a second objective section with its own Objective and Aligns-with fields', () => {
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /add another objective/i }))
      expect(screen.getAllByLabelText(/objective/i)).toHaveLength(2)
      expect(screen.getAllByLabelText(/aligns with/i)).toHaveLength(2)
    })

    it('shows a Remove button only on additional objective sections, not the first', () => {
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /add another objective/i }))
      expect(screen.getAllByRole('button', { name: /^remove$/i })).toHaveLength(1)
    })

    it('removes the second objective section when its Remove button is clicked', () => {
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /add another objective/i }))
      fireEvent.click(screen.getByRole('button', { name: /^remove$/i }))
      expect(screen.getAllByLabelText(/objective/i)).toHaveLength(1)
      expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument()
    })

    it('creates one individual_objectives row per objective section, each with its own key result', async () => {
      mocks.select
        .mockResolvedValueOnce({ data: [{ id: 'new-1', title: 'Objective A' }], error: null })
        .mockResolvedValueOnce({ data: [{ id: 'new-2', title: 'Objective B' }], error: null })
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)

      fillDraft(0, { title: 'Objective A', link: 'objective_level:co-1', krTitle: 'KR A' })
      fireEvent.click(screen.getByRole('button', { name: /add another objective/i }))
      fillDraft(1, { title: 'Objective B', link: 'objective_level:co-2', krTitle: 'KR B' })

      fireEvent.click(screen.getByRole('button', { name: /confirm okr/i }))

      await waitFor(() => expect(onSave).toHaveBeenCalledWith([
        { id: 'new-1', title: 'Objective A' },
        { id: 'new-2', title: 'Objective B' },
      ]))
      expect(mocks.insert).toHaveBeenNthCalledWith(1, [{
        title: 'Objective A',
        quarter_id: 'q1',
        owner_name: 'Satoshi Kimura',
        status: 'confirmed',
        link_type: 'objective_level',
        linked_company_objective_id: 'co-1',
      }])
      expect(mocks.insert).toHaveBeenNthCalledWith(2, [{
        title: 'Objective B',
        quarter_id: 'q1',
        owner_name: 'Satoshi Kimura',
        status: 'confirmed',
        link_type: 'objective_level',
        linked_company_objective_id: 'co-2',
      }])
      expect(mocks.krInsert).toHaveBeenCalledWith(
        expect.objectContaining({ individual_objective_id: 'new-1', title: 'KR A' })
      )
      expect(mocks.krInsert).toHaveBeenCalledWith(
        expect.objectContaining({ individual_objective_id: 'new-2', title: 'KR B' })
      )
    })

    it('blocks the whole save (no inserts at all) when any objective section is missing a key result', async () => {
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)

      fillDraft(0, { title: 'Objective A', link: 'objective_level:co-1', krTitle: 'KR A' })
      fireEvent.click(screen.getByRole('button', { name: /add another objective/i }))
      fireEvent.change(screen.getAllByLabelText(/objective/i)[1], { target: { value: 'Objective B' } })
      fireEvent.change(screen.getAllByLabelText(/aligns with/i)[1], { target: { value: 'objective_level:co-2' } })
      // Objective B intentionally has no key result added.

      fireEvent.click(screen.getByRole('button', { name: /confirm okr/i }))

      expect(await screen.findByRole('alert')).toHaveTextContent(/at least one key result is required/i)
      expect(mocks.insert).not.toHaveBeenCalled()
      expect(onSave).not.toHaveBeenCalled()
    })
  })

  describe('draft vs confirm status', () => {
    it('inserts with status: "draft" when "Save as draft" is clicked', async () => {
      mocks.select.mockResolvedValue({ data: [{ id: 'new-1', title: 'Grow revenue' }], error: null })
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)
      fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
      fireEvent.change(screen.getByLabelText(/aligns with/i), { target: { value: 'objective_level:co-1' } })
      await addDraftKr()
      fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
      await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith([
        expect.objectContaining({ status: 'draft' }),
      ]))
    })

    it('inserts with status: "confirmed" when "Confirm OKR" is clicked', async () => {
      mocks.select.mockResolvedValue({ data: [{ id: 'new-1', title: 'Grow revenue' }], error: null })
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)
      fireEvent.change(screen.getByLabelText(/objective/i), { target: { value: 'Grow revenue' } })
      fireEvent.change(screen.getByLabelText(/aligns with/i), { target: { value: 'objective_level:co-1' } })
      await addDraftKr()
      fireEvent.click(screen.getByRole('button', { name: /confirm okr/i }))
      await waitFor(() => expect(mocks.insert).toHaveBeenCalledWith([
        expect.objectContaining({ status: 'confirmed' }),
      ]))
    })

    it('labels the confirm button "Confirm OKR for <quarterName>" when quarterName is provided', () => {
      render(<OkrDialog quarterId="q1" quarterName="Q4 2026" onSave={onSave} onClose={onClose} />)
      expect(screen.getByRole('button', { name: /confirm okr for q4 2026/i })).toBeInTheDocument()
    })

    it('falls back to a plain "Confirm OKR" label when quarterName is not provided', () => {
      render(<OkrDialog quarterId="q1" onSave={onSave} onClose={onClose} />)
      expect(screen.getByRole('button', { name: /^confirm okr$/i })).toBeInTheDocument()
    })

    it('does not render draft/confirm buttons when editing an existing objective (keeps the single Save button)', () => {
      render(<OkrDialog quarterId="q1" objective={{ id: 'obj-1', title: 'Ship MVP' }} onSave={onSave} onClose={onClose} />)
      expect(screen.queryByRole('button', { name: /save as draft/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /confirm okr/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    })
  })

  describe('read-only drill-down for a confirmed objective', () => {
    const confirmedObjective = { id: 'obj-1', title: 'Ship MVP', status: 'confirmed' }
    const draftObjective = { id: 'obj-2', title: 'Interview users', status: 'draft' }

    it('renders the title as plain read-only text, not an input', () => {
      render(<OkrDialog quarterId="q1" objective={confirmedObjective} onSave={onSave} onClose={onClose} />)
      expect(screen.queryByLabelText(/objective/i)).not.toBeInTheDocument()
      expect(screen.getAllByText('Ship MVP').length).toBeGreaterThan(0)
    })

    it('still shows an editable title input for a draft objective (not confirmed)', () => {
      render(<OkrDialog quarterId="q1" objective={draftObjective} onSave={onSave} onClose={onClose} />)
      expect(screen.getByLabelText(/objective/i)).toHaveValue('Interview users')
    })

    it('does not render "Coach me" when the objective is confirmed', () => {
      render(<OkrDialog quarterId="q1" objective={confirmedObjective} onSave={onSave} onClose={onClose} />)
      expect(screen.queryByRole('button', { name: /coach me/i })).not.toBeInTheDocument()
    })

    it('passes readOnly to the embedded ObjectiveCard when confirmed (no Add/Edit KR affordances)', () => {
      render(<OkrDialog quarterId="q1" objective={confirmedObjective} onSave={onSave} onClose={onClose} />)
      expect(screen.queryByRole('button', { name: /add key result/i })).not.toBeInTheDocument()
    })

    it('renders no Save/Cancel footer buttons — the header close (X) is the only close affordance', () => {
      render(<OkrDialog quarterId="q1" objective={confirmedObjective} onSave={onSave} onClose={onClose} />)
      expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    })

    it('calls onClose when the close (X) button is clicked', () => {
      render(<OkrDialog quarterId="q1" objective={confirmedObjective} onSave={onSave} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /^close$/i }))
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('reloading existing draft objectives (#B18)', () => {
    const savedDraft = {
      id: 'draft-1',
      title: 'Interview 10 users',
      link_type: 'objective_level',
      linked_company_objective_id: 'co-2',
      key_result_id: null,
      key_results: [{ id: 'kr-existing', title: 'Talk to 10 customers', target_note: 'by Friday' }],
    }

    it('pre-fills a draft’s title, alignment, and existing key results when creating with existingDrafts', () => {
      render(
        <OkrDialog
          quarterId="q1"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      expect(screen.getByLabelText(/objective/i)).toHaveValue('Interview 10 users')
      expect(screen.getByLabelText(/aligns with/i)).toHaveValue('objective_level:co-2')
      expect(screen.getByText('Talk to 10 customers')).toBeInTheDocument()
    })

    it('does not show a Remove control on an already-persisted key result', () => {
      render(
        <OkrDialog
          quarterId="q1"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument()
    })

    it('shows an Edit button on an already-persisted key result instead', () => {
      render(
        <OkrDialog
          quarterId="q1"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
    })

    it('opens an edit form pre-filled with the key result\'s title and target note when Edit is clicked', () => {
      render(
        <OkrDialog
          quarterId="q1"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
      expect(screen.getByLabelText(/key result/i)).toHaveValue('Talk to 10 customers')
      expect(screen.getByLabelText(/target note/i)).toHaveValue('by Friday')
    })

    it('persists the edited key result via useKrMutation.update and reflects it in the list', async () => {
      render(
        <OkrDialog
          quarterId="q1"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
      fireEvent.change(screen.getByLabelText(/key result/i), { target: { value: 'Talk to 20 customers' } })
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => expect(mocks.krUpdate).toHaveBeenCalledWith({
        title: 'Talk to 20 customers',
        target_note: 'by Friday',
      }))
      expect(mocks.krUpdateEq).toHaveBeenCalledWith('id', 'kr-existing')
      expect(screen.getByText('Talk to 20 customers')).toBeInTheDocument()
      expect(screen.queryByText('Talk to 10 customers')).not.toBeInTheDocument()
    })

    it('shows an error and keeps the edit form data unset when the key result update fails', async () => {
      mocks.krUpdateEq.mockResolvedValue({ error: { message: 'update boom' } })
      render(
        <OkrDialog
          quarterId="q1"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }))
      fireEvent.change(screen.getByLabelText(/key result/i), { target: { value: 'Broken update' } })
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

      expect(await screen.findByRole('alert')).toHaveTextContent(/failed to update key result/i)
      expect(screen.getByText('Talk to 10 customers')).toBeInTheDocument()
    })

    it('updates the existing row (not a duplicate insert) when the reloaded draft is confirmed', async () => {
      mocks.select.mockResolvedValue({ data: [{ id: 'draft-1', title: 'Interview 10 users' }], error: null })
      render(
        <OkrDialog
          quarterId="q1"
          quarterName="Q3 2026"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /confirm okr/i }))
      await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({
        title: 'Interview 10 users',
        status: 'confirmed',
        link_type: 'objective_level',
        linked_company_objective_id: 'co-2',
        key_result_id: null,
      }))
      expect(mocks.eq).toHaveBeenCalledWith('id', 'draft-1')
      expect(mocks.insert).not.toHaveBeenCalled()
    })

    it('does not re-create an already-persisted key result on save, but does create a newly-added one', async () => {
      mocks.select.mockResolvedValue({ data: [{ id: 'draft-1', title: 'Interview 10 users' }], error: null })
      render(
        <OkrDialog
          quarterId="q1"
          companyObjectives={companyObjectivesFixture}
          existingDrafts={[savedDraft]}
          onSave={onSave}
          onClose={onClose}
        />
      )
      await addDraftKr('A second KR')
      fireEvent.click(screen.getByRole('button', { name: /save as draft/i }))
      await waitFor(() => expect(onSave).toHaveBeenCalled())
      expect(mocks.krInsert).toHaveBeenCalledTimes(1)
      expect(mocks.krInsert).toHaveBeenCalledWith(
        expect.objectContaining({ individual_objective_id: 'draft-1', title: 'A second KR' })
      )
    })

    it('starts with a single blank draft when there are no existingDrafts', () => {
      render(<OkrDialog quarterId="q1" companyObjectives={companyObjectivesFixture} onSave={onSave} onClose={onClose} />)
      expect(screen.getByLabelText(/objective/i)).toHaveValue('')
    })
  })
})
