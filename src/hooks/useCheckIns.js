import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useCheckIns() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const save = useCallback(async ({ individualObjectiveId, status, note, planNext }) => {
    setSaving(true)
    const { error: err } = await supabase.from('check_ins').insert({
      individual_objective_id: individualObjectiveId,
      status,
      note,
      plan_next: planNext,
    })
    setSaving(false)
    if (err) { setError(err.message); return false }
    setError(null)
    return true
  }, [])

  return { save, saving, error }
}
