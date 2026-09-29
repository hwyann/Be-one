import { useState } from 'react'
import useKrMutation from '../hooks/useKrMutation'
import useKrSummary from '../hooks/useKrSummary'
import CheckInPanel from './CheckInPanel'
import CheckInHistory, { SummaryBlock } from './CheckInHistory'

// The member-avatar cluster used to live here, per KR row, sourced from
// kr.individual_objectives (the old direct-KR link). Members can only align
// to a whole company Objective now (#B26), so the cluster moved up to
// ObjectiveCard (one per objective, not one per KR) — see Avatar/
// initialsFor there.

// Manager's read-only view of a member's OKR (#B27 follow-up) shows the
// same summary-then-history structure as the member's own card, but the
// raw check-in entries default collapsed behind this arrow toggle instead
// of always being shown — "opt in" to the details rather than seeing them
// by default. The AI summary itself is unaffected and always visible.
function HistoryToggle({ individualObjectiveId, keyResultId, canAskQuestion }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          font: '600 11px var(--font-sans)',
          color: 'var(--text-secondary)',
          border: 'none',
          background: 'transparent',
          padding: '4px 0',
          cursor: 'pointer',
        }}
      >
        <span aria-hidden="true" style={{
          display: 'inline-block',
          transition: 'transform 120ms',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>▸</span>
        History
      </button>
      {open && (
        <CheckInHistory
          individualObjectiveId={individualObjectiveId}
          keyResultId={keyResultId}
          canAskQuestion={canAskQuestion}
        />
      )}
    </div>
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
  kr, individualObjectiveId, viewMode, allowCheckIn, managerReview, summary, summaryStatus,
  onCheckInSaved, onEdit, readOnly,
}) {
  const [checkingIn, setCheckingIn] = useState(false)
  // Codex review finding (per-kr-checkin, round 1): CheckInHistory owns its
  // own fetch internally and had no way to know a new check-in was just
  // saved, so it kept showing stale ("No check-ins yet") data until the
  // whole dialog was reopened. Bumping this on save and keying the history
  // block by it forces a clean remount -> fresh fetch, without needing an
  // imperative refetch handle threaded back out of CheckInHistory.
  const [historyVersion, setHistoryVersion] = useState(0)
  // Summary + history show for the viewer's own KR (allowCheckIn) AND for
  // a Manager's read-only view of a member's KR (managerReview) — the two
  // differ only in whether the Check-in trigger itself appears (#B27).
  const showKrDetail = allowCheckIn || managerReview

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
        {!readOnly && <RowActionButton label="Edit" onClick={onEdit} />}
      </div>
      {showKrDetail && (
        <>
          <SummaryBlock status={summaryStatus} summary={summary} />
          {allowCheckIn && !checkingIn && (
            <RowActionButton label="Check-in" onClick={() => setCheckingIn(true)} />
          )}
          {allowCheckIn && checkingIn && (
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
          {managerReview ? (
            <HistoryToggle
              individualObjectiveId={individualObjectiveId}
              keyResultId={kr.id}
              canAskQuestion={viewMode === 'manager'}
            />
          ) : (
            <CheckInHistory
              key={historyVersion}
              individualObjectiveId={individualObjectiveId}
              keyResultId={kr.id}
              canAskQuestion={viewMode === 'manager'}
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
  managerReview = false,
  viewMode,
}) {
  const [krFormMode, setKrFormMode] = useState(null)
  const { create, update } = useKrMutation()
  // Called once per objective, not once per KR — see the note on
  // CheckInHistory's props for why (Codex review finding, per-kr-checkin).
  // Safe to call unconditionally: useKrSummary no-ops when its id is null
  // (the company/Map case, where individualObjectiveId is never set).
  const { summary, status: summaryStatus, refetch: refetchSummary } = useKrSummary(individualObjectiveId)

  // Codex review finding (per-kr-checkin, round 2): the per-KR history
  // block already remounts on its own save (see historyVersion in KrRow),
  // but the summary lives up here — one save changing an objective from
  // e.g. 2 to 3 check-ins (crossing the "enough data" threshold) needs the
  // summary itself refetched too, not just the history list. Every KrRow's
  // onCheckInSaved routes through here so any KR's save refreshes the one
  // shared, objective-level summary.
  function handleAnyCheckInSaved() {
    onCheckInSaved?.()
    refetchSummary()
  }

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
                managerReview={managerReview}
                summary={summary}
                summaryStatus={summaryStatus}
                onCheckInSaved={handleAnyCheckInSaved}
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
