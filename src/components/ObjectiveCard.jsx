import { useState } from 'react'
import StatusEditor from './StatusEditor'
import KrListInline from './KrListInline'
import RationaleSection from './RationaleSection'
import { STATUS_BY_VALUE } from '../lib/statuses'
import useRationale from '../hooks/useRationale'
import useCompanyObjectiveStatus from '../hooks/useCompanyObjectiveStatus'
import useIndividualObjectiveStatus from '../hooks/useIndividualObjectiveStatus'

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

// One cluster per company objective now, not one per KR (#B26 — members
// can only align to a whole Objective, not a specific KR, so there's no
// more per-KR ownership to show). In Member view it's a plain, static
// cluster — "as it is" — same look the per-KR version always had. In
// Manager view it's a real button that toggles the member-OKR panel below
// the card, so Manager gets a way to drill into who's aligned to this
// objective and what they're doing about it.
function MemberAvatarCluster({ members, interactive, expanded, onToggle }) {
  const owners = members.filter(o => o.owner_name)
  const overflow = owners.length > MAX_INLINE_OWNERS ? owners.length - COLLAPSED_INLINE_OWNERS : 0
  const shown = overflow > 0 ? owners.slice(0, COLLAPSED_INLINE_OWNERS) : owners
  if (shown.length === 0 && overflow === 0) return null

  const avatars = (
    <>
      {shown.map((o, i) => (
        <Avatar key={o.id ?? i} text={initialsFor(o.owner_name)} overlap={i > 0} />
      ))}
      {overflow > 0 && <Avatar text={`+${overflow}`} overlap={shown.length > 0} />}
    </>
  )

  if (!interactive) {
    return <div style={{ display: 'flex', flexShrink: 0 }}>{avatars}</div>
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={expanded ? 'Hide member OKRs' : 'Show member OKRs'}
      style={{
        display: 'flex',
        flexShrink: 0,
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      {avatars}
    </button>
  )
}

// Manager-only drill-down (#B26): each linked member's own OKR, shown below
// (not inside) the company card, so it reads as "related to this objective"
// rather than part of the company card's own content. Each row is now also
// clickable (#B27 follow-up) — it opens that member's OKR in a right-side
// detail panel, the same card design used for a member's own "My OKR"
// drill-down (see OkrMapPage's managerReview OkrDialog usage), just with
// checking-in disabled and history collapsed behind an arrow by default.
function MemberOkrPanel({ members, onSelect, selectedId }) {
  return (
    <div
      role="group"
      aria-label="Member OKRs"
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}
    >
      {members.map(member => (
        // A <div role="button">, not a <button> — same reasoning as
        // MyThreadPage's ObjectiveCardRow (#B22): the KR list below is flow
        // content, and a <button> may only contain phrasing content.
        <div
          key={member.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect?.(member)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(member) }
          }}
          style={{
            background: 'var(--panel)',
            border: selectedId === member.id ? '1.5px solid var(--coral-700)' : '1px solid var(--hairline)',
            borderRadius: '12px',
            padding: '10px 12px',
            cursor: 'pointer',
          }}
        >
          <div style={{ font: '700 12px var(--font-display)', color: 'var(--ink-900)' }}>
            {member.title}
          </div>
          <div style={{ font: '500 11px var(--font-sans)', color: 'var(--text-secondary)', marginTop: '1px' }}>
            {member.owner_name}
          </div>
          {(member.key_results ?? []).length > 0 && (
            <ul style={{
              listStyle: 'none', margin: '6px 0 0', padding: 0,
              display: 'flex', flexDirection: 'column', gap: '2px',
            }}>
              {member.key_results.map(kr => (
                <li key={kr.id} style={{ font: '500 11px var(--font-sans)', color: 'var(--text-secondary)' }}>
                  {kr.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

// Status is now a labeled, colored-background badge, not a bare dot
// (#B29), and who can click it to change it depends on which kind of
// objective this is:
//  - Company objective: Manager only, Member sees it read-only.
//  - Individual (member) objective: the member only, Manager sees it
//    read-only (see the Manager's managerReview right-panel view, #B28).
function StatusBadge({ meta, editable, onClick }) {
  const badge = (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 9px',
      borderRadius: '999px',
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      font: '600 11px var(--font-sans)',
      color: meta.text,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: meta.color,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {meta.label}
    </span>
  )

  if (!editable) {
    return <span style={{ flexShrink: 0 }}>{badge}</span>
  }

  return (
    <button
      type="button"
      aria-label={meta.label}
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      {badge}
    </button>
  )
}

export default function ObjectiveCard({
  objective,
  individualObjectiveId,
  onCheckInSaved,
  onStatusSaved,
  onKrSaved,
  readOnly = false,
  viewMode,
  managerReview = false,
  onSelectMember,
  selectedMemberId,
}) {
  const { id, category, title } = objective
  const isCompany = !individualObjectiveId
  const noEdit = isCompany || readOnly
  // Check-in stays available on a confirmed individual objective — that's
  // the entire point of confirming (#B19: "only can check in on progress")
  // — even though noEdit/readOnly is true for a confirmed objective. It
  // must still be fully absent for a company objective (Map context)
  // regardless of anything else, so this tracks !isCompany, not !readOnly.
  // A Manager reading a member's OKR (#B27 follow-up) never gets check-in
  // either, even though this isn't the company Map card itself.
  const allowCheckIn = !isCompany && !managerReview
  // Company objectives keep their traffic-light status on `status`; a
  // member's own OKR keeps it on the separate `progress_status` column
  // (#B29) — `status` on individual_objectives is already the draft/
  // confirmed field from #B17 and must not be overwritten by this.
  const status = isCompany ? objective.status : objective.progress_status
  const statusMeta = status
    ? (STATUS_BY_VALUE[status] ?? { label: status, color: 'var(--text-muted)', bg: 'var(--panel)', text: 'var(--text-secondary)', border: 'var(--hairline)' })
    : null
  const keyResults = objective.key_results ?? []
  const [editingStatus, setEditingStatus] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const { rationale } = useRationale(id)
  const isManager = viewMode === 'manager'
  // Who can click the status badge to change it (#B29): a company
  // objective's status is Manager-only (Member sees it read-only); an
  // individual objective's status is the member's own to set (Manager
  // only ever sees it read-only, e.g. in the #B28 right-panel view).
  // Gated by !readOnly either way — a past quarter (readOnly passed down
  // from ObjectiveCarousel) or a confirmed OKR (#B19) still locks it.
  const canEditStatus = (isCompany ? isManager : viewMode === 'member') && !readOnly
  const { update: updateCompanyStatus, saving: savingCompanyStatus, error: companyStatusError } = useCompanyObjectiveStatus()
  const { update: updateIndividualStatus, saving: savingIndividualStatus, error: individualStatusError } = useIndividualObjectiveStatus()
  const updateStatus = isCompany ? updateCompanyStatus : updateIndividualStatus
  const savingStatus = isCompany ? savingCompanyStatus : savingIndividualStatus
  const statusError = isCompany ? companyStatusError : individualStatusError
  // Draft (unconfirmed) member OKRs stay private, same rule as My Thread
  // (#B18/#B19) — only a confirmed one is "real" enough to surface here.
  const linkedMembers = isCompany
    ? (objective.individual_objectives ?? []).filter(o => o.status === 'confirmed')
    : []

  return (
    <>
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
        {isCompany && (
          <MemberAvatarCluster
            members={linkedMembers}
            interactive={isManager}
            expanded={showMembers}
            onToggle={() => setShowMembers(v => !v)}
          />
        )}
        {statusMeta && (
          // Manager-only company-status editing renders as a small
          // floating tooltip anchored to the badge (#B29 follow-up)
          // instead of pushing the card's content down — needs this
          // relative wrapper for the editor's absolute positioning.
          // A member's own OKR status editor keeps the original inline
          // block below the header row (rendered further down instead).
          <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
            <StatusBadge
              meta={statusMeta}
              editable={canEditStatus}
              onClick={() => setEditingStatus(true)}
            />
            {isCompany && canEditStatus && editingStatus && (
              <StatusEditor
                objectiveId={id}
                currentStatus={status}
                onDone={() => setEditingStatus(false)}
                onSaved={onStatusSaved}
                update={updateStatus}
                saving={savingStatus}
                error={statusError}
                floating
              />
            )}
          </span>
        )}
      </div>
      {!isCompany && canEditStatus && editingStatus && (
        <StatusEditor
          objectiveId={id}
          currentStatus={status}
          onDone={() => setEditingStatus(false)}
          onSaved={onStatusSaved}
          update={updateStatus}
          saving={savingStatus}
          error={statusError}
        />
      )}
      <KrListInline
        objectiveId={individualObjectiveId ? undefined : id}
        individualObjectiveId={individualObjectiveId}
        keyResults={keyResults}
        onCheckInSaved={onCheckInSaved}
        onKrSaved={onKrSaved}
        readOnly={noEdit}
        allowCheckIn={allowCheckIn}
        managerReview={managerReview}
        viewMode={viewMode}
      />
      <RationaleSection rationale={rationale} />
    </div>
    {isCompany && isManager && showMembers && linkedMembers.length > 0 && (
      <MemberOkrPanel members={linkedMembers} onSelect={onSelectMember} selectedId={selectedMemberId} />
    )}
    </>
  )
}
