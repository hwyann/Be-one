import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useCheckInHistory(keyResultId) {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(keyResultId != null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (keyResultId == null) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('check_ins')
      .select('id, status, note, plan_next, created_at')
      .eq('key_result_id', keyResultId)
      .order('created_at', { ascending: true })

    if (err) { setError(err.message); setCheckIns([]) }
    else { setCheckIns(data); setError(null) }
    setLoading(false)
  }, [keyResultId])

  useEffect(() => { load() }, [load])

  return { checkIns, loading, error, refetch: load }
}
