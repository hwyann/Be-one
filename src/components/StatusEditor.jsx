import { useState } from 'react'
import useCompanyObjectiveStatus from '../hooks/useCompanyObjectiveStatus'
import { STATUSES } from '../lib/statuses'

export default function StatusEditor({ objectiveId, currentStatus, onDone, onSaved }) {
  const [picked, setPicked] = useState(currentStatus)
  const { update, saving, error } = useCompanyObjectiveStatus()

  async function handleSave() {
    const ok = await update({ id: objectiveId, status: picked })
    if (ok) {
      onSaved?.()
      onDone?.()
    }
  }

  const canSave = picked && picked !== 'not_started' && !saving

  return (
    <div
      role="group"
      aria-label="Set status"
      style={{
        margin: '4px 0 8px',
        padding: '10px 12px',
        background: 'var(--panel)',
        border: '1px solid var(--hairline)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div role="radiogroup" aria-label="Status" style={{ display: 'flex', gap: '10px' }}>
        {STATUSES.map(opt => {
          const selected = picked === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={opt.label}
              onClick={() => setPicked(opt.value)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '999px',
                border: `1px solid ${selected ? opt.color : 'var(--hairline)'}`,
                background: selected ? 'var(--surface)' : 'transparent',
                font: '500 12px var(--font-sans)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: opt.color, display: 'inline-block',
              }} />
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && <div role="alert" style={{ font: '500 11px var(--font-sans)', color: 'var(--behind)' }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
        <button
          type="button"
          onClick={() => onDone?.()}
          style={{
            font: '500 12px var(--font-sans)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid var(--hairline)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          style={{
            font: '600 12px var(--font-sans)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid var(--coral-800)',
            background: 'var(--coral-700)',
            color: 'var(--surface)',
            cursor: canSave ? 'pointer' : 'not-allowed',
            opacity: canSave ? 1 : 0.6,
          }}
        >
          Save
        </button>
      </div>
    </div>
  )
}
