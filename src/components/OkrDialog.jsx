import { useState } from 'react'
import { supabase } from '../lib/supabase'
import ObjectiveCard from './ObjectiveCard'
import CoachPanel from './CoachPanel'
import CheckInPanel from './CheckInPanel'
import CheckInHistory from './CheckInHistory'
import { KrForm } from './KrListInline'
import useRationale from '../hooks/useRationale'
import useKrMutation from '../hooks/useKrMutation'

const cardStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(19,30,40,.06)',
  padding: '18px',
  maxWidth: '480px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxHeight: '85vh',
  overflowY: 'auto',
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  font: '600 11px var(--font-sans)',
  color: 'var(--text-secondary)',
}

const inputStyle = {
  font: '500 13px var(--font-sans)',
  padding: '7px 10px',
  border: '1px solid var(--hairline)',
  borderRadius: '8px',
  background: 'var(--surface)',
  color: 'var(--ink-900)',
}

function primaryButtonStyle() {
  return {
    font: '600 12px var(--font-display)',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid var(--coral-800)',
    background: 'var(--coral-700)',
    color: 'var(--surface)',
    cursor: 'pointer',
  }
}

function secondaryButtonStyle() {
  return {
    font: '600 12px var(--font-display)',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid var(--hairline)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
}

const draftKrListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
}

const draftKrItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  padding: '6px 10px',
  border: '1px solid var(--hairline)',
  borderRadius: '8px',
  font: '500 12px var(--font-sans)',
  color: 'var(--text-secondary)',
}

const footerRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '4px',
}

function pillButtonStyle() {
  return {
    font: '500 11px var(--font-sans)',
    padding: '4px 8px',
    borderRadius: '999px',
    border: '1px solid var(--hairline)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
}

function dashedButtonStyle() {
  return {
    marginTop: '2px',
    font: '600 12px var(--font-display)',
    padding: '7px 10px',
    borderRadius: '8px',
    border: '1px dashed var(--hairline)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    width: '100%',
  }
}

function addObjectiveButtonStyle() {
  return {
    font: '600 12px var(--font-display)',
    padding: '9px 10px',
    borderRadius: '8px',
    border: '1px dashed var(--coral-700)',
    background: 'transparent',
    color: 'var(--coral-700)',
    cursor: 'pointer',
    width: '100%',
  }
}

const draftSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  paddingBottom: '10px',
  borderBottom: '1px solid var(--hairline)',
}

const draftHeaderRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const draftHeadingStyle = {
  font: '700 10px var(--font-display)',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
}

function emptyDraft() {
  return { title: '', link: '', draftKrs: [], showKrForm: false }
}

