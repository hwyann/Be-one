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

export default function OkrDialog({
  quarterId,
  objective = null,
  companyObjectives = [],
  onSave,
  onClose,
  onKrSaved,
}) {
  const [title, setTitle] = useState(objective?.title ?? '')
  const [link, setLink] = useState('')
  const [error, setError] = useState(null)
  const [showCoach, setShowCoach] = useState(false)
  const [coachAnswers, setCoachAnswers] = useState({})
  const [draftKrs, setDraftKrs] = useState([])
  const [showDraftKrForm, setShowDraftKrForm] = useState(false)
  const [checkInMode, setCheckInMode] = useState(null)
  const { save: saveRationale } = useRationale(null)
  const { create: createKr } = useKrMutation()

  async function handleSave() {
    if (!title.trim()) return

    let query
    if (objective) {
      query = supabase.from('individual_objectives').update({ title }).eq('id', objective.id).select()
    } else {
      if (!quarterId) return
      const linkFields = parseLink(link)
      if (!linkFields) {
        setError('A company objective link is required')
        return
      }
      if (draftKrs.length === 0) {
        setError('At least one key result is required')
        return
      }
      query = supabase
        .from('individual_objectives')
        .insert([{ title, quarter_id: quarterId, owner_name: 'Satoshi Kimura', ...linkFields }])
        .select()
    }

    const { data, error: err } = await query
    if (err) {
      setError(err.message)
      return
    }
    const savedObjective = data[0]
    if (!objective) {
      for (const kr of draftKrs) {
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
      await saveRationale({ targetId: savedObjective.id, answers: coachAnswers })
    }
    onSave(savedObjective)
  }

  return (
    <div role="dialog" style={cardStyle}>
      {error && (
        <div role="alert" style={{ font: '500 11px var(--font-sans)', color: 'var(--behind)' }}>
          {error}
        </div>
      )}
      <label htmlFor="okr-title" style={labelStyle}>
        Objective
        <input
          id="okr-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
      </label>
      {!objective && (
        <>
          <label htmlFor="okr-link" style={labelStyle}>
            Aligns with
            <select
              id="okr-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
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
          {draftKrs.length > 0 && (
            <ul style={draftKrListStyle}>
              {draftKrs.map((kr, i) => (
                <li key={i} style={draftKrItemStyle}>
                  <span>{kr.title}</span>
                  <button
                    type="button"
                    onClick={() => setDraftKrs(draftKrs.filter((_, idx) => idx !== i))}
                    style={secondaryButtonStyle()}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showDraftKrForm ? (
            <KrForm
              submitLabel="Add"
              onSubmit={({ title: krTitle, targetNote }) => {
                setDraftKrs([...draftKrs, { title: krTitle, targetNote }])
                setShowDraftKrForm(false)
              }}
              onCancel={() => setShowDraftKrForm(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowDraftKrForm(true)}
              style={{
                marginTop: '2px',
                font: '600 12px var(--font-display)',
                padding: '7px 10px',
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
        <button type="button" onClick={onClose} style={secondaryButtonStyle()}>Cancel</button>
        <button type="button" onClick={handleSave} style={primaryButtonStyle()}>Save</button>
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
