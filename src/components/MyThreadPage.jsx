export default function MyThreadPage({
  ownerName,
  objectives = [],
  companyObjectives = [],
  onEdit,
}) {
  const mine = objectives.filter(o => o.owner_name === ownerName)
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
        font: '700 10px var(--font-display)',
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: 'var(--ink-700, #666)',
        marginBottom: '8px',
      }}>
        My thread
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', padding: 0 }}>
        {mine.map(objective => {
          const { coTitle, krTitle } = resolveLink(objective)
          return (
            <li key={objective.id}>
              <button
                type="button"
                onClick={() => onEdit?.(objective)}
                style={{
                  font: '600 14px var(--font-display)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--hairline)',
                  background: 'var(--surface)',
                  color: 'var(--ink-900)',
                  cursor: 'pointer',
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
                    ↑ {coTitle}{krTitle ? ` · ${krTitle}` : ''}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
