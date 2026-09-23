import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function useActiveQuarter() {
  const [quarters, setQuarters] = useState([])
  const [selectedQuarterId, setSelectedQuarterId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('quarters')
      .select('*')
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return }
        setQuarters(data)
        const active = data.find(q => q.is_active)
        if (active) {
          setSelectedQuarterId(current => current ?? active.id)
        }
      })
  }, [])

  function selectQuarter(id) {
    setSelectedQuarterId(id)
  }

  return { quarterId: selectedQuarterId, quarters, error, selectQuarter }
}
