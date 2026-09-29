import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { KrForm } from './KrListInline'
import useKrMutation from '../hooks/useKrMutation'

// Same dialog chrome as OkrDialog.jsx's create-mode (split-view right
// panel, not a full-viewport modal) — kept as separate local style objects
// rather than importing from OkrDialog since the two forms diverge enough
// (no alignment select, a Category field instead, no draft/confirm split)
// that sharing the component itself would add more branching than it
// saves. See story-tracker.md #B30 for why this exists at all: there was
// previously no UI anywhere to create a company objective from scratch —
// only "+ New quarter"'s clone-from-previous-quarter path (useCreateQuarter.js).
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

const headingStyle = {
  font: '700 16px var(--font-display)',
  color: 'var(--ink-900)',
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
  return { title: '', category: '', draftKrs: [], showKrForm: false }
}

function CompanyObjectiveDraftFields({ draft, index, onChange, onRemove }) {
  return (
    <div style={draftSectionStyle}>
      {onRemove && (
        <div style={draftHeaderRowStyle}>
          <span style={draftHeadingStyle}>Objective {index + 1}</span>
          <button type="button" onClick={onRemove} style={secondaryButtonStyle()}>Remove</button>
        </div>
      )}
      <label htmlFor={`co-title-${index}`} style={labelStyle}>
        Objective
        <input
          id={`co-title-${index}`}
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          style={inputStyle}
        />
      </label>
      <label htmlFor={`co-category-${index}`} style={labelStyle}>
        Category (optional)
        <input
          id={`co-category-${index}`}
          value={draft.category}
          onChange={(e) => onChange({ category: e.target.value })}
          placeholder="e.g. Growth, Retention, Delivery"
          style={inputStyle}
        />
      </label>
      {draft.draftKrs.length > 0 && (
        <ul style={draftKrListStyle}>
          {draft.draftKrs.map((kr, i) => (
            <li key={i} style={draftKrItemStyle}>
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                {kr.title}
                {kr.targetNote && (
                  <span style={{ font: '400 11px var(--font-sans)', color: 'var(--text-muted)' }}>
                    {kr.targetNote}
                  </span>
                )}
              </span>
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

// Manager-only (gated by the caller, OkrMapPage) form for setting the
// Company OKR when the active quarter has none yet (#B30). Unlike
// OkrDialog's individual-objective flow, there's no draft/confirm split
// (company_objectives has no such concept) and no alignment select
// (nothing for a company objective to align to) — just title, an optional
// category, and one or more key results, saved directly on a single click.
export default function CompanyOkrDialog({ quarterId, quarterName, onSaved, onClose }) {
  const [objectiveDrafts, setObjectiveDrafts] = useState([emptyDraft()])
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
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

  async function handleSave() {
    if (!quarterId) return
    if (objectiveDrafts.some(d => !d.title.trim())) {
      setError('Every objective needs a title.')
      return
    }
    if (objectiveDrafts.some(d => d.draftKrs.length === 0)) {
      setError('At least one key result is required for each objective.')
      return
    }

    setSaving(true)
    setError(null)
    const saved = []
    for (const draft of objectiveDrafts) {
      const { data, error: err } = await supabase
        .from('company_objectives')
        .insert([{
          quarter_id: quarterId,
          title: draft.title.trim(),
          category: draft.category.trim() || null,
          status: 'not_started',
        }])
        .select()

      if (err) {
        setError(err.message)
        setSaving(false)
        return
      }
      const companyObjective = data[0]
      saved.push(companyObjective)

      for (const kr of draft.draftKrs) {
        const ok = await createKr({
          objectiveId: companyObjective.id,
          title: kr.title,
          targetNote: kr.targetNote,
        })
        if (!ok) {
          setError(
            `Objective saved, but a key result failed to save: "${kr.title}". Please retry before closing.`
          )
          setSaving(false)
          return
        }
      }
    }

    setSaving(false)
    onSaved?.(saved)
  }

  return (
    <div role="dialog" aria-label="Set Company OKR" style={cardStyle}>
      <button type="button" onClick={onClose} aria-label="Close" style={closeButtonStyle()}>×</button>
      <div style={headingStyle}>
        Set Company OKR{quarterName ? ` for ${quarterName}` : ''}
      </div>
      {error && (
        <div role="alert" style={{ font: '500 11px var(--font-sans)', color: 'var(--behind)' }}>
          {error}
        </div>
      )}
      {objectiveDrafts.map((draft, index) => (
        <CompanyObjectiveDraftFields
          key={index}
          draft={draft}
          index={index}
          onChange={(patch) => updateDraft(index, patch)}
          onRemove={index > 0 ? () => removeDraft(index) : null}
        />
      ))}
      <button type="button" onClick={addDraft} style={addObjectiveButtonStyle()}>
        + Add another objective
      </button>
      <div style={footerRowStyle}>
        <button type="button" onClick={handleSave} disabled={saving} style={primaryButtonStyle()}>
          Save
        </button>
      </div>
    </div>
  )
}
