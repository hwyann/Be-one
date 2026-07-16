import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function useCompanyObjectives() {
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: quarter, error: qError } = await supabase
        .from('quarters')
        .select('id')
        .eq('is_active', true)
        .single()

      if (qError) {
        if (!cancelled) { setError(qError.message); setLoading(false) }
        return
      }

      const { data, error: oError } = await supabase
        .from('company_objectives')
        .select('id, category, title, status')
        .eq('quarter_id', quarter.id)

      if (!cancelled) {
        if (oError) setError(oError.message)
        else setObjectives(data)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { objectives, loading, error }
}
