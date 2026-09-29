import { useState } from 'react'
import { STATUSES } from '../lib/statuses'

// Purely presentational now (#B29) — the caller (ObjectiveCard) picks
// which hook's `update` applies (useCompanyObjectiveStatus for a company
// objective, useIndividualObjectiveStatus for an individual one, gated by
// who's allowed to edit which) and passes it straight through, rather
// than this component importing one specific hook itself.
//
// `floating` (#B29 follow-up, Manager-only): renders as a small popover
// anchored to the status badge instead of a full-width block pushed into
// the card's normal flow — the caller must wrap the badge + this in a
// `position: relative` element for the anchoring to work. Only used for
// company-objective status editing; a member's own OKR keeps the original
// inline block below the title row.
export default function StatusEditor({ objectiveId, currentStatus, onDone, onSaved, update, saving, error, floating = false }) {
  const [picked, setPicked] = useState(currentStatus)

  async function handleSave() {
    const ok = await update({ id: objectiveId, status: picked })
    if (ok) {
      onSaved?.()
      onDone?.()
    }
  }

  const canSave = picked && picked !== 'not_started' && !saving

  const floatingStyle = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    right: 0,
    zIndex: 30,
    width: '230px',
  }

  const panelStyle = {
    margin: floating ? 0 : '4px 0 8px',
    padding: '10px 12px',
    background: floating ? 'var(--surface)' : 'var(--panel)',
    border: '1px solid var(--hairline)',
    borderRadius: '10px',
    boxShadow: floating ? '0 4px 16px rgba(19,30,40,.18)' : 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }

  return (
    <div
      role="group"
      aria-label="Set status"
      style={floating ? { ...floatingStyle, ...panelStyle } : panelStyle}
    >
      <div role="radiogroup" aria-label="Status" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
