import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCheckInHistory: vi.fn(),
  useKrSummary: vi.fn(),
  useCheckInQuestions: vi.fn(),
}))

vi.mock('../../src/hooks/useCheckInHistory', () => ({
  default: mocks.useCheckInHistory,
}))
vi.mock('../../src/hooks/useKrSummary', () => ({
  default: mocks.useKrSummary,
}))
vi.mock('../../src/hooks/useCheckInQuestions', () => ({
  default: mocks.useCheckInQuestions,
}))

import CheckInHistory from '../../src/components/CheckInHistory'

const emptySummary = { summary: null, loading: false, error: null, status: null }
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
    mocks.useKrSummary.mockReturnValue(emptySummary)
    mocks.useCheckInQuestions.mockReturnValue(emptyQuestions)
  })

  it('renders an empty state when there are no check-ins', () => {
    mocks.useCheckInHistory.mockReturnValue({ checkIns: [], loading: false, error: null })
    render(<CheckInHistory individualObjectiveId="io-1" />)
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
    render(<CheckInHistory individualObjectiveId="io-1" />)
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
    render(<CheckInHistory individualObjectiveId="io-1" />)
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
    render(<CheckInHistory individualObjectiveId="io-1" />)
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('renders the error message when the hook returns an error', () => {
    mocks.useCheckInHistory.mockReturnValue({ checkIns: [], loading: false, error: 'DB down' })
    render(<CheckInHistory individualObjectiveId="io-1" />)
    expect(screen.getByRole('alert')).toHaveTextContent(/DB down/)
  })

  it('passes the individual objective id to the hook', () => {
    mocks.useCheckInHistory.mockReturnValue({ checkIns: [], loading: false, error: null })
    render(<CheckInHistory individualObjectiveId="io-42" />)
    expect(mocks.useCheckInHistory).toHaveBeenCalledWith('io-42')
  })

  describe('summary block', () => {
    beforeEach(() => {
      mocks.useCheckInHistory.mockReturnValue({
        checkIns: [
          { id: 'c1', status: 'on_track', note: 'first', plan_next: '', created_at: '2026-07-01T09:00:00Z' },
        ],
        loading: false,
        error: null,
      })
    })

    it('passes the individual objective id to useKrSummary', () => {
      render(<CheckInHistory individualObjectiveId="io-42" />)
      expect(mocks.useKrSummary).toHaveBeenCalledWith('io-42')
    })

    it('renders the summary text above the list when status is ready', () => {
      mocks.useKrSummary.mockReturnValue({
        summary: 'Improving trajectory; shipping steadily.',
        loading: false,
        error: null,
        status: 'ready',
      })
      render(<CheckInHistory individualObjectiveId="io-1" />)
      const summary = screen.getByRole('note', { name: /summary/i })
      expect(summary).toHaveTextContent('Improving trajectory; shipping steadily.')
      const list = screen.getByRole('list')
      expect(summary.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('renders "Not enough check-ins yet." when status is insufficient_data', () => {
      mocks.useKrSummary.mockReturnValue({ summary: null, loading: false, error: null, status: 'insufficient_data' })
      render(<CheckInHistory individualObjectiveId="io-1" />)
      expect(screen.getByText(/not enough check-ins yet/i)).toBeInTheDocument()
    })

    it('renders "Generating summary…" placeholder when status is loading', () => {
      mocks.useKrSummary.mockReturnValue({ summary: null, loading: true, error: null, status: 'loading' })
      render(<CheckInHistory individualObjectiveId="io-1" />)
      expect(screen.getByText(/generating summary/i)).toBeInTheDocument()
    })

    it('renders "Summary unavailable" when status is error, but still shows the list', () => {
      mocks.useKrSummary.mockReturnValue({ summary: null, loading: false, error: 'boom', status: 'error' })
      render(<CheckInHistory individualObjectiveId="io-1" />)
      expect(screen.getByText(/summary unavailable/i)).toBeInTheDocument()
      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('does not render a summary block when status is null (no objective id)', () => {
      mocks.useKrSummary.mockReturnValue(emptySummary)
      render(<CheckInHistory individualObjectiveId="io-1" />)
      expect(screen.queryByText(/summary/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/not enough check-ins yet/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/generating summary/i)).not.toBeInTheDocument()
    })
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
      render(<CheckInHistory individualObjectiveId="io-1" />)
      expect(mocks.useCheckInQuestions).toHaveBeenCalledWith(['c1', 'c2'])
    })

    it('renders an "Ask a question" affordance for each check-in with no question', () => {
      render(<CheckInHistory individualObjectiveId="io-1" />)
      expect(screen.getAllByRole('button', { name: /ask a question/i })).toHaveLength(2)
    })

    it('shows the existing question (and reply) for a check-in instead of the ask button', () => {
      mocks.useCheckInQuestions.mockReturnValue({
        ...emptyQuestions,
        questionsByCheckInId: {
          c1: { id: 'q1', question_text: 'What blocked this?', reply_text: 'Waiting on design.' },
        },
      })
      render(<CheckInHistory individualObjectiveId="io-1" />)
      expect(screen.getAllByRole('button', { name: /ask a question/i })).toHaveLength(1)
      expect(screen.getByText('What blocked this?')).toBeInTheDocument()
      expect(screen.getByText('Waiting on design.')).toBeInTheDocument()
    })

    it('calls askQuestion with the check-in id and question text when sent', () => {
      const askQuestion = vi.fn()
      mocks.useCheckInQuestions.mockReturnValue({ ...emptyQuestions, askQuestion })
      render(<CheckInHistory individualObjectiveId="io-1" />)
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
      render(<CheckInHistory individualObjectiveId="io-1" />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Waiting on design.' } })
      fireEvent.click(screen.getByRole('button', { name: /reply/i }))
      expect(replyToQuestion).toHaveBeenCalledWith('q1', 'Waiting on design.')
    })
  })
})
