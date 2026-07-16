import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ObjectiveCard from '../../src/components/ObjectiveCard'

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
})
