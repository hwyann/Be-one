import { useState } from 'react'
import useCompanyObjectives from '../hooks/useCompanyObjectives'
import useIndividualObjectives from '../hooks/useIndividualObjectives'
import useActiveQuarter from '../hooks/useActiveQuarter'
import ObjectiveCard from './ObjectiveCard'
import OkrDialog from './OkrDialog'

export default function OkrMapPage() {
  const { objectives, loading, error, refetch } = useCompanyObjectives()
  const {
    objectives: individualObjectives,
    refetch: refetchIndividual,
  } = useIndividualObjectives()
  const { quarterId } = useActiveQuarter()
  const [dialogState, setDialogState] = useState(null)

  if (loading) return <div>Loading...</div>
  if (error) return <p role="alert">{error}</p>

  function closeDialog() { setDialogState(null) }

  function handleSave() {
    if (dialogState.objective) refetchIndividual()
    else refetch()
    closeDialog()
  }

  return (
    <div style={{ minWidth: '980px', padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '14px',
      }}>
        <button
          type="button"
          onClick={() => setDialogState({})}
          style={{
            font: '600 13px var(--font-display)',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--hairline)',
            background: 'var(--surface)',
            color: 'var(--ink-900)',
            cursor: 'pointer',
          }}
        >
          + Add objective
        </button>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '14px',
      }}>
        {objectives.map(objective => (
          <ObjectiveCard key={objective.id} objective={objective} />
        ))}
      </div>
      {individualObjectives.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{
            font: '700 10px var(--font-display)',
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-700, #666)',
            marginBottom: '8px',
          }}>
            My objectives
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {individualObjectives.map(objective => (
              <li key={objective.id}>
                <button
                  type="button"
                  onClick={() => setDialogState({ objective })}
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
                  }}
                >
                  {objective.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {dialogState && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(19,30,40,.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <OkrDialog
            quarterId={quarterId}
            objective={dialogState.objective}
            companyObjectives={objectives}
            onSave={handleSave}
            onClose={closeDialog}
          />
        </div>
      )}
    </div>
  )
}
