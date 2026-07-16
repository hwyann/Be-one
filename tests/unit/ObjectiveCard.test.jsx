import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import ObjectiveCard from '../../src/components/ObjectiveCard'

vi.mock('../../src/hooks/useCheckIns', () => ({
  default: () => ({ save: vi.fn().mockResolvedValue(true), saving: false, error: null }),
}))

vi.mock('../../src/hooks/useCheckInHistory', () => ({
  default: () => ({ checkIns: [], loading: false, error: null }),
}))

describe('ObjectiveCard', () => {
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

  it('renders an on_track status dot', () => {
    render(<ObjectiveCard objective={objective} />)
    expect(screen.getByRole('img', { name: /on track/i })).toBeInTheDocument()
  })

  it('renders an at_risk status dot', () => {
    render(<ObjectiveCard objective={{ ...objective, status: 'at_risk' }} />)
    expect(screen.getByRole('img', { name: /at risk/i })).toBeInTheDocument()
  })

  it('renders a behind status dot', () => {
    render(<ObjectiveCard objective={{ ...objective, status: 'behind' }} />)
    expect(screen.getByRole('img', { name: /behind/i })).toBeInTheDocument()
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

  it('renders a check-in trigger on a KR row with a linked individual objective', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument()
  })

  it('expands the check-in panel when the trigger is clicked', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    expect(screen.queryByLabelText(/what changed/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /check in/i }))
    expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument()
  })

  it('closes the panel when Cancel is clicked', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    fireEvent.click(screen.getByRole('button', { name: /check in/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByLabelText(/what changed/i)).not.toBeInTheDocument()
  })

  it('does not render a check-in trigger when the KR has no linked individual objective', () => {
    const noLink = {
      ...objective,
      key_results: [{ id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] }],
    }
    render(<ObjectiveCard objective={noLink} />)
    expect(screen.queryByRole('button', { name: /check in/i })).not.toBeInTheDocument()
  })

  it('renders a History trigger on a KR row with a linked individual objective', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument()
  })

  it('does not render a History trigger when the KR has no linked individual objective', () => {
    const noLink = {
      ...objective,
      key_results: [{ id: 'k1', title: 'Reach 100 accounts', individual_objectives: [] }],
    }
    render(<ObjectiveCard objective={noLink} />)
    expect(screen.queryByRole('button', { name: /history/i })).not.toBeInTheDocument()
  })

  it('expands the check-in history panel when the History trigger is clicked', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    expect(screen.queryByRole('group', { name: /check-in history/i })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /history/i }))
    expect(screen.getByRole('group', { name: /check-in history/i })).toBeInTheDocument()
  })

  it('closes the history panel when the History trigger is clicked again', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    fireEvent.click(screen.getByRole('button', { name: /history/i }))
    fireEvent.click(screen.getByRole('button', { name: /history/i }))
    expect(screen.queryByRole('group', { name: /check-in history/i })).not.toBeInTheDocument()
  })

  it('swaps from the check-in panel to the history panel when History is clicked', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    fireEvent.click(screen.getByRole('button', { name: /check in/i }))
    expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /history/i }))
    expect(screen.queryByLabelText(/what changed/i)).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: /check-in history/i })).toBeInTheDocument()
  })

  it('swaps from the history panel to the check-in panel when Check in is clicked', () => {
    render(<ObjectiveCard objective={withLinkedIO} />)
    fireEvent.click(screen.getByRole('button', { name: /history/i }))
    expect(screen.getByRole('group', { name: /check-in history/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /check in/i }))
    expect(screen.queryByRole('group', { name: /check-in history/i })).not.toBeInTheDocument()
    expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument()
  })
})
