import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useIndividualObjectives() {
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('individual_objectives')
      .select('id, title')

    if (err) setError(err.message)
    else { setObjectives(data); setError(null) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { objectives, loading, error, refetch: load }
}
