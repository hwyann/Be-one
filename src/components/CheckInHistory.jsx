import useCheckInHistory from '../hooks/useCheckInHistory'
import useCheckInQuestions from '../hooks/useCheckInQuestions'
import CheckInQuestion from './CheckInQuestion'
import { STATUS_BY_VALUE } from '../lib/statuses'

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

function formatDate(iso) {
  return DATE_FORMAT.format(new Date(iso))
}

// Exported separately so KrRow (KrListInline.jsx) can render it above the
// Check-in button, ahead of the history list below — the AI summary always
// leads, then the action to add a new entry, then the chronological list
// (see #B25 in the tracker for why this moved out of CheckInHistory itself).
export function SummaryBlock({ status, summary }) {
  if (status === 'ready') {
    return (
      <div
        role="note"
        aria-label="AI summary"
        style={{
          font: '500 12px var(--font-sans)',
          color: 'var(--ink-900)',
          padding: '8px 10px',
          borderLeft: '3px solid var(--coral)',
          background: 'var(--panel-alt, rgba(0,0,0,0.02))',
          borderRadius: '4px',
        }}
      >
        {summary}
      </div>
    )
  }
  if (status === 'insufficient_data') {
    return (
      <div style={{ font: '500 11px var(--font-sans)', color: 'var(--text-muted)' }}>
        Not enough check-ins yet.
      </div>
    )
  }
  if (status === 'loading') {
    return (
      <div style={{ font: '500 11px var(--font-sans)', color: 'var(--text-muted)' }}>
        Generating summary…
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div style={{ font: '500 11px var(--font-sans)', color: 'var(--text-muted)' }}>
        Summary unavailable
      </div>
    )
  }
  return null
}

// Renders only the chronological check-in list (+ per-entry question) now —
// the AI summary is rendered separately by the caller, above the Check-in
// button, via the SummaryBlock export above (#B25).
export default function CheckInHistory({ individualObjectiveId, keyResultId, canAskQuestion }) {
  const { checkIns, error } = useCheckInHistory(individualObjectiveId, keyResultId)
  const checkInIds = checkIns.map(ci => ci.id)
  const { questionsByCheckInId, askQuestion, replyToQuestion } = useCheckInQuestions(checkInIds)

  return (
    <div
      role="group"
      aria-label="Check-in history"
      style={{
        margin: '4px 8px 8px',
        padding: '10px 12px',
        background: 'var(--panel)',
        border: '1px solid var(--hairline)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {error && (
        <div role="alert" style={{ font: '500 11px var(--font-sans)', color: 'var(--behind)' }}>{error}</div>
      )}
      {!error && checkIns.length === 0 && (
        <div style={{ font: '500 12px var(--font-sans)', color: 'var(--text-muted)' }}>
          No check-ins yet.
        </div>
      )}
      {checkIns.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {checkIns.map(ci => {
            const meta = STATUS_BY_VALUE[ci.status] ?? { label: ci.status, color: 'var(--text-muted)' }
            return (
              <li key={ci.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', font: '500 11px var(--font-sans)', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
                  <span>{meta.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>· {formatDate(ci.created_at)}</span>
                </div>
                {ci.note && (
                  <div style={{ font: '500 12px var(--font-sans)', color: 'var(--ink-900)' }}>{ci.note}</div>
                )}
                {ci.plan_next && (
                  <div style={{ font: '500 11px var(--font-sans)', color: 'var(--text-secondary)' }}>
                    Next: {ci.plan_next}
                  </div>
                )}
                <CheckInQuestion
                  question={questionsByCheckInId[ci.id] ?? null}
                  onAsk={questionText => askQuestion(ci.id, questionText)}
                  onReply={(questionId, replyText) => replyToQuestion(questionId, replyText)}
                  canAsk={canAskQuestion}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
