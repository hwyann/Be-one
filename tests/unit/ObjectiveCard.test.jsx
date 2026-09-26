import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  krCreate: vi.fn(),
  krUpdate: vi.fn(),
  rationaleRefetch: vi.fn(),
  useRationaleMock: vi.fn(),
  useQuarterReviewMock: vi.fn(),
  quarterReviewSave: vi.fn(),
}))

vi.mock('../../src/hooks/useCheckIns', () => ({
  default: () => ({ save: vi.fn().mockResolvedValue(true), saving: false, error: null }),
}))

vi.mock('../../src/hooks/useCheckInHistory', () => ({
  default: () => ({ checkIns: [], loading: false, error: null }),
}))

vi.mock('../../src/hooks/useCompanyObjectiveStatus', () => ({
  default: () => ({ update: mocks.update, saving: false, error: null }),
}))

vi.mock('../../src/hooks/useKrMutation', () => ({
  default: () => ({
    create: mocks.krCreate,
    update: mocks.krUpdate,
    saving: false,
    error: null,
  }),
}))

vi.mock('../../src/hooks/useRationale', () => ({
  default: (...args) => mocks.useRationaleMock(...args),
}))

vi.mock('../../src/hooks/useQuarterReview', () => ({
  default: (...args) => mocks.useQuarterReviewMock(...args),
}))

import ObjectiveCard from '../../src/components/ObjectiveCard'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.update.mockResolvedValue(true)
  mocks.krCreate.mockResolvedValue(true)
  mocks.krUpdate.mockResolvedValue(true)
  mocks.useRationaleMock.mockReturnValue({
    rationale: [],
    loading: false,
    error: null,
    saving: false,
    save: vi.fn(),
    refetch: mocks.rationaleRefetch,
  })
  mocks.quarterReviewSave.mockResolvedValue(true)
  mocks.useQuarterReviewMock.mockReturnValue({
    review: null,
    loading: false,
    error: null,
    saving: false,
    save: mocks.quarterReviewSave,
    refetch: vi.fn(),
  })
})

