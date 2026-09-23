import { useState } from 'react'
import { QUESTIONS } from './CoachPanel'

const QUESTION_TEXT_BY_KEY = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.text]))

export default function RationaleSection({ rationale = [] }) {
  const [open, setOpen] = useState(false)

  if (rationale.length === 0) return null

  return (
    <div style={{ marginTop: '6px' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          font: '600 11px var(--font-display)',
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: 'none',
          padding: '4px 0',
          cursor: 'pointer',
        }}
      >
        {open ? '▾' : '▸'} View rationale
      </button>
      {open && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rationale.map((row) => (
            <li key={row.id}>
              <div style={{ font: '500 11px var(--font-sans)', color: 'var(--text-muted)' }}>
                {QUESTION_TEXT_BY_KEY[row.question_key] ?? row.question_key}
              </div>
              <div style={{ font: '500 12px var(--font-sans)', color: 'var(--ink-900)' }}>
                {row.answer}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
