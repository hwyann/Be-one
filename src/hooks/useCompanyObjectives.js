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

    // Members can only align at the objective level now (#B26 — direct-KR
    // linking removed), so the member cluster is fetched once per company
    // objective via linked_company_objective_id, not once per KR via the
    // old key_result_id link. Each linked individual objective brings its
    // own key results along too, so Manager view's click-to-expand panel
    // can show the member's OKR without a second fetch.
    const { data, error: oError } = await supabase
      .from('company_objectives')
      .select(`
        id, category, title, status,
        key_results(id, title, target_note),
        individual_objectives!linked_company_objective_id(
          id, title, owner_name, status,
          key_results:key_results!key_results_individual_objective_id_fkey(id, title, target_note)
        )
      `)
      .eq('quarter_id', targetQuarterId)

    if (oError) setError(oError.message)
    else { setObjectives(data); setError(null) }
    setLoading(false)
  }, [quarterId])

  useEffect(() => { load() }, [load])

  return { objectives, loading, error, refetch: load }
}
