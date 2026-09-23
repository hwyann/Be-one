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

  it('reports answers keyed by question_key (outcome_check / alignment_check) as they are typed', () => {
    const onAnswersChange = vi.fn()
    render(<CoachPanel onSkip={vi.fn()} onAnswersChange={onAnswersChange} />)
    fireEvent.change(screen.getByLabelText(/これが達成されたら、他の誰か/), {
      target: { value: 'Clients stop waiting.' },
    })
    expect(onAnswersChange).toHaveBeenLastCalledWith({ outcome_check: 'Clients stop waiting.' })
    fireEvent.change(screen.getByLabelText(/もしこれらのKRが目標の前進につながらなかったとしても/), {
      target: { value: 'Yes, still worth it.' },
    })
    expect(onAnswersChange).toHaveBeenLastCalledWith({
      outcome_check: 'Clients stop waiting.',
      alignment_check: 'Yes, still worth it.',
    })
  })
})
