import { useState } from 'react'
import StatusEditor from './StatusEditor'
import KrListInline from './KrListInline'
import RationaleSection from './RationaleSection'
import { STATUS_BY_VALUE } from '../lib/statuses'
import useRationale from '../hooks/useRationale'

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
// rather than part of the company card's own content.
function MemberOkrPanel({ members }) {
  return (
    <div
      role="group"
      aria-label="Member OKRs"
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}
    >
      {members.map(member => (
        <div key={member.id} style={{
          background: 'var(--panel)',
          border: '1px solid var(--hairline)',
          borderRadius: '12px',
          padding: '10px 12px',
        }}>
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

export default function ObjectiveCard({
  objective,
  individualObjectiveId,
  onCheckInSaved,
  onStatusSaved,
  onKrSaved,
  readOnly = false,
  viewMode,
}) {
  const { id, category, title, status } = objective
  const isCompany = !individualObjectiveId
  const noEdit = isCompany || readOnly
  // Check-in stays available on a confirmed individual objective — that's
  // the entire point of confirming (#B19: "only can check in on progress")
  // — even though noEdit/readOnly is true for a confirmed objective. It
  // must still be fully absent for a company objective (Map context)
  // regardless of anything else, so this tracks !isCompany, not !readOnly.
  const allowCheckIn = !isCompany
  const statusMeta = status
    ? (STATUS_BY_VALUE[status] ?? { label: status, color: 'var(--text-muted)' })
    : null
  const keyResults = objective.key_results ?? []
  const [editingStatus, setEditingStatus] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const { rationale } = useRationale(id)
  const isManager = viewMode === 'manager'
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
          noEdit ? (
            <span
              title={statusMeta.label}
              style={{
                width: '14px',
                height: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: statusMeta.color,
                display: 'inline-block',
              }} />
            </span>
          ) : (
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
          )
        )}
      </div>
      {!noEdit && editingStatus && (
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
        readOnly={noEdit}
        allowCheckIn={allowCheckIn}
        viewMode={viewMode}
      />
      <RationaleSection rationale={rationale} />
    </div>
    {isCompany && isManager && showMembers && linkedMembers.length > 0 && (
      <MemberOkrPanel members={linkedMembers} />
    )}
    </>
  )
}
