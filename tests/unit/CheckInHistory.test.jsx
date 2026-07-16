import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  useCheckInHistory: vi.fn(),
}))

vi.mock('../../src/hooks/useCheckInHistory', () => ({
  default: mocks.useCheckInHistory,
}))

import CheckInHistory from '../../src/components/CheckInHistory'

describe('CheckInHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
})
