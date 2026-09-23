import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useCompanyObjectives(quarterId) {
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
      .from('company_objectives')
      .select('id, category, title, status, key_results(id, title, target_note, individual_objectives!key_result_id(id, owner_name))')
      .eq('quarter_id', targetQuarterId)

    if (oError) setError(oError.message)
    else { setObjectives(data); setError(null) }
    setLoading(false)
  }, [quarterId])

  useEffect(() => { load() }, [load])

  return { objectives, loading, error, refetch: load }
}
