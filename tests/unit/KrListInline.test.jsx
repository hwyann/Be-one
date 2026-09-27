import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  krCreate: vi.fn(),
  krUpdate: vi.fn(),
  checkInHistoryProps: vi.fn(),
  checkInPanelProps: vi.fn(),
}))

vi.mock('../../src/hooks/useKrMutation', () => ({
  default: () => ({ create: mocks.krCreate, update: mocks.krUpdate, saving: false, error: null }),
}))

// KrListInline's own responsibility is prop-threading (individualObjectiveId,
// keyResultId, viewMode -> canAskQuestion, allowCheckIn vs readOnly) — the
// actual rendering of the summary/history and the entry form is already
// covered by CheckInHistory.test.jsx and CheckInPanel.test.jsx, so those are
// mocked here to keep this file focused on what KrListInline itself is
// responsible for wiring correctly.
vi.mock('../../src/components/CheckInHistory', () => ({
  default: (props) => {
    mocks.checkInHistoryProps(props)
    return <div role="group" aria-label="Check-in history" data-testid="check-in-history" />
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
})
