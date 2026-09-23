import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

import CoachPanel from '../../src/components/CoachPanel'

describe('CoachPanel', () => {
  it('renders the two coaching questions', () => {
    render(<CoachPanel onSkip={vi.fn()} />)
    expect(
      screen.getByText(/これが達成されたら、他の誰か/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/もしこれらのKRが目標の前進につながらなかったとしても/)
    ).toBeInTheDocument()
  })

  it('calls onSkip when "Skip coaching" is clicked, without requiring an answer', () => {
    const onSkip = vi.fn()
    render(<CoachPanel onSkip={onSkip} />)
    fireEvent.click(screen.getByRole('button', { name: /skip coaching/i }))
    expect(onSkip).toHaveBeenCalled()
  })
})
