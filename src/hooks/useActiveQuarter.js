import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function useActiveQuarter() {
  const [quarterId, setQuarterId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('quarters')
      .select('id')
      .eq('is_active', true)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setQuarterId(data.id)
      })
  }, [])

  return { quarterId, error }
}
