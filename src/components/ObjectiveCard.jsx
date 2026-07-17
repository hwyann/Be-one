import { useState } from 'react'
import CheckInPanel from './CheckInPanel'
import CheckInHistory from './CheckInHistory'
import StatusEditor from './StatusEditor'
import useKrMutation from '../hooks/useKrMutation'
import { STATUS_BY_VALUE } from '../lib/statuses'

const MAX_INLINE_OWNERS = 3
const COLLAPSED_INLINE_OWNERS = 2

function initialsFor(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('')
}

function Avatar({ text, overlap }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      borderRadius: '999px',
      background: 'var(--panel)',
      border: '2px solid var(--surface)',
      font: '600 9px var(--font-sans)',
      color: 'var(--text-secondary)',
      marginLeft: overlap ? '-6px' : 0,
      flex: 'none',
    }}>{text}</span>
  )
}

function KrRowActionButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        font: '500 11px var(--font-sans)',
        padding: '3px 8px',
        borderRadius: '999px',
        border: '1px solid var(--hairline)',
        background: 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function KrForm({ initialTitle = '', initialTargetNote = '', onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialTitle)
  const [targetNote, setTargetNote] = useState(initialTargetNote)

  function handleSubmit() {
    if (!title.trim()) return
    onSubmit({ title: title.trim(), targetNote })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '8px',
      border: '1px solid var(--hairline)',
      borderRadius: '10px',
      marginTop: '6px',
    }}>
      <label htmlFor="kr-title" style={{ font: '600 11px var(--font-sans)', color: 'var(--text-secondary)' }}>
        Key result
      </label>
      <input
        id="kr-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{
          font: '500 13px var(--font-sans)',
          padding: '6px 8px',
          border: '1px solid var(--hairline)',
          borderRadius: '6px',
        }}
      />
      <label htmlFor="kr-target-note" style={{ font: '600 11px var(--font-sans)', color: 'var(--text-secondary)' }}>
        Target note (optional)
      </label>
      <input
        id="kr-target-note"
        value={targetNote}
        onChange={e => setTargetNote(e.target.value)}
        style={{
          font: '500 12px var(--font-sans)',
          padding: '6px 8px',
          border: '1px solid var(--hairline)',
          borderRadius: '6px',
        }}
      />
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
        <button type="button" onClick={onCancel} style={formButtonStyle(false)}>Cancel</button>
        <button type="button" onClick={handleSubmit} style={formButtonStyle(true)}>Save</button>
      </div>
    </div>
  )
}

function formButtonStyle(primary) {
  return {
    font: '600 12px var(--font-display)',
    padding: '5px 12px',
    borderRadius: '8px',
    border: '1px solid var(--hairline)',
    background: primary ? 'var(--ink-900)' : 'transparent',
    color: primary ? 'var(--surface)' : 'var(--text-secondary)',
    cursor: 'pointer',
  }
}

function KrRow({ kr, onCheckInSaved, onEdit }) {
  const linked = kr.individual_objectives ?? []
  const owners = linked.filter(o => o.owner_name)
  const overflow = owners.length > MAX_INLINE_OWNERS ? owners.length - COLLAPSED_INLINE_OWNERS : 0
  const shown = overflow > 0 ? owners.slice(0, COLLAPSED_INLINE_OWNERS) : owners
  const checkInTarget = linked.find(o => o.id)
  const [panelMode, setPanelMode] = useState(null)

  function toggle(mode) {
    setPanelMode(prev => (prev === mode ? null : mode))
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 8px',
        font: '500 12px var(--font-sans)',
        color: 'var(--text-secondary)',
      }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <span>{kr.title}</span>
          {kr.target_note && (
            <span style={{
              font: '400 11px var(--font-sans)',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}>
              {kr.target_note}
            </span>
          )}
        </div>
        {(shown.length > 0 || overflow > 0) && (
          <div style={{ display: 'flex' }}>
            {shown.map((o, i) => (
              <Avatar key={i} text={initialsFor(o.owner_name)} overlap={i > 0} />
            ))}
            {overflow > 0 && (
              <Avatar text={`+${overflow}`} overlap={shown.length > 0} />
            )}
          </div>
        )}
        <KrRowActionButton label="Edit" onClick={onEdit} />
        {checkInTarget && panelMode !== 'checkin' && (
          <KrRowActionButton label="Check in" onClick={() => toggle('checkin')} />
        )}
        {checkInTarget && (
          <KrRowActionButton label="History" onClick={() => toggle('history')} />
        )}
      </div>
      {checkInTarget && panelMode === 'checkin' && (
        <CheckInPanel
          individualObjectiveId={checkInTarget.id}
          onSaved={onCheckInSaved}
          onDone={() => setPanelMode(null)}
        />
      )}
      {checkInTarget && panelMode === 'history' && (
        <CheckInHistory individualObjectiveId={checkInTarget.id} />
      )}
    </div>
  )
}

export default function ObjectiveCard({
  objective,
  individualObjectiveId,
  onCheckInSaved,
  onStatusSaved,
  onKrSaved,
}) {
  const { id, category, title, status } = objective
  const statusMeta = status ? (STATUS_BY_VALUE[status] ?? { label: status, color: 'var(--text-muted)' }) : null
  const keyResults = objective.key_results ?? []
  const [editingStatus, setEditingStatus] = useState(false)
  const [krFormMode, setKrFormMode] = useState(null)
  const { create, update } = useKrMutation()

  async function handleKrSave({ title, targetNote }) {
    let ok
    if (krFormMode?.kind === 'add') {
      ok = await create({
        objectiveId: individualObjectiveId ? undefined : id,
        individualObjectiveId,
        title,
        targetNote,
      })
    } else if (krFormMode?.kind === 'edit') {
      ok = await update({ id: krFormMode.krId, title, targetNote })
    }
    if (ok) {
      setKrFormMode(null)
      onKrSaved?.()
    }
  }

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
      {keyResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {keyResults.map(kr => (
            krFormMode?.kind === 'edit' && krFormMode.krId === kr.id ? (
              <KrForm
                key={kr.id}
                initialTitle={kr.title}
                initialTargetNote={kr.target_note ?? ''}
                onSubmit={handleKrSave}
                onCancel={() => setKrFormMode(null)}
              />
            ) : (
              <KrRow
                key={kr.id}
                kr={kr}
                onCheckInSaved={onCheckInSaved}
                onEdit={() => setKrFormMode({ kind: 'edit', krId: kr.id })}
              />
            )
          ))}
        </div>
      )}
      {krFormMode?.kind === 'add' ? (
        <KrForm onSubmit={handleKrSave} onCancel={() => setKrFormMode(null)} />
      ) : (
        <button
          type="button"
          onClick={() => setKrFormMode({ kind: 'add' })}
          style={{
            marginTop: '6px',
            font: '600 12px var(--font-display)',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px dashed var(--hairline)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          + Add key result
        </button>
      )}
    </div>
  )
}
