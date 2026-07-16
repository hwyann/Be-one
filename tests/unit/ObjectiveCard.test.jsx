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
})
