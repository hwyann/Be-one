import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Codex review finding (per-kr-checkin, round 1): check-ins created before
// this change all have key_result_id = NULL — the old save path only ever
// wrote individual_objective_id. Filtering strictly on key_result_id would
// silently drop every pre-existing check-in from history the moment this
// ships. Instead, scope to the objective (safety net) and match either
// this specific KR or a legacy (unscoped) row. A legacy row shows up under
// every KR card of a multi-KR objective — it can't be disambiguated after
// the fact — but that only ever applies to the fixed set of check-ins that
// predate KR scoping; every new check-in always carries a real key_result_id.
export default function useCheckInHistory(individualObjectiveId, keyResultId) {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(individualObjectiveId != null && keyResultId != null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (individualObjectiveId == null || keyResultId == null) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('check_ins')
      .select('id, status, note, plan_next, created_at')
      .eq('individual_objective_id', individualObjectiveId)
      .or(`key_result_id.eq.${keyResultId},key_result_id.is.null`)
      .order('created_at', { ascending: false })

    if (err) { setError(err.message); setCheckIns([]) }
    else { setCheckIns(data); setError(null) }
    setLoading(false)
  }, [individualObjectiveId, keyResultId])

  useEffect(() => { load() }, [load])

  return { checkIns, loading, error, refetch: load }
}
