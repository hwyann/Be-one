import { useState } from 'react'
import useKrMutation from '../hooks/useKrMutation'
import useKrSummary from '../hooks/useKrSummary'
import CheckInPanel from './CheckInPanel'
import CheckInHistory from './CheckInHistory'

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

function RowActionButton({ label, onClick }) {
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

export function KrForm({ initialTitle = '', initialTargetNote = '', onSubmit, onCancel, submitLabel = 'Save' }) {
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
        <button type="button" onClick={handleSubmit} style={formButtonStyle(true)}>{submitLabel}</button>
      </div>
    </div>
  )
}

function KrRow({
  kr, individualObjectiveId, viewMode, allowCheckIn, summary, summaryStatus,
  onCheckInSaved, onEdit, readOnly,
}) {
  const linked = kr.individual_objectives ?? []
  const owners = linked.filter(o => o.owner_name)
  const overflow = owners.length > MAX_INLINE_OWNERS ? owners.length - COLLAPSED_INLINE_OWNERS : 0
  const shown = overflow > 0 ? owners.slice(0, COLLAPSED_INLINE_OWNERS) : owners
  const [checkingIn, setCheckingIn] = useState(false)
  // Codex review finding (per-kr-checkin, round 1): CheckInHistory owns its
  // own fetch internally and had no way to know a new check-in was just
  // saved, so it kept showing stale ("No check-ins yet") data until the
  // whole dialog was reopened. Bumping this on save and keying the history
  // block by it forces a clean remount -> fresh fetch, without needing an
  // imperative refetch handle threaded back out of CheckInHistory.
  const [historyVersion, setHistoryVersion] = useState(0)

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
        {!readOnly && <RowActionButton label="Edit" onClick={onEdit} />}
      </div>
      {allowCheckIn && (
        <>
          <CheckInHistory
            key={historyVersion}
            individualObjectiveId={individualObjectiveId}
            keyResultId={kr.id}
            summary={summary}
            summaryStatus={summaryStatus}
            canAskQuestion={viewMode === 'manager'}
          />
          {!checkingIn && (
            <RowActionButton label="Check-in" onClick={() => setCheckingIn(true)} />
          )}
          {checkingIn && (
            <CheckInPanel
              individualObjectiveId={individualObjectiveId}
              keyResultId={kr.id}
              onSaved={() => {
                onCheckInSaved?.()
                setHistoryVersion(v => v + 1)
              }}
              onDone={() => setCheckingIn(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

export default function KrListInline({
  objectiveId,
  individualObjectiveId,
  keyResults,
  onCheckInSaved,
  onKrSaved,
  readOnly = false,
  allowCheckIn = false,
  viewMode,
}) {
  const [krFormMode, setKrFormMode] = useState(null)
  const { create, update } = useKrMutation()
  // Called once per objective, not once per KR — see the note on
  // CheckInHistory's props for why (Codex review finding, per-kr-checkin).
  // Safe to call unconditionally: useKrSummary no-ops when its id is null
  // (the company/Map case, where individualObjectiveId is never set).
  const { summary, status: summaryStatus } = useKrSummary(individualObjectiveId)

  async function handleKrSave({ title, targetNote }) {
    let ok
    if (krFormMode?.kind === 'add') {
      ok = await create({
        objectiveId,
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
    <>
      {keyResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {keyResults.map(kr => (
            !readOnly && krFormMode?.kind === 'edit' && krFormMode.krId === kr.id ? (
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
                individualObjectiveId={individualObjectiveId}
                viewMode={viewMode}
                allowCheckIn={allowCheckIn}
                summary={summary}
                summaryStatus={summaryStatus}
                onCheckInSaved={onCheckInSaved}
                onEdit={() => setKrFormMode({ kind: 'edit', krId: kr.id })}
                readOnly={readOnly}
              />
            )
          ))}
        </div>
      )}
      {!readOnly && (
        krFormMode?.kind === 'add' ? (
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
        )
      )}
    </>
  )
}
