import { useState } from 'react'
import useCompanyObjectives from '../hooks/useCompanyObjectives'
import ObjectiveCard from './ObjectiveCard'
import OkrDialog from './OkrDialog'

export default function OkrMapPage() {
  const { objectives, loading, error, refetch } = useCompanyObjectives()
  const [dialogOpen, setDialogOpen] = useState(false)

  if (loading) return <div>Loading...</div>
  if (error) return <p role="alert">{error}</p>

  return (
    <div style={{ minWidth: '980px', padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '14px',
      }}>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
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
      {dialogOpen && (
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
            onSave={() => { setDialogOpen(false); refetch() }}
            onClose={() => setDialogOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
