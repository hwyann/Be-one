import { useState } from 'react'
import CheckInPanel from './CheckInPanel'
import CheckInHistory from './CheckInHistory'
import StatusEditor from './StatusEditor'
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

function KrRow({ kr, onCheckInSaved }) {
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
        <span style={{ flex: 1, minWidth: 0 }}>{kr.title}</span>
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

export default function ObjectiveCard({ objective, onCheckInSaved, onStatusSaved }) {
  const { id, category, title, status } = objective
  const { label: dotLabel, color: dotColor } = STATUS_BY_VALUE[status] ?? { label: status, color: 'var(--text-muted)' }
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
      <div style={{
        font: '700 10px var(--font-display)',
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: 'var(--coral-700)',
      }}>
        {category.toUpperCase()}
      </div>
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
        <button
          type="button"
          aria-label={dotLabel}
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
            background: dotColor,
            display: 'inline-block',
          }} />
        </button>
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
          {keyResults.map(kr => <KrRow key={kr.id} kr={kr} onCheckInSaved={onCheckInSaved} />)}
        </div>
      )}
    </div>
  )
}
