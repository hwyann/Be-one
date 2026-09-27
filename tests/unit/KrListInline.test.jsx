import { render, screen, fireEvent, act } from '@testing-library/react'
import { useEffect } from 'react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  krCreate: vi.fn(),
  krUpdate: vi.fn(),
  checkInHistoryProps: vi.fn(),
  checkInHistoryMounts: vi.fn(),
  summaryBlockProps: vi.fn(),
  checkInPanelProps: vi.fn(),
  useKrSummaryMock: vi.fn(),
}))

vi.mock('../../src/hooks/useKrMutation', () => ({
  default: () => ({ create: mocks.krCreate, update: mocks.krUpdate, saving: false, error: null }),
}))

vi.mock('../../src/hooks/useKrSummary', () => ({
  default: (...args) => mocks.useKrSummaryMock(...args),
}))

// KrListInline's own responsibility is prop-threading (individualObjectiveId,
// keyResultId, viewMode -> canAskQuestion, allowCheckIn vs readOnly) and
// layout order (summary, then Check-in trigger/form, then history — #B25) —
// the actual rendering of the summary/history and the entry form is already
// covered by CheckInHistory.test.jsx and CheckInPanel.test.jsx, so those are
// mocked here to keep this file focused on what KrListInline itself is
// responsible for wiring correctly.
vi.mock('../../src/components/CheckInHistory', () => ({
  default: (props) => {
    mocks.checkInHistoryProps(props)
    useEffect(() => { mocks.checkInHistoryMounts() }, [])
    return <div role="group" aria-label="Check-in history" data-testid="check-in-history" />
  },
  SummaryBlock: (props) => {
    mocks.summaryBlockProps(props)
    return <div data-testid="summary-block" />
  },
}))

vi.mock('../../src/components/CheckInPanel', () => ({
  default: (props) => {
    mocks.checkInPanelProps(props)
    return (
      <div role="group" aria-label="Check-in">
        <button type="button" onClick={() => props.onDone?.()}>Cancel</button>
      </div>
    )
  },
}))

import KrListInline from '../../src/components/KrListInline'

const kr = { id: 'kr-1', title: 'Reach 100 accounts', individual_objectives: [] }

