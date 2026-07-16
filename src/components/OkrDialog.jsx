import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function OkrDialog({ quarterId, objective = null, onSave, onClose }) {
  const [title, setTitle] = useState(objective?.title ?? '')
  const [error, setError] = useState(null)

  async function handleSave() {
    if (!title.trim()) return
    if (!objective && !quarterId) return

    const query = objective
      ? supabase.from('individual_objectives').update({ title }).eq('id', objective.id).select()
      : supabase.from('individual_objectives').insert([{ title, quarter_id: quarterId }]).select()
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
      <button onClick={handleSave}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}
