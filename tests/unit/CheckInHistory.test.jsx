import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCheckInHistory: vi.fn(),
  useKrSummary: vi.fn(),
}))

vi.mock('../../src/hooks/useCheckInHistory', () => ({
  default: mocks.useCheckInHistory,
}))
vi.mock('../../src/hooks/useKrSummary', () => ({
  default: mocks.useKrSummary,
}))

import CheckInHistory from '../../src/components/CheckInHistory'

const emptySummary = { summary: null, loading: false, error: null, status: null }

describe('CheckInHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useKrSummary.mockReturnValue(emptySummary)
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
})
