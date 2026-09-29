import { useNavigate } from 'react-router-dom'

function cardStyle(selected) {
  return {
    font: '600 14px var(--font-display)',
    padding: '10px 14px',
    borderRadius: '10px',
    border: selected ? '1.5px solid var(--coral-700)' : '1px solid var(--hairline)',
    background: 'var(--surface)',
    color: 'var(--ink-900)',
    textAlign: 'left',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }
}

function reviewButtonStyle(enabled) {
  return {
    font: '600 12px var(--font-display)',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid var(--hairline)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.5,
  }
}

function ObjectiveCardRow({ objective, coTitle, keyResults, readOnly, selected, onEdit }) {
  function handleSelect() {
    if (!readOnly) onEdit?.(objective)
  }

  function handleKeyDown(e) {
    if (readOnly) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEdit?.(objective)
    }
  }

  return (
    <li>
      {/* A <div> here, not a <button> — the key result list below is flow
          content, and a <button> may only contain phrasing content (Codex
          review finding, #B22). role="button" + explicit key handling keeps
          this keyboard-accessible as a single selectable unit that now
          genuinely contains its KRs, instead of them sitting outside the
          card's bordered box as a sibling. */}
      <div
        role="button"
        tabIndex={readOnly ? -1 : 0}
        aria-disabled={readOnly}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        style={{
          ...cardStyle(selected),
          cursor: readOnly ? 'default' : 'pointer',
          opacity: readOnly ? 0.6 : 1,
        }}
      >
        <span>{objective.title}</span>
        {coTitle && (
          <span style={{
            font: '500 11px var(--font-sans)',
            color: 'var(--text-secondary)',
          }}>
            Linked to Company OKR: {coTitle}
          </span>
        )}
        {keyResults.length > 0 && (
          <ul data-testid={`objective-krs-${objective.id}`} style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            margin: 0,
            padding: '4px 0 0',
          }}>
            {keyResults.map(kr => (
              <li key={kr.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: '500 11px var(--font-sans)', color: 'var(--text-secondary)' }}>
                  {kr.title}
                </span>
                {kr.target_note && (
                  <span style={{ font: '400 11px var(--font-sans)', color: 'var(--text-muted)' }}>
                    {kr.target_note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default function MyThreadPage({
  ownerName,
  objectives = [],
  companyObjectives = [],
  onEdit,
  readOnly = false,
  selectedObjectiveId = null,
  reviewEnabled = false,
}) {
  const navigate = useNavigate()

  // Draft objectives (#B17/#B18) aren't shown as cards here — they're only
  // visible again inside the Add Objective modal until confirmed.
  const mine = objectives.filter(o => o.owner_name === ownerName && o.status === 'confirmed')
  if (mine.length === 0) return null

  // Members can only align to a whole company Objective now (#B26) — no
  // more per-KR "direct_kr" link, so this only ever needs the objective's
  // own title, not a KR title alongside it.
  function resolveLink(objective) {
    const co = companyObjectives.find(c => c.id === objective.linked_company_objective_id)
    return { coTitle: co?.title ?? null }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <div style={{
          font: '700 20px var(--font-display)',
          color: 'var(--ink-700, #666)',
        }}>
          My Current OKR
        </div>
        {/* Reviewing is a distinct action from editing/adding, so it stays
            enabled even when readOnly (most relevant for a quarter that's
            ending or past) — but it's now gated on a Manager explicitly
            requesting a review for this quarter (#B27), reversing #B23's
            "always available" decision. Opens a real routed page instead
            of an in-place modal, so a member's progress isn't tied to
            keeping this screen open. */}
        <button
          type="button"
          onClick={() => navigate('/review')}
          disabled={!reviewEnabled}
          title={reviewEnabled ? undefined : 'Your manager hasn\'t requested a review yet.'}
          style={reviewButtonStyle(reviewEnabled)}
        >
          Review
        </button>
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', padding: 0 }}>
        {mine.map(objective => {
          const { coTitle } = resolveLink(objective)
          const keyResults = objective.key_results ?? []
          return (
            <ObjectiveCardRow
              key={objective.id}
              objective={objective}
              coTitle={coTitle}
              keyResults={keyResults}
              readOnly={readOnly}
              selected={objective.id === selectedObjectiveId}
              onEdit={onEdit}
            />
          )
        })}
      </ul>
    </div>
  )
}
