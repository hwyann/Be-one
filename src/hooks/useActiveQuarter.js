import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useActiveQuarter() {
  const [quarters, setQuarters] = useState([])
  const [selectedQuarterId, setSelectedQuarterId] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('quarters').select('*')
    if (err) { setError(err.message); return }
    setQuarters(data)
    const active = data.find(q => q.is_active)
    if (active) {
      setSelectedQuarterId(current => current ?? active.id)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function selectQuarter(id) {
    setSelectedQuarterId(id)
  }

  return { quarterId: selectedQuarterId, quarters, error, selectQuarter, refetch: load }
}
