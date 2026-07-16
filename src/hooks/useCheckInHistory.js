import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useCheckInHistory(individualObjectiveId) {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(individualObjectiveId != null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (individualObjectiveId == null) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('check_ins')
      .select('id, status, note, plan_next, created_at')
      .eq('individual_objective_id', individualObjectiveId)
      .order('created_at', { ascending: true })

    if (err) { setError(err.message); setCheckIns([]) }
    else { setCheckIns(data); setError(null) }
    setLoading(false)
  }, [individualObjectiveId])

  useEffect(() => { load() }, [load])

  return { checkIns, loading, error, refetch: load }
}
