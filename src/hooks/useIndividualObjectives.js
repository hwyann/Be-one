import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useIndividualObjectives() {
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data: quarter, error: qError } = await supabase
      .from('quarters')
      .select('id')
      .eq('is_active', true)
      .single()

    if (qError) { setError(qError.message); setLoading(false); return }

    const { data, error: oError } = await supabase
      .from('individual_objectives')
      .select('id, title, owner_name, link_type, linked_company_objective_id, key_result_id, key_results(id, title, target_note)')
      .eq('quarter_id', quarter.id)

    if (oError) setError(oError.message)
    else { setObjectives(data); setError(null) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { objectives, loading, error, refetch: load }
}
