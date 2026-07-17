import { useState } from 'react'
import { supabase } from '../lib/supabase'
import ObjectiveCard from './ObjectiveCard'

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
    onSave(data[0])
  }

  return (
    <div role="dialog">
      {error && <div role="alert">{error}</div>}
      <label htmlFor="okr-title">Objective</label>
      <input
        id="okr-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {!objective && (
        <>
          <label htmlFor="okr-link">Aligns with</label>
          <select
            id="okr-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
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
        </>
      )}
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
      {objective && (
        <ObjectiveCard
          objective={objective}
          individualObjectiveId={objective.id}
          onKrSaved={onKrSaved}
        />
      )}
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