function ObjectiveDraftFields({ draft, index, companyObjectives, onChange, onRemove }) {
  return (
    <div style={draftSectionStyle}>
      {onRemove && (
        <div style={draftHeaderRowStyle}>
          <span style={draftHeadingStyle}>Objective {index + 1}</span>
          <button type="button" onClick={onRemove} style={secondaryButtonStyle()}>Remove</button>
        </div>
      )}
      <label htmlFor={`okr-title-${index}`} style={labelStyle}>
        Objective
        <input
          id={`okr-title-${index}`}
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          style={inputStyle}
        />
      </label>
      <label htmlFor={`okr-link-${index}`} style={labelStyle}>
        Aligns with
        <select
          id={`okr-link-${index}`}
          value={draft.link}
          onChange={(e) => onChange({ link: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select alignment…</option>
          {companyObjectives.map((obj) => (
            <optgroup key={obj.id} label={obj.title}>
              <option value={`objective_level:${obj.id}`}>{obj.title} (objective)</option>
              {(obj.key_results ?? []).map((kr) => (
                <option key={kr.id} value={`direct_kr:${kr.id}:${obj.id}`}>
                  {kr.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      {draft.draftKrs.length > 0 && (
        <ul style={draftKrListStyle}>
          {draft.draftKrs.map((kr, i) => (
            <li key={i} style={draftKrItemStyle}>
              <span>{kr.title}</span>
              <button
                type="button"
                onClick={() => onChange({ draftKrs: draft.draftKrs.filter((_, idx) => idx !== i) })}
                style={secondaryButtonStyle()}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {draft.showKrForm ? (
        <KrForm
          submitLabel="Add"
          onSubmit={({ title: krTitle, targetNote }) => {
            onChange({ draftKrs: [...draft.draftKrs, { title: krTitle, targetNote }], showKrForm: false })
          }}
          onCancel={() => onChange({ showKrForm: false })}
        />
      ) : (
        <button type="button" onClick={() => onChange({ showKrForm: true })} style={dashedButtonStyle()}>
          + Add key result
        </button>
      )}
    </div>
  )
}

export default function OkrDialog({
  quarterId,
  quarterName,
  objective = null,
  companyObjectives = [],
  mandatory = false,
  onSave,
  onClose,
  onKrSaved,
}) {
  const [title, setTitle] = useState(objective?.title ?? '')
  const [error, setError] = useState(null)
  const [showCoach, setShowCoach] = useState(false)
  const [coachAnswers, setCoachAnswers] = useState({})
  const [objectiveDrafts, setObjectiveDrafts] = useState([emptyDraft()])
  const [checkInMode, setCheckInMode] = useState(null)
  const { save: saveRationale } = useRationale(null)
  const { create: createKr } = useKrMutation()

  function updateDraft(index, patch) {
    setObjectiveDrafts(drafts => drafts.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function addDraft() {
    setObjectiveDrafts(drafts => [...drafts, emptyDraft()])
  }

  function removeDraft(index) {
    setObjectiveDrafts(drafts => drafts.filter((_, i) => i !== index))
  }

  async function handleEditSave() {
    if (!title.trim()) return
    const { data, error: err } = await supabase
      .from('individual_objectives')
      .update({ title })
      .eq('id', objective.id)
      .select()
    if (err) {
      setError(err.message)
      return
    }
    onSave(data[0])
  }

  async function handleCreateSave(status) {
    if (objectiveDrafts.some(d => !d.title.trim())) return
    if (!quarterId) return

    const parsedDrafts = []
    for (const draft of objectiveDrafts) {
      const linkFields = parseLink(draft.link)
      if (!linkFields) {
        setError('A company objective link is required')
        return
      }
      if (draft.draftKrs.length === 0) {
        setError('At least one key result is required')
        return
      }
      parsedDrafts.push({ draft, linkFields })
    }

    const savedObjectives = []
    for (const { draft, linkFields } of parsedDrafts) {
      const { data, error: err } = await supabase
        .from('individual_objectives')
        .insert([{ title: draft.title, quarter_id: quarterId, owner_name: 'Satoshi Kimura', status, ...linkFields }])
        .select()
      if (err) {
        setError(err.message)
        return
      }
      const savedObjective = data[0]
      savedObjectives.push(savedObjective)

      for (const kr of draft.draftKrs) {
        const ok = await createKr({
          individualObjectiveId: savedObjective.id,
          title: kr.title,
          targetNote: kr.targetNote,
        })
        if (!ok) {
          setError(
            `Objective saved, but a key result failed to save: "${kr.title}". Please retry before closing.`
          )
          return
        }
      }
    }

    if (Object.keys(coachAnswers).length > 0) {
      await saveRationale({ targetId: savedObjectives[0].id, answers: coachAnswers })
    }
    onSave(savedObjectives.length === 1 ? savedObjectives[0] : savedObjectives)
  }

  function handleSave(status) {
    return objective ? handleEditSave() : handleCreateSave(status)
  }

  const confirmLabel = quarterName ? `Confirm OKR for ${quarterName}` : 'Confirm OKR'

  return (
    <div role="dialog" style={cardStyle}>
      {mandatory && !objective && (
        <div style={{ font: '500 12px var(--font-sans)', color: 'var(--text-secondary)' }}>
          Set your OKR{quarterName ? ` for ${quarterName}` : ''} to continue.
        </div>
      )}
      {error && (
        <div role="alert" style={{ font: '500 11px var(--font-sans)', color: 'var(--behind)' }}>
          {error}
        </div>
      )}
      {objective ? (
        <label htmlFor="okr-title" style={labelStyle}>
          Objective
          <input
            id="okr-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </label>
      ) : (
        <>
          {objectiveDrafts.map((draft, index) => (
            <ObjectiveDraftFields
              key={index}
              draft={draft}
              index={index}
              companyObjectives={companyObjectives}
              onChange={(patch) => updateDraft(index, patch)}
              onRemove={index > 0 ? () => removeDraft(index) : null}
            />
          ))}
          <button type="button" onClick={addDraft} style={addObjectiveButtonStyle()}>
            + Add another objective
          </button>
        </>
      )}
      <button type="button" onClick={() => setShowCoach(true)} style={secondaryButtonStyle()}>
        Coach me
      </button>
      {showCoach && (
        <CoachPanel onSkip={() => setShowCoach(false)} onAnswersChange={setCoachAnswers} />
      )}
      {objective && (
        <>
          <ObjectiveCard
            objective={objective}
            individualObjectiveId={objective.id}
            onKrSaved={onKrSaved}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {checkInMode !== 'checkin' && (
              <button
                type="button"
                onClick={() => setCheckInMode(mode => (mode === 'checkin' ? null : 'checkin'))}
                style={pillButtonStyle()}
              >
                Check in
              </button>
            )}
            <button
              type="button"
              onClick={() => setCheckInMode(mode => (mode === 'history' ? null : 'history'))}
              style={pillButtonStyle()}
            >
              History
            </button>
          </div>
          {checkInMode === 'checkin' && (
            <CheckInPanel
              individualObjectiveId={objective.id}
              onDone={() => setCheckInMode(null)}
            />
          )}
          {checkInMode === 'history' && (
            <CheckInHistory individualObjectiveId={objective.id} />
          )}
        </>
      )}
      <div style={footerRowStyle}>
        {!mandatory && (
          <button type="button" onClick={onClose} style={secondaryButtonStyle()}>Cancel</button>
        )}
        {objective ? (
          <button type="button" onClick={() => handleSave()} style={primaryButtonStyle()}>Save</button>
        ) : (
          <>
            <button type="button" onClick={() => handleSave('draft')} style={secondaryButtonStyle()}>
              Save as draft
            </button>
            <button type="button" onClick={() => handleSave('confirmed')} style={primaryButtonStyle()}>
              {confirmLabel}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function parseLink(value) {
  if (!value) return null
  const parts = value.split(':')
  if (parts[0] === 'objective_level' && parts[1]) {
    return { link_type: 'objective_level', linked_company_objective_id: parts[1] }
  }
  if (parts[0] === 'direct_kr' && parts[1] && parts[2]) {
    return {
      link_type: 'direct_kr',
      linked_company_objective_id: parts[2],
      key_result_id: parts[1],
    }
  }
  return null
}
