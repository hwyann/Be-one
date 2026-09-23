import { useState } from 'react'

export default function CheckInQuestion({ question, onAsk, onReply }) {
  const [asking, setAsking] = useState(false)
  const [draft, setDraft] = useState('')
  const [replyDraft, setReplyDraft] = useState('')

  if (!question) {
    if (!asking) {
      return (
        <button
          type="button"
          onClick={() => setAsking(true)}
          style={{
            alignSelf: 'flex-start',
            font: '500 11px var(--font-sans)',
            color: 'var(--text-secondary)',
            background: 'none',
            border: '1px solid var(--hairline)',
            borderRadius: '6px',
            padding: '3px 8px',
            cursor: 'pointer',
          }}
        >
          ? Ask a question
        </button>
      )
    }

    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Ask a question about this check-in…"
          style={{
            flex: 1,
            font: '500 12px var(--font-sans)',
            padding: '5px 8px',
            border: '1px solid var(--hairline)',
            borderRadius: '6px',
          }}
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = draft.trim()
            if (trimmed === '') return
            onAsk(trimmed)
          }}
          style={{
            font: '500 11px var(--font-sans)',
            color: 'var(--ink-900)',
            background: 'var(--panel-alt, rgba(0,0,0,0.02))',
            border: '1px solid var(--hairline)',
            borderRadius: '6px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    )
  }

  return (
    <div
      role="note"
      aria-label="Check-in question"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        font: '500 12px var(--font-sans)',
        color: 'var(--ink-900)',
        padding: '8px 10px',
        borderLeft: '3px solid var(--coral)',
        background: 'var(--panel-alt, rgba(0,0,0,0.02))',
        borderRadius: '4px',
      }}
    >
      <div>? <span>{question.question_text}</span></div>
      {question.reply_text ? (
        <div style={{ color: 'var(--text-secondary)' }}>↳ <span>{question.reply_text}</span></div>
      ) : (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="text"
            value={replyDraft}
            onChange={e => setReplyDraft(e.target.value)}
            placeholder="Reply…"
            style={{
              flex: 1,
              font: '500 12px var(--font-sans)',
              padding: '5px 8px',
              border: '1px solid var(--hairline)',
              borderRadius: '6px',
            }}
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = replyDraft.trim()
              if (trimmed === '') return
              onReply(question.id, trimmed)
            }}
            style={{
              font: '500 11px var(--font-sans)',
              color: 'var(--ink-900)',
              background: 'var(--panel)',
              border: '1px solid var(--hairline)',
              borderRadius: '6px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            Reply
          </button>
        </div>
      )}
    </div>
  )
}
