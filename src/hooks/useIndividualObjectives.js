import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useIndividualObjectives(quarterId) {
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    let targetQuarterId = quarterId
    if (!targetQuarterId) {
      const { data: quarter, error: qError } = await supabase
        .from('quarters')
        .select('id')
        .eq('is_active', true)
        .single()

      if (qError) { setError(qError.message); setLoading(false); return }
      targetQuarterId = quarter.id
    }

    const { data, error: oError } = await supabase
      .from('individual_objectives')
      .select('id, title, owner_name, link_type, linked_company_objective_id, key_result_id, key_results!key_results_individual_objective_id_fkey(id, title, target_note)')
      .eq('quarter_id', targetQuarterId)

    if (oError) setError(oError.message)
    else { setObjectives(data); setError(null) }
    setLoading(false)
  }, [quarterId])

  useEffect(() => { load() }, [load])

  return { objectives, loading, error, refetch: load }
}
