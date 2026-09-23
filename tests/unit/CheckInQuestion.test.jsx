import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import CheckInQuestion from '../../src/components/CheckInQuestion'

describe('CheckInQuestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an "Ask a question" button when there is no question yet', () => {
    render(<CheckInQuestion question={null} onAsk={vi.fn()} onReply={vi.fn()} />)
    expect(screen.getByRole('button', { name: /ask a question/i })).toBeInTheDocument()
  })

  it('reveals an inline input and send button when the ask button is clicked', () => {
    render(<CheckInQuestion question={null} onAsk={vi.fn()} onReply={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /ask a question/i }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('calls onAsk with the typed question text when send is clicked', () => {
    const onAsk = vi.fn()
    render(<CheckInQuestion question={null} onAsk={onAsk} onReply={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /ask a question/i }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'What blocked this?' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(onAsk).toHaveBeenCalledWith('What blocked this?')
  })

  it('does not call onAsk when the input is blank', () => {
    const onAsk = vi.fn()
    render(<CheckInQuestion question={null} onAsk={onAsk} onReply={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /ask a question/i }))
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(onAsk).not.toHaveBeenCalled()
  })

  it('hides the ask button and input once a question exists, showing the question text instead', () => {
    render(
      <CheckInQuestion
        question={{ id: 'q1', question_text: 'What blocked this?', reply_text: null }}
        onAsk={vi.fn()}
        onReply={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /ask a question/i })).not.toBeInTheDocument()
    expect(screen.getByText('What blocked this?')).toBeInTheDocument()
  })

  it('shows a reply input when a question exists but has no reply yet', () => {
    render(
      <CheckInQuestion
        question={{ id: 'q1', question_text: 'What blocked this?', reply_text: null }}
        onAsk={vi.fn()}
        onReply={vi.fn()}
      />
    )
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument()
  })

  it('calls onReply with the question id and typed reply text', () => {
    const onReply = vi.fn()
    render(
      <CheckInQuestion
        question={{ id: 'q1', question_text: 'What blocked this?', reply_text: null }}
        onAsk={vi.fn()}
        onReply={onReply}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Waiting on design.' } })
    fireEvent.click(screen.getByRole('button', { name: /reply/i }))
    expect(onReply).toHaveBeenCalledWith('q1', 'Waiting on design.')
  })

  it('shows both the question and the reply text once a reply exists, with no further input', () => {
    render(
      <CheckInQuestion
        question={{ id: 'q1', question_text: 'What blocked this?', reply_text: 'Waiting on design.' }}
        onAsk={vi.fn()}
        onReply={vi.fn()}
      />
    )
    expect(screen.getByText('What blocked this?')).toBeInTheDocument()
    expect(screen.getByText('Waiting on design.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders exactly one question/reply pair, never a list of multiple', () => {
    render(
      <CheckInQuestion
        question={{ id: 'q1', question_text: 'What blocked this?', reply_text: 'Waiting on design.' }}
        onAsk={vi.fn()}
        onReply={vi.fn()}
      />
    )
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
