import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Distinct from useCompanyObjectiveStatus (which targets company_objectives)
// and from individual_objectives' own `status` column (draft/confirmed,
// #B17) -- this writes the traffic-light on_track/at_risk/behind value into
// individual_objectives.progress_status (#B29 / migration 0012). Before
// this hook existed, a member's own status editor called
// useCompanyObjectiveStatus with an individual_objectives id, which wrote
// to the wrong table entirely and silently affected zero rows.
export default function useIndividualObjectiveStatus() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const update = useCallback(async ({ id, status }) => {
    setSaving(true)
    const { error: err } = await supabase
      .from('individual_objectives')
      .update({ progress_status: status })
      .eq('id', id)
    setSaving(false)
    if (err) { setError(err.message); return false }
    setError(null)
    return true
  }, [])

  return { update, saving, error }
}
