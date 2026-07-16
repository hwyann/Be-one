import { useState } from 'react'
import useCheckIns from '../hooks/useCheckIns'
import { STATUSES } from '../lib/statuses'

export default function CheckInPanel({ individualObjectiveId, onDone }) {
  const [status, setStatus] = useState(null)
  const [note, setNote] = useState('')
  const { save, saving, error } = useCheckIns()

  async function handleSave() {
    const ok = await save({ individualObjectiveId, status, note })
    if (ok) onDone?.()
  }

  return (
    <div
      role="group"
      aria-label="Check-in"
      style={{
        margin: '4px 8px 8px',
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
          const selected = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={opt.label}
              onClick={() => setStatus(opt.value)}
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
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', font: '500 11px var(--font-sans)', color: 'var(--text-secondary)' }}>
        What changed? one line is enough
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          style={{
            padding: '6px 8px',
            border: '1px solid var(--hairline)',
            borderRadius: '8px',
            font: '500 12px var(--font-sans)',
            background: 'var(--surface)',
          }}
        />
      </label>
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
          disabled={!status || saving}
          style={{
            font: '600 12px var(--font-sans)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid var(--accent-strong)',
            background: 'var(--accent-strong)',
            color: 'var(--surface)',
            cursor: !status || saving ? 'not-allowed' : 'pointer',
            opacity: !status || saving ? 0.6 : 1,
          }}
        >
          Save
        </button>
      </div>
    </div>
  )
}