describe('KrListInline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useKrSummaryMock.mockReturnValue({ summary: null, status: null, refetch: vi.fn() })
  })

  describe('allowCheckIn (distinct from readOnly)', () => {
    it('renders the check-in history block and a Check-in trigger when allowCheckIn is true', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn
          readOnly={false}
        />
      )
      expect(screen.getByTestId('check-in-history')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^check-in$/i })).toBeInTheDocument()
    })

    it('renders nothing check-in related when allowCheckIn is false (company objective / Map context)', () => {
      render(
        <KrListInline
          objectiveId="co-1"
          keyResults={[kr]}
          allowCheckIn={false}
          readOnly
        />
      )
      expect(screen.queryByTestId('check-in-history')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^check-in$/i })).not.toBeInTheDocument()
    })

    it('keeps the check-in trigger and history visible when readOnly is true but allowCheckIn is true (confirmed individual objective)', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn
          readOnly
        />
      )
      expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /add key result/i })).not.toBeInTheDocument()
      expect(screen.getByTestId('check-in-history')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^check-in$/i })).toBeInTheDocument()
    })
  })

  describe('prop threading to CheckInHistory / CheckInPanel', () => {
    it('passes the parent individualObjectiveId and the KR\'s own id down to CheckInHistory', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn
        />
      )
      expect(mocks.checkInHistoryProps).toHaveBeenCalledWith(
        expect.objectContaining({ individualObjectiveId: 'io-9', keyResultId: 'kr-1' })
      )
    })

    it('derives canAskQuestion from viewMode === "manager"', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn
          viewMode="manager"
        />
      )
      expect(mocks.checkInHistoryProps).toHaveBeenCalledWith(
        expect.objectContaining({ canAskQuestion: true })
      )
    })

    it('sets canAskQuestion to false for Member mode', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn
          viewMode="member"
        />
      )
      expect(mocks.checkInHistoryProps).toHaveBeenCalledWith(
        expect.objectContaining({ canAskQuestion: false })
      )
    })

    it('passes the parent individualObjectiveId and the KR\'s own id down to CheckInPanel when the Check-in form is opened', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /^check-in$/i }))
      expect(mocks.checkInPanelProps).toHaveBeenCalledWith(
        expect.objectContaining({ individualObjectiveId: 'io-9', keyResultId: 'kr-1' })
      )
    })
  })

  describe('layout order: summary, then Check-in trigger, then history (#B25)', () => {
    it('renders the summary block before the Check-in trigger, and the trigger before the history block', () => {
      render(<KrListInline individualObjectiveId="io-9" keyResults={[kr]} allowCheckIn />)
      const summary = screen.getByTestId('summary-block')
      const trigger = screen.getByRole('button', { name: /^check-in$/i })
      const history = screen.getByTestId('check-in-history')
      expect(summary.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(trigger.compareDocumentPosition(history) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('keeps the summary block above the entry form while it is open, with history still last', () => {
      render(<KrListInline individualObjectiveId="io-9" keyResults={[kr]} allowCheckIn />)
      fireEvent.click(screen.getByRole('button', { name: /^check-in$/i }))
      const summary = screen.getByTestId('summary-block')
      const form = screen.getByRole('group', { name: /^check-in$/i })
      const history = screen.getByTestId('check-in-history')
      expect(summary.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(form.compareDocumentPosition(history) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  describe('Check-in trigger toggles the entry form (hides itself while open, like the old single-control pattern)', () => {
    it('shows the entry form and hides the trigger once clicked', () => {
      render(<KrListInline individualObjectiveId="io-9" keyResults={[kr]} allowCheckIn />)
      fireEvent.click(screen.getByRole('button', { name: /^check-in$/i }))
      expect(screen.getByRole('group', { name: /^check-in$/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^check-in$/i })).not.toBeInTheDocument()
    })

    it('re-shows the trigger and hides the form when the form calls onDone (Cancel)', () => {
      render(<KrListInline individualObjectiveId="io-9" keyResults={[kr]} allowCheckIn />)
      fireEvent.click(screen.getByRole('button', { name: /^check-in$/i }))
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(screen.queryByRole('group', { name: /^check-in$/i })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^check-in$/i })).toBeInTheDocument()
    })
  })

  describe('readOnly still gates Edit and "+ Add key result" (unchanged meaning)', () => {
    it('hides Edit and "+ Add key result" when readOnly, independent of allowCheckIn', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn={false}
          readOnly
        />
      )
      expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /add key result/i })).not.toBeInTheDocument()
    })

    it('shows Edit and "+ Add key result" when not readOnly', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn={false}
          readOnly={false}
        />
      )
      expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add key result/i })).toBeInTheDocument()
    })
  })

  describe('AI summary is fetched once per objective, not once per KR (Codex review finding)', () => {
    const kr2 = { id: 'kr-2', title: 'Sign 5 enterprise deals', individual_objectives: [] }

    it('calls useKrSummary exactly once for an objective with multiple key results', () => {
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr, kr2]}
          allowCheckIn
        />
      )
      expect(mocks.useKrSummaryMock).toHaveBeenCalledTimes(1)
      expect(mocks.useKrSummaryMock).toHaveBeenCalledWith('io-9')
    })

    it('passes the same summary/status down to every KR\'s SummaryBlock', () => {
      mocks.useKrSummaryMock.mockReturnValue({ summary: 'Trending up.', status: 'ready' })
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr, kr2]}
          allowCheckIn
        />
      )
      const calls = mocks.summaryBlockProps.mock.calls.map(([props]) => props)
      expect(calls).toHaveLength(2)
      for (const props of calls) {
        expect(props.summary).toBe('Trending up.')
        expect(props.status).toBe('ready')
      }
    })

    it('does not call useKrSummary for a company objective (no individualObjectiveId)', () => {
      render(
        <KrListInline
          objectiveId="co-1"
          keyResults={[kr]}
          allowCheckIn={false}
          readOnly
        />
      )
      expect(mocks.useKrSummaryMock).toHaveBeenCalledWith(undefined)
    })

    it('refetches the shared summary when any KR\'s check-in is saved (Codex review round 2) — a save can cross the "enough data" threshold, so the summary itself needs refreshing, not just the per-KR history', () => {
      const refetchSummary = vi.fn()
      mocks.useKrSummaryMock.mockReturnValue({ summary: null, status: 'insufficient_data', refetch: refetchSummary })
      render(<KrListInline individualObjectiveId="io-9" keyResults={[kr, kr2]} allowCheckIn />)

      const checkInButtons = screen.getAllByRole('button', { name: /^check-in$/i })
      fireEvent.click(checkInButtons[1])
      const { onSaved } = mocks.checkInPanelProps.mock.calls.at(-1)[0]
      act(() => { onSaved() })

      expect(refetchSummary).toHaveBeenCalledTimes(1)
    })
  })

  describe('history refreshes right after a check-in is saved (Codex review finding)', () => {
    it('remounts the history block (fresh fetch) once the entry form reports a save, without needing the dialog reopened', () => {
      render(<KrListInline individualObjectiveId="io-9" keyResults={[kr]} allowCheckIn />)
      expect(mocks.checkInHistoryMounts).toHaveBeenCalledTimes(1)

      fireEvent.click(screen.getByRole('button', { name: /^check-in$/i }))
      const { onSaved } = mocks.checkInPanelProps.mock.calls.at(-1)[0]
      act(() => { onSaved() })

      expect(mocks.checkInHistoryMounts).toHaveBeenCalledTimes(2)
    })

    it('calls the onCheckInSaved callback passed down from the parent when a check-in is saved', () => {
      const onCheckInSaved = vi.fn()
      render(
        <KrListInline
          individualObjectiveId="io-9"
          keyResults={[kr]}
          allowCheckIn
          onCheckInSaved={onCheckInSaved}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /^check-in$/i }))
      const { onSaved } = mocks.checkInPanelProps.mock.calls.at(-1)[0]
      act(() => { onSaved() })
      expect(onCheckInSaved).toHaveBeenCalledTimes(1)
    })

    it('does not remount the history block on an unrelated re-render (only on an actual save)', () => {
      const { rerender } = render(<KrListInline individualObjectiveId="io-9" keyResults={[kr]} allowCheckIn viewMode="member" />)
      expect(mocks.checkInHistoryMounts).toHaveBeenCalledTimes(1)
      rerender(<KrListInline individualObjectiveId="io-9" keyResults={[kr]} allowCheckIn viewMode="manager" />)
      expect(mocks.checkInHistoryMounts).toHaveBeenCalledTimes(1)
    })
  })
})
