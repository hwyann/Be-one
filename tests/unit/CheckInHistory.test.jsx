import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCheckInHistory: vi.fn(),
  useCheckInQuestions: vi.fn(),
}))

vi.mock('../../src/hooks/useCheckInHistory', () => ({
  default: mocks.useCheckInHistory,
}))
vi.mock('../../src/hooks/useCheckInQuestions', () => ({
  default: mocks.useCheckInQuestions,
}))

import CheckInHistory, { SummaryBlock } from '../../src/components/CheckInHistory'

const emptyQuestions = {
  questionsByCheckInId: {},
  loading: false,
  error: null,
  saving: false,
  askQuestion: vi.fn(),
  replyToQuestion: vi.fn(),
}

describe('CheckInHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useCheckInQuestions.mockReturnValue(emptyQuestions)
  })

  it('renders an empty state when there are no check-ins', () => {
    mocks.useCheckInHistory.mockReturnValue({ checkIns: [], loading: false, error: null })
    render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" />)
    expect(screen.getByText(/no check-ins yet/i)).toBeInTheDocument()
  })

  it('renders a check-in with status label, note, and plan_next', () => {
    mocks.useCheckInHistory.mockReturnValue({
      checkIns: [
        { id: 'c1', status: 'on_track', note: 'shipped draft', plan_next: 'wire review', created_at: '2026-07-01T09:00:00Z' },
      ],
      loading: false,
      error: null,
    })
    render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" />)
    expect(screen.getByText(/on track/i)).toBeInTheDocument()
    expect(screen.getByText('shipped draft')).toBeInTheDocument()
    expect(screen.getByText(/wire review/)).toBeInTheDocument()
  })

  it('renders check-ins in the order provided by the hook (chronological)', () => {
    mocks.useCheckInHistory.mockReturnValue({
      checkIns: [
        { id: 'c1', status: 'on_track', note: 'first', plan_next: '', created_at: '2026-07-01T09:00:00Z' },
        { id: 'c2', status: 'at_risk',  note: 'second', plan_next: '', created_at: '2026-07-08T09:00:00Z' },
        { id: 'c3', status: 'behind',   note: 'third',  plan_next: '', created_at: '2026-07-15T09:00:00Z' },
      ],
      loading: false,
      error: null,
    })
    render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" />)
    const entries = screen.getAllByRole('listitem')
    expect(entries).toHaveLength(3)
    expect(entries[0]).toHaveTextContent('first')
    expect(entries[1]).toHaveTextContent('second')
    expect(entries[2]).toHaveTextContent('third')
  })

  it('renders a formatted date for each check-in', () => {
    mocks.useCheckInHistory.mockReturnValue({
      checkIns: [
        { id: 'c1', status: 'on_track', note: 'x', plan_next: '', created_at: '2026-07-01T09:00:00Z' },
      ],
      loading: false,
      error: null,
    })
    render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('renders the error message when the hook returns an error', () => {
    mocks.useCheckInHistory.mockReturnValue({ checkIns: [], loading: false, error: 'DB down' })
    render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" />)
    expect(screen.getByRole('alert')).toHaveTextContent(/DB down/)
  })

  it('passes both the individual objective id and the key result id to useCheckInHistory', () => {
    mocks.useCheckInHistory.mockReturnValue({ checkIns: [], loading: false, error: null })
    render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-42" />)
    expect(mocks.useCheckInHistory).toHaveBeenCalledWith('io-1', 'kr-42')
  })

  describe('per check-in question', () => {
    beforeEach(() => {
      mocks.useCheckInHistory.mockReturnValue({
        checkIns: [
          { id: 'c1', status: 'on_track', note: 'first', plan_next: '', created_at: '2026-07-01T09:00:00Z' },
          { id: 'c2', status: 'at_risk', note: 'second', plan_next: '', created_at: '2026-07-08T09:00:00Z' },
        ],
        loading: false,
        error: null,
      })
    })

    it('passes the check-in ids to useCheckInQuestions', () => {
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" />)
      expect(mocks.useCheckInQuestions).toHaveBeenCalledWith(['c1', 'c2'])
    })

    it('renders an "Ask a question" affordance for each check-in with no question when canAskQuestion is true', () => {
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" canAskQuestion />)
      expect(screen.getAllByRole('button', { name: /ask a question/i })).toHaveLength(2)
    })

    it('shows the existing question (and reply) for a check-in instead of the ask button', () => {
      mocks.useCheckInQuestions.mockReturnValue({
        ...emptyQuestions,
        questionsByCheckInId: {
          c1: { id: 'q1', question_text: 'What blocked this?', reply_text: 'Waiting on design.' },
        },
      })
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" canAskQuestion />)
      expect(screen.getAllByRole('button', { name: /ask a question/i })).toHaveLength(1)
      expect(screen.getByText('What blocked this?')).toBeInTheDocument()
      expect(screen.getByText('Waiting on design.')).toBeInTheDocument()
    })

    it('calls askQuestion with the check-in id and question text when sent', () => {
      const askQuestion = vi.fn()
      mocks.useCheckInQuestions.mockReturnValue({ ...emptyQuestions, askQuestion })
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" canAskQuestion />)
      const askButtons = screen.getAllByRole('button', { name: /ask a question/i })
      fireEvent.click(askButtons[0])
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'What blocked this?' } })
      fireEvent.click(screen.getByRole('button', { name: /send/i }))
      expect(askQuestion).toHaveBeenCalledWith('c1', 'What blocked this?')
    })

    it('calls replyToQuestion with the question id and reply text when sent', () => {
      const replyToQuestion = vi.fn()
      mocks.useCheckInQuestions.mockReturnValue({
        ...emptyQuestions,
        replyToQuestion,
        questionsByCheckInId: {
          c1: { id: 'q1', question_text: 'What blocked this?', reply_text: null },
        },
      })
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" canAskQuestion={false} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Waiting on design.' } })
      fireEvent.click(screen.getByRole('button', { name: /reply/i }))
      expect(replyToQuestion).toHaveBeenCalledWith('q1', 'Waiting on design.')
    })
  })

  describe('canAskQuestion gates only asking, never an existing reply (Manager-only "ask")', () => {
    beforeEach(() => {
      mocks.useCheckInHistory.mockReturnValue({
        checkIns: [
          { id: 'c1', status: 'on_track', note: 'first', plan_next: '', created_at: '2026-07-01T09:00:00Z' },
        ],
        loading: false,
        error: null,
      })
    })

    it('shows the "Ask a question" trigger when canAskQuestion is true (Manager mode)', () => {
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" canAskQuestion />)
      expect(screen.getByRole('button', { name: /ask a question/i })).toBeInTheDocument()
    })

    it('hides the "Ask a question" trigger when canAskQuestion is false (Member mode)', () => {
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" canAskQuestion={false} />)
      expect(screen.queryByRole('button', { name: /ask a question/i })).not.toBeInTheDocument()
    })

    it('still shows an existing question and its reply-affordance when canAskQuestion is false', () => {
      mocks.useCheckInQuestions.mockReturnValue({
        ...emptyQuestions,
        questionsByCheckInId: {
          c1: { id: 'q1', question_text: 'What blocked this?', reply_text: null },
        },
      })
      render(<CheckInHistory individualObjectiveId="io-1" keyResultId="kr-1" canAskQuestion={false} />)
      expect(screen.getByText('What blocked this?')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument()
    })
  })
})

