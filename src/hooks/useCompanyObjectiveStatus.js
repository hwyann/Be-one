import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useCompanyObjectiveStatus() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const update = useCallback(async ({ id, status }) => {
    setSaving(true)
    const { error: err } = await supabase
      .from('company_objectives')
      .update({ status })
      .eq('id', id)
    setSaving(false)
    if (err) { setError(err.message); return false }
    setError(null)
    return true
  }, [])

  return { update, saving, error }
}
