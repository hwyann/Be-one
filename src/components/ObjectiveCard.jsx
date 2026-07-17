import { useState } from 'react'
import StatusEditor from './StatusEditor'
import KrListInline from './KrListInline'
import { STATUS_BY_VALUE } from '../lib/statuses'

export default function ObjectiveCard({
  objective,
  individualObjectiveId,
  onCheckInSaved,
  onStatusSaved,
  onKrSaved,
}) {
  const { id, category, title, status } = objective
  const statusMeta = status
    ? (STATUS_BY_VALUE[status] ?? { label: status, color: 'var(--text-muted)' })
    : null
  const keyResults = objective.key_results ?? []
  const [editingStatus, setEditingStatus] = useState(false)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(19,30,40,.06)',
      padding: '14px 14px 8px',
    }}>
      {category && (
        <div style={{
          font: '700 10px var(--font-display)',
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          color: 'var(--coral-700)',
        }}>
          {category.toUpperCase()}
        </div>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        margin: '3px 0 8px',
      }}>
        <span style={{
          flex: 1,
          font: '700 14.5px/1.3 var(--font-display)',
          color: 'var(--ink-900)',
        }}>
          {title}
        </span>
        {statusMeta && (
          <button
            type="button"
            aria-label={statusMeta.label}
            onClick={() => setEditingStatus(true)}
            style={{
              width: '14px',
              height: '14px',
              padding: 0,
              border: 'none',
              background: 'transparent',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '1px',
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusMeta.color,
              display: 'inline-block',
            }} />
          </button>
        )}
      </div>
      {editingStatus && (
        <StatusEditor
          objectiveId={id}
          currentStatus={status}
          onDone={() => setEditingStatus(false)}
          onSaved={onStatusSaved}
        />
      )}
      <KrListInline
        objectiveId={individualObjectiveId ? undefined : id}
        individualObjectiveId={individualObjectiveId}
        keyResults={keyResults}
        onCheckInSaved={onCheckInSaved}
        onKrSaved={onKrSaved}
      />
    </div>
  )
}
