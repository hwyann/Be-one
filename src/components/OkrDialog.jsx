import { useState } from 'react'
import { supabase } from '../lib/supabase'
import ObjectiveCard from './ObjectiveCard'
import CoachPanel from './CoachPanel'
import { KrForm } from './KrListInline'
import useRationale from '../hooks/useRationale'
import useKrMutation from '../hooks/useKrMutation'

// The parent column (see OkrMapPage.jsx's my-thread split view) now owns
// this panel's width/position — it's rendered inline as a sibling of the
// My Thread list, not a fixed full-viewport drawer (split-view-review-all).
const cardStyle = {
  width: '100%',
  maxHeight: 'calc(100vh - 48px)',
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
  boxShadow: '0 1px 3px rgba(19,30,40,.06)',
  padding: '18px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  overflowY: 'auto',
}

function closeButtonStyle() {
  return {
    alignSelf: 'flex-end',
    font: '600 16px var(--font-display)',
    lineHeight: 1,
    padding: '4px 8px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
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
  return { title: '', link: '', krTitle: '', krTargetNote: '', draftKrs: [], showKrForm: false }
}

// Inverse of parseLink — reconstructs the <select> value from a persisted
// individual_objectives row, so a reloaded draft (#B18) shows its original
// alignment instead of the placeholder option. Only objective-level links
// are selectable going forward (#B26); any pre-existing direct_kr row is
// migrated to objective_level in the database rather than special-cased
// here (see story-tracker.md B26).
function formatLink(o) {
  if (o.linked_company_objective_id) {
    return `objective_level:${o.linked_company_objective_id}`
  }
  return ''
}

// Rehydrates the viewer's saved-but-not-yet-confirmed objectives into the
// draft-editing shape, so re-opening "+ Add objective" resumes a draft
// instead of starting blank (#B18). Existing key results are flagged
// `existing: true` — they're already persisted, so the KR list shows them
// without a Remove control and the save loop doesn't re-create them.
function draftsFromExisting(existingDrafts) {
  if (!existingDrafts || existingDrafts.length === 0) return [emptyDraft()]
  return existingDrafts.map(o => ({
    id: o.id,
    title: o.title,
    link: formatLink(o),
    // The inline compulsory KR fields (#B32) always start blank on reload
    // — a draft's already-saved key results stay in draftKrs below
    // (editable via the existing Edit affordance), which already
    // satisfies the "at least one KR" requirement on its own.
    krTitle: '',
    krTargetNote: '',
    draftKrs: (o.key_results ?? []).map(kr => ({
      id: kr.id,
      title: kr.title,
      targetNote: kr.target_note ?? '',
      existing: true,
    })),
    showKrForm: false,
  }))
}

function ObjectiveDraftFields({ draft, index, companyObjectives, onChange, onRemove, onEditExistingKr }) {
  const [editingKrIndex, setEditingKrIndex] = useState(null)

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
        {/* Members can only align at the objective level now (#B26) — the
            old per-KR "direct_kr" sub-options are gone, so this is a flat
            list of company objectives rather than an <optgroup> per
            objective with its KRs nested underneath. */}
        <select
          id={`okr-link-${index}`}
          value={draft.link}
          onChange={(e) => onChange({ link: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select alignment…</option>
          {companyObjectives.map((obj) => (
            <option key={obj.id} value={`objective_level:${obj.id}`}>{obj.title}</option>
          ))}
        </select>
      </label>
      {/* A key result is compulsory (save is blocked without at least one),
          so its fields are always-visible inputs here (#B32), typed
          directly like Objective/Aligns-with above — no "+ Add key
          result" click needed to even find where to type one. Only a
          genuine *second* (optional) KR still goes through the dashed
          button below, now relabeled "+ Add another key result". */}
      <label htmlFor={`okr-kr-title-${index}`} style={labelStyle}>
        Key result
        <input
          id={`okr-kr-title-${index}`}
          value={draft.krTitle}
          onChange={(e) => onChange({ krTitle: e.target.value })}
          style={inputStyle}
        />
      </label>
      <label htmlFor={`okr-kr-target-note-${index}`} style={labelStyle}>
        Target note (optional)
        <input
          id={`okr-kr-target-note-${index}`}
          value={draft.krTargetNote}
          onChange={(e) => onChange({ krTargetNote: e.target.value })}
          style={inputStyle}
        />
      </label>
      {draft.draftKrs.length > 0 && (
        <ul style={draftKrListStyle}>
          {draft.draftKrs.map((kr, i) => (
            editingKrIndex === i ? (
              <KrForm
                key={i}
                initialTitle={kr.title}
                initialTargetNote={kr.targetNote}
                submitLabel="Save"
                onSubmit={(values) => {
                  onEditExistingKr(i, values)
                  setEditingKrIndex(null)
                }}
                onCancel={() => setEditingKrIndex(null)}
              />
            ) : (
              <li key={i} style={draftKrItemStyle}>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  {kr.title}
                  {kr.targetNote && (
                    <span style={{ font: '400 11px var(--font-sans)', color: 'var(--text-muted)' }}>
                      {kr.targetNote}
                    </span>
                  )}
                </span>
                {kr.existing ? (
                  <button type="button" onClick={() => setEditingKrIndex(i)} style={secondaryButtonStyle()}>
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onChange({ draftKrs: draft.draftKrs.filter((_, idx) => idx !== i) })}
                    style={secondaryButtonStyle()}
                  >
                    Remove
                  </button>
                )}
              </li>
            )
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
          + Add another key result
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
  existingDrafts = [],
  viewMode,
  managerReview = false,
  onSave,
  onClose,
  onKrSaved,
}) {
  const [title, setTitle] = useState(objective?.title ?? '')
  const [error, setError] = useState(null)
  const [showCoach, setShowCoach] = useState(false)
  const [coachAnswers, setCoachAnswers] = useState({})
  const [objectiveDrafts, setObjectiveDrafts] = useState(() => draftsFromExisting(existingDrafts))
  const { save: saveRationale } = useRationale(null)
  const { create: createKr, update: updateKr } = useKrMutation()
  // Manager reading a member's OKR (#B27 follow-up) reuses this same "just
  // like the member's card detail view" dialog chrome, always in its
  // confirmed/read-only shape — Coach me, the editable title input, and
  // the draft/confirm footer never apply to it, same as a genuinely
  // confirmed objective.
  const isConfirmedObjective = !!objective && (objective.status === 'confirmed' || managerReview)

  function updateDraft(index, patch) {
    setObjectiveDrafts(drafts => drafts.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function addDraft() {
    setObjectiveDrafts(drafts => [...drafts, emptyDraft()])
  }

  function removeDraft(index) {
    setObjectiveDrafts(drafts => drafts.filter((_, i) => i !== index))
  }

  // Edits an already-persisted key result on a reloaded draft (#B21) —
  // unlike a freshly-added one, it exists in Supabase already, so this
  // updates it in place via useKrMutation.update rather than local-only
  // state, then reflects the new title/note back into the draft.
  async function handleEditExistingKr(draftIndex, krIndex, { title: krTitle, targetNote }) {
    const draft = objectiveDrafts[draftIndex]
    const kr = draft.draftKrs[krIndex]
    const ok = await updateKr({ id: kr.id, title: krTitle, targetNote })
    if (!ok) {
      setError(`Failed to update key result: "${kr.title}".`)
      return
    }
    updateDraft(draftIndex, {
      draftKrs: draft.draftKrs.map((k, i) => (i === krIndex ? { ...k, title: krTitle, targetNote } : k)),
    })
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
      if (!draft.krTitle.trim() && draft.draftKrs.length === 0) {
        setError('At least one key result is required')
        return
      }
      parsedDrafts.push({ draft, linkFields })
    }

    const savedObjectives = []
    for (const { draft, linkFields } of parsedDrafts) {
      const query = draft.id
        ? supabase
            .from('individual_objectives')
            .update({ title: draft.title, status, link_type: linkFields.link_type, linked_company_objective_id: linkFields.linked_company_objective_id, key_result_id: linkFields.key_result_id ?? null })
            .eq('id', draft.id)
            .select()
        : supabase
            .from('individual_objectives')
            .insert([{ title: draft.title, quarter_id: quarterId, owner_name: 'Satoshi Kimura', status, ...linkFields }])
            .select()

      const { data, error: err } = await query
      if (err) {
        setError(err.message)
        return
      }
      const savedObjective = data[0]
      savedObjectives.push(savedObjective)

      const krsToSave = draft.krTitle.trim()
        ? [{ title: draft.krTitle.trim(), targetNote: draft.krTargetNote }, ...draft.draftKrs]
        : draft.draftKrs
      for (const kr of krsToSave) {
        if (kr.existing) continue
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
      {!mandatory && (
        <button type="button" onClick={onClose} aria-label="Close" style={closeButtonStyle()}>×</button>
      )}
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
        isConfirmedObjective ? (
          <div style={labelStyle}>
            Objective
            <div style={{ font: '600 13px var(--font-sans)', color: 'var(--ink-900)', padding: '7px 0' }}>
              {title}
            </div>
          </div>
        ) : (
          <label htmlFor="okr-title" style={labelStyle}>
            Objective
            <input
              id="okr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </label>
        )
      ) : (
        <>
          {objectiveDrafts.map((draft, index) => (
            <ObjectiveDraftFields
              key={index}
              draft={draft}
              index={index}
              companyObjectives={companyObjectives}
              onChange={(patch) => updateDraft(index, patch)}
              onRemove={index > 0 && !draft.id ? () => removeDraft(index) : null}
              onEditExistingKr={(krIndex, values) => handleEditExistingKr(index, krIndex, values)}
            />
          ))}
          <button type="button" onClick={addDraft} style={addObjectiveButtonStyle()}>
            + Add another objective
          </button>
        </>
      )}
      {!isConfirmedObjective && (
        <button type="button" onClick={() => setShowCoach(true)} style={secondaryButtonStyle()}>
          Coach me
        </button>
      )}
      {showCoach && (
        <CoachPanel onSkip={() => setShowCoach(false)} onAnswersChange={setCoachAnswers} />
      )}
      {objective && (
        <ObjectiveCard
          objective={objective}
          individualObjectiveId={objective.id}
          onKrSaved={onKrSaved}
          readOnly={isConfirmedObjective}
          viewMode={viewMode}
          managerReview={managerReview}
        />
      )}
      {!isConfirmedObjective && (
        <div style={footerRowStyle}>
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
      )}
    </div>
  )
}

// Members can only align to a company Objective as a whole now (#B26) — the
// old "direct_kr" variant (linking straight to one of the company's KRs) has
// been removed; the select never offers it, so this only ever needs to
// parse the objective_level shape.
function parseLink(value) {
  if (!value) return null
  const parts = value.split(':')
  if (parts[0] === 'objective_level' && parts[1]) {
    return { link_type: 'objective_level', linked_company_objective_id: parts[1] }
  }
  return null
}