// SummaryBlock is rendered separately from CheckInHistory now — KrListInline
// (KrRow) puts it above the Check-in button, ahead of the history list
// below (#B25) — so it's tested directly here rather than through
// CheckInHistory's own props.
describe('SummaryBlock', () => {
  it('renders the summary text when status is ready', () => {
    render(<SummaryBlock status="ready" summary="Improving trajectory; shipping steadily." />)
    const summary = screen.getByRole('note', { name: /summary/i })
    expect(summary).toHaveTextContent('Improving trajectory; shipping steadily.')
  })

  it('renders "Not enough check-ins yet." when status is insufficient_data', () => {
    render(<SummaryBlock status="insufficient_data" />)
    expect(screen.getByText(/not enough check-ins yet/i)).toBeInTheDocument()
  })

  it('renders "Generating summary…" placeholder when status is loading', () => {
    render(<SummaryBlock status="loading" />)
    expect(screen.getByText(/generating summary/i)).toBeInTheDocument()
  })

  it('renders "Summary unavailable" when status is error', () => {
    render(<SummaryBlock status="error" />)
    expect(screen.getByText(/summary unavailable/i)).toBeInTheDocument()
  })

  it('renders nothing when status is not provided (null)', () => {
    render(<SummaryBlock status={null} />)
    expect(screen.queryByText(/not enough check-ins yet/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/generating summary/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/summary unavailable/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('note', { name: /summary/i })).not.toBeInTheDocument()
  })
})
