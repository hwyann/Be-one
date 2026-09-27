export default function MyThreadPage({
  ownerName,
  objectives = [],
  companyObjectives = [],
  onEdit,
  readOnly = false,
}) {
  // Draft objectives (#B17/#B18) aren't shown as cards here — they're only
  // visible again inside the Add Objective modal until confirmed.
  const mine = objectives.filter(o => o.owner_name === ownerName && o.status === 'confirmed')
  if (mine.length === 0) return null

  function resolveLink(objective) {
    const co = companyObjectives.find(c => c.id === objective.linked_company_objective_id)
    if (!co) return { coTitle: null, krTitle: null }
    const kr = objective.key_result_id
      ? (co.key_results ?? []).find(k => k.id === objective.key_result_id)
      : null
    return { coTitle: co.title, krTitle: kr?.title ?? null }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        font: '700 20px var(--font-display)',
        color: 'var(--ink-700, #666)',
        marginBottom: '8px',
      }}>
        My Current OKR
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', padding: 0 }}>
        {mine.map(objective => {
          const { coTitle, krTitle } = resolveLink(objective)
          const keyResults = objective.key_results ?? []
          return (
            <li key={objective.id}>
              <button
                type="button"
                onClick={() => onEdit?.(objective)}
                disabled={readOnly}
                style={{
                  font: '600 14px var(--font-display)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
                  color: 'var(--ink-900)',
                  cursor: readOnly ? 'default' : 'pointer',
                  opacity: readOnly ? 0.6 : 1,
                  textAlign: 'left',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span>{objective.title}</span>
                {coTitle && (
                  <span style={{
                    font: '500 11px var(--font-sans)',
                    color: 'var(--text-secondary)',
                  }}>
                    Linked to Company OKR: {coTitle}{krTitle ? ` · ${krTitle}` : ''}
                  </span>
                )}
              </button>
              {keyResults.length > 0 && (
                // Rendered as a sibling of the card button, not a descendant —
                // a <button> may only contain phrasing content, and a <ul> of
                // key results is flow content (Codex review finding, #B22).
                <ul data-testid={`objective-krs-${objective.id}`} style={{
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  margin: 0,
                  padding: '4px 14px 0',
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
            </li>
          )
        })}
      </ul>
    </div>
  )
}