describe('ObjectiveCard', () => {
  // A company objective, as rendered on the Map: no individualObjectiveId.
  const objective = {
    id: '1',
    category: 'Growth',
    title: 'Expand into new markets',
    status: 'on_track',
  }

  it('renders the category kicker in uppercase', () => {
    render(<ObjectiveCard objective={objective} />)
    expect(screen.getByText('GROWTH')).toBeInTheDocument()
  })

  it('renders the objective title', () => {
    render(<ObjectiveCard objective={objective} />)
    expect(screen.getByText('Expand into new markets')).toBeInTheDocument()
  })

  it('renders a row for each key result', () => {
    const withKrs = {
      ...objective,
      key_results: [
        { id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] },
        { id: 'k2', title: 'Launch APAC channel', individual_objectives: [] },
      ],
    }
    render(<ObjectiveCard objective={withKrs} />)
    expect(screen.getByText('Reach 100 accounts')).toBeInTheDocument()
    expect(screen.getByText('Launch APAC channel')).toBeInTheDocument()
  })

  it('renders initials for each linked owner', () => {
    const withOwners = {
      ...objective,
      key_results: [{
        id: 'k1',
        title: 'Reach 100 accounts',
        individual_objectives: [
          { owner_name: 'Satoshi Kimura' },
          { owner_name: 'Hiroshi Tanaka' },
        ],
      }],
    }
    render(<ObjectiveCard objective={withOwners} />)
    expect(screen.getByText('SK')).toBeInTheDocument()
    expect(screen.getByText('HT')).toBeInTheDocument()
  })

  it('collapses owners beyond three into a +N pill', () => {
    const many = {
      ...objective,
      key_results: [{
        id: 'k1',
        title: 'Reach 100 accounts',
        individual_objectives: [
          { owner_name: 'Alice Adams' },
          { owner_name: 'Bob Brown' },
          { owner_name: 'Carol Chan' },
          { owner_name: 'Dan Doe' },
        ],
      }],
    }
    render(<ObjectiveCard objective={many} />)
    expect(screen.getByText('AA')).toBeInTheDocument()
    expect(screen.getByText('BB')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.queryByText('CC')).not.toBeInTheDocument()
    expect(screen.queryByText('DD')).not.toBeInTheDocument()
  })

  it('skips owners without an owner_name', () => {
    const nulls = {
      ...objective,
      key_results: [{
        id: 'k1',
        title: 'Reach 100 accounts',
        individual_objectives: [
          { owner_name: 'Satoshi Kimura' },
          { owner_name: null },
        ],
      }],
    }
    render(<ObjectiveCard objective={nulls} />)
    expect(screen.getByText('SK')).toBeInTheDocument()
    expect(screen.getByText('Reach 100 accounts')).toBeInTheDocument()
  })

  const withLinkedIO = {
    ...objective,
    key_results: [{
      id: 'k1',
      title: 'Reach 100 accounts',
      individual_objectives: [
        { id: 'io-1', owner_name: 'Satoshi Kimura' },
      ],
    }],
  }

  describe('read-only Map surface (#B12)', () => {
    it('does not render a clickable status dot for a company objective', () => {
      render(<ObjectiveCard objective={objective} />)
      expect(screen.queryByRole('button', { name: /on track/i })).not.toBeInTheDocument()
    })

    it('does not render a clickable status dot for any status value', () => {
      for (const status of ['at_risk', 'behind', 'not_started']) {
        render(<ObjectiveCard objective={{ ...objective, status }} />)
      }
      expect(screen.queryAllByRole('button', { name: /at risk|behind|not started/i })).toHaveLength(0)
    })

    it('never opens a status editor for a company objective (no status editor in the document)', () => {
      render(<ObjectiveCard objective={objective} />)
      expect(screen.queryByRole('group', { name: /set status/i })).not.toBeInTheDocument()
    })

    it('does not render an Edit button on a company KR row', () => {
      const withKrs = {
        ...objective,
        key_results: [
          { id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] },
        ],
      }
      render(<ObjectiveCard objective={withKrs} />)
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })

    it('does not render a "+ Add key result" button for a company objective', () => {
      render(<ObjectiveCard objective={objective} />)
      expect(screen.queryByRole('button', { name: /add key result/i })).not.toBeInTheDocument()
    })

    it('still renders the avatar cluster for a company KR row with a directly-linked individual objective', () => {
      render(<ObjectiveCard objective={withLinkedIO} />)
      expect(screen.getByText('SK')).toBeInTheDocument()
    })

    it('does not render a Check-in trigger on the Map even when a company KR has a directly-linked individual objective', () => {
      render(<ObjectiveCard objective={withLinkedIO} />)
      expect(screen.queryByRole('button', { name: /check in/i })).not.toBeInTheDocument()
    })

    it('does not render a History trigger on the Map even when a company KR has a directly-linked individual objective', () => {
      render(<ObjectiveCard objective={withLinkedIO} />)
      expect(screen.queryByRole('button', { name: /history/i })).not.toBeInTheDocument()
    })

    it('displays a KR target note beneath the KR text even in read-only mode', () => {
      const withKrs = {
        ...objective,
        key_results: [
          { id: 'k1', title: 'Reach 100 accounts', target_note: 'stretch: 200', individual_objectives: [] },
        ],
      }
      render(<ObjectiveCard objective={withKrs} />)
      expect(screen.getByText(/stretch: 200/)).toBeInTheDocument()
    })
  })

  describe('individual-objective status editor (unchanged by #B12)', () => {
    const individualObjective = { id: 'io-9', title: 'Ship MVP', status: 'on_track' }

    it('renders a clickable on_track status dot when the card represents an individual objective', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      expect(screen.getByRole('button', { name: /on track/i })).toBeInTheDocument()
    })

    it('opens the status editor when the status dot is clicked', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      expect(screen.queryByRole('group', { name: /set status/i })).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /on track/i }))
      expect(screen.getByRole('group', { name: /set status/i })).toBeInTheDocument()
    })

    it('renders the three traffic-light options in the status editor', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /on track/i }))
      const group = screen.getByRole('group', { name: /set status/i })
      expect(within(group).getByRole('radio', { name: /on track/i })).toBeInTheDocument()
      expect(within(group).getByRole('radio', { name: /at risk/i })).toBeInTheDocument()
      expect(within(group).getByRole('radio', { name: /behind/i })).toBeInTheDocument()
    })

    it('saves the picked status via useCompanyObjectiveStatus.update and closes the editor', async () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /on track/i }))
      const group = screen.getByRole('group', { name: /set status/i })
      fireEvent.click(within(group).getByRole('radio', { name: /at risk/i }))
      fireEvent.click(within(group).getByRole('button', { name: /save/i }))

      await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ id: 'io-9', status: 'at_risk' }))
      await waitFor(() =>
        expect(screen.queryByRole('group', { name: /set status/i })).not.toBeInTheDocument()
      )
    })

    it('calls onStatusSaved after a successful save', async () => {
      const onStatusSaved = vi.fn()
      render(
        <ObjectiveCard
          objective={individualObjective}
          individualObjectiveId="io-9"
          onStatusSaved={onStatusSaved}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /on track/i }))
      const group = screen.getByRole('group', { name: /set status/i })
      fireEvent.click(within(group).getByRole('radio', { name: /behind/i }))
      fireEvent.click(within(group).getByRole('button', { name: /save/i }))
      await waitFor(() => expect(onStatusSaved).toHaveBeenCalledTimes(1))
    })

    it('does not call onStatusSaved or close when the save fails', async () => {
      mocks.update.mockResolvedValueOnce(false)
      const onStatusSaved = vi.fn()
      render(
        <ObjectiveCard
          objective={individualObjective}
          individualObjectiveId="io-9"
          onStatusSaved={onStatusSaved}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /on track/i }))
      const group = screen.getByRole('group', { name: /set status/i })
      fireEvent.click(within(group).getByRole('radio', { name: /at risk/i }))
      fireEvent.click(within(group).getByRole('button', { name: /save/i }))
      await waitFor(() => expect(mocks.update).toHaveBeenCalled())
      expect(onStatusSaved).not.toHaveBeenCalled()
      expect(screen.getByRole('group', { name: /set status/i })).toBeInTheDocument()
    })

    it('closes the editor when Cancel is clicked and does not call update', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /on track/i }))
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(mocks.update).not.toHaveBeenCalled()
      expect(screen.queryByRole('group', { name: /set status/i })).not.toBeInTheDocument()
    })
  })

  describe('key result management on a company objective (read-only, #B12)', () => {
    it('does not render an Add KR affordance', () => {
      render(<ObjectiveCard objective={objective} />)
      expect(screen.queryByRole('button', { name: /add key result/i })).not.toBeInTheDocument()
    })

    it('does not render an Edit trigger on an existing KR row', () => {
      const withKrs = {
        ...objective,
        key_results: [
          { id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] },
        ],
      }
      render(<ObjectiveCard objective={withKrs} />)
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    })
  })

  describe('key result management on an individual objective (unchanged by #B12)', () => {
    it('renders an Add KR affordance', () => {
      const individualObjective = { id: 'io-9', title: 'Ship MVP' }
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      expect(screen.getByRole('button', { name: /add key result/i })).toBeInTheDocument()
    })

    it('opens an Add KR form when the affordance is clicked', () => {
      const individualObjective = { id: 'io-9', title: 'Ship MVP' }
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      expect(screen.queryByLabelText(/key result/i)).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /add key result/i }))
      expect(screen.getByLabelText(/^key result$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/target note/i)).toBeInTheDocument()
    })

    it('creates a KR against the individual objective when saved', async () => {
      const individualObjective = { id: 'io-9', title: 'Ship MVP' }
      const onKrSaved = vi.fn()
      render(
        <ObjectiveCard
          objective={individualObjective}
          individualObjectiveId="io-9"
          onKrSaved={onKrSaved}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /add key result/i }))
      fireEvent.change(screen.getByLabelText(/^key result$/i), { target: { value: 'Draft the brief' } })
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
      await waitFor(() =>
        expect(mocks.krCreate).toHaveBeenCalledWith({
          objectiveId: undefined,
          individualObjectiveId: 'io-9',
          title: 'Draft the brief',
          targetNote: '',
        })
      )
      await waitFor(() => expect(onKrSaved).toHaveBeenCalledTimes(1))
    })

    it('does not save an empty KR title', () => {
      const individualObjective = { id: 'io-9', title: 'Ship MVP' }
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /add key result/i }))
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
      expect(mocks.krCreate).not.toHaveBeenCalled()
    })

    it('closes the Add KR form when Cancel is clicked', () => {
      const individualObjective = { id: 'io-9', title: 'Ship MVP' }
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /add key result/i }))
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(screen.queryByLabelText(/^key result$/i)).not.toBeInTheDocument()
      expect(mocks.krCreate).not.toHaveBeenCalled()
    })

    it('renders an Edit trigger on each existing KR row', () => {
      const individualObjective = {
        id: 'io-9',
        title: 'Ship MVP',
        key_results: [
          { id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] },
        ],
      }
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('opens an Edit form pre-filled with the KR text and target note', () => {
      const individualObjective = {
        id: 'io-9',
        title: 'Ship MVP',
        key_results: [
          { id: 'k1', title: 'Reach 100 accounts', target_note: 'stretch: 200', individual_objectives: [] },
        ],
      }
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /edit/i }))
      expect(screen.getByLabelText(/^key result$/i)).toHaveValue('Reach 100 accounts')
      expect(screen.getByLabelText(/target note/i)).toHaveValue('stretch: 200')
    })

    it('updates the KR text via useKrMutation.update and calls onKrSaved', async () => {
      const individualObjective = {
        id: 'io-9',
        title: 'Ship MVP',
        key_results: [
          { id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] },
        ],
      }
      const onKrSaved = vi.fn()
      render(
        <ObjectiveCard
          objective={individualObjective}
          individualObjectiveId="io-9"
          onKrSaved={onKrSaved}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /edit/i }))
      const input = screen.getByLabelText(/^key result$/i)
      fireEvent.change(input, { target: { value: 'Reach 150 accounts' } })
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
      await waitFor(() =>
        expect(mocks.krUpdate).toHaveBeenCalledWith({
          id: 'k1',
          title: 'Reach 150 accounts',
          targetNote: '',
        })
      )
      await waitFor(() => expect(onKrSaved).toHaveBeenCalledTimes(1))
    })
  })

  describe('check-in mechanism on an individual objective card (unchanged by #B12)', () => {
    const individualWithLinkedIO = {
      id: 'io-9',
      title: 'Ship MVP',
      key_results: [{
        id: 'k1',
        title: 'Reach 100 accounts',
        individual_objectives: [
          { id: 'io-1', owner_name: 'Satoshi Kimura' },
        ],
      }],
    }

    it('renders a check-in trigger on a KR row with a linked individual objective', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument()
    })

    it('expands the check-in panel when the trigger is clicked', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      expect(screen.queryByLabelText(/what changed/i)).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /check in/i }))
      expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument()
    })

    it('closes the panel when Cancel is clicked', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /check in/i }))
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(screen.queryByLabelText(/what changed/i)).not.toBeInTheDocument()
    })

    it('does not render a check-in trigger when the KR has no linked individual objective', () => {
      const noLink = {
        id: 'io-9',
        title: 'Ship MVP',
        key_results: [{ id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] }],
      }
      render(<ObjectiveCard objective={noLink} individualObjectiveId="io-9" />)
      expect(screen.queryByRole('button', { name: /check in/i })).not.toBeInTheDocument()
    })

    it('renders a History trigger on a KR row with a linked individual objective', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument()
    })

    it('does not render a History trigger when the KR has no linked individual objective', () => {
      const noLink = {
        id: 'io-9',
        title: 'Ship MVP',
        key_results: [{ id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] }],
      }
      render(<ObjectiveCard objective={noLink} individualObjectiveId="io-9" />)
      expect(screen.queryByRole('button', { name: /history/i })).not.toBeInTheDocument()
    })

    it('expands the check-in history panel when the History trigger is clicked', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      expect(screen.queryByRole('group', { name: /check-in history/i })).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /history/i }))
      expect(screen.getByRole('group', { name: /check-in history/i })).toBeInTheDocument()
    })

    it('closes the history panel when the History trigger is clicked again', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /history/i }))
      fireEvent.click(screen.getByRole('button', { name: /history/i }))
      expect(screen.queryByRole('group', { name: /check-in history/i })).not.toBeInTheDocument()
    })

    it('swaps from the check-in panel to the history panel when History is clicked', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /check in/i }))
      expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /history/i }))
      expect(screen.queryByLabelText(/what changed/i)).not.toBeInTheDocument()
      expect(screen.getByRole('group', { name: /check-in history/i })).toBeInTheDocument()
    })

    it('swaps from the history panel to the check-in panel when Check in is clicked', () => {
      render(<ObjectiveCard objective={individualWithLinkedIO} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /history/i }))
      expect(screen.getByRole('group', { name: /check-in history/i })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /check in/i }))
      expect(screen.queryByRole('group', { name: /check-in history/i })).not.toBeInTheDocument()
      expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument()
    })
  })

  describe('rationale', () => {
    const rationaleRows = [
      { id: 'r1', question_key: 'outcome_check', answer: 'Clients stop waiting.' },
      { id: 'r2', question_key: 'alignment_check', answer: 'Yes, still worth it.' },
    ]

    it('does not render a "View rationale" toggle when the objective has no saved rationale', () => {
      render(<ObjectiveCard objective={objective} />)
      expect(screen.queryByRole('button', { name: /view rationale/i })).not.toBeInTheDocument()
    })

    it('renders a "View rationale" toggle when the objective has saved rationale', () => {
      mocks.useRationaleMock.mockReturnValue({
        rationale: rationaleRows,
        loading: false,
        error: null,
        saving: false,
        save: vi.fn(),
        refetch: mocks.rationaleRefetch,
      })
      render(<ObjectiveCard objective={objective} />)
      expect(screen.getByRole('button', { name: /view rationale/i })).toBeInTheDocument()
    })

    it('hides the rationale content by default', () => {
      mocks.useRationaleMock.mockReturnValue({
        rationale: rationaleRows,
        loading: false,
        error: null,
        saving: false,
        save: vi.fn(),
        refetch: mocks.rationaleRefetch,
      })
      render(<ObjectiveCard objective={objective} />)
      expect(screen.queryByText('Clients stop waiting.')).not.toBeInTheDocument()
      expect(screen.queryByText('Yes, still worth it.')).not.toBeInTheDocument()
    })

    it('shows the rationale question and answer after clicking "View rationale"', () => {
      mocks.useRationaleMock.mockReturnValue({
        rationale: rationaleRows,
        loading: false,
        error: null,
        saving: false,
        save: vi.fn(),
        refetch: mocks.rationaleRefetch,
      })
      render(<ObjectiveCard objective={objective} />)
      fireEvent.click(screen.getByRole('button', { name: /view rationale/i }))
      expect(screen.getByText('Clients stop waiting.')).toBeInTheDocument()
      expect(screen.getByText('Yes, still worth it.')).toBeInTheDocument()
    })

    it('hides the rationale content again when the toggle is clicked a second time', () => {
      mocks.useRationaleMock.mockReturnValue({
        rationale: rationaleRows,
        loading: false,
        error: null,
        saving: false,
        save: vi.fn(),
        refetch: mocks.rationaleRefetch,
      })
      render(<ObjectiveCard objective={objective} />)
      fireEvent.click(screen.getByRole('button', { name: /view rationale/i }))
      expect(screen.getByText('Clients stop waiting.')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /view rationale/i }))
      expect(screen.queryByText('Clients stop waiting.')).not.toBeInTheDocument()
    })

    it('fetches rationale scoped to the objective id', () => {
      render(<ObjectiveCard objective={objective} />)
      expect(mocks.useRationaleMock).toHaveBeenCalledWith('1')
    })
  })

  describe('quarter review', () => {
    const individualObjective = { id: 'io-9', title: 'Ship MVP' }

    it('does not render a Review trigger on a company-objective card', () => {
      render(<ObjectiveCard objective={objective} />)
      expect(screen.queryByRole('button', { name: /^review$/i })).not.toBeInTheDocument()
    })

    it('renders a Review trigger when the card represents an individual objective', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      expect(screen.getByRole('button', { name: /^review$/i })).toBeInTheDocument()
    })

    it('opens the QuarterReviewModal when Review is clicked', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      expect(screen.queryByRole('dialog', { name: /quarter review/i })).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /^review$/i }))
      expect(screen.getByRole('dialog', { name: /quarter review/i })).toBeInTheDocument()
    })

    it('scopes the review to the individual objective id', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /^review$/i }))
      expect(mocks.useQuarterReviewMock).toHaveBeenCalledWith('io-9')
    })

    it('closes the modal when its Close button is clicked', () => {
      render(<ObjectiveCard objective={individualObjective} individualObjectiveId="io-9" />)
      fireEvent.click(screen.getByRole('button', { name: /^review$/i }))
      fireEvent.click(screen.getByRole('button', { name: /close/i }))
      expect(screen.queryByRole('dialog', { name: /quarter review/i })).not.toBeInTheDocument()
    })
  })
})
