import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Gate for the "+ Add objective" action (#8b). A quarter is clear to add a
// new objective when either it has no individual objectives yet (fresh
// start — nothing to review), or every individual objective in it already
// has a finalized quarter_reviews row (see useQuarterReview / #8a).
export default function useCanCreateObjective(quarterId) {
  const [canCreate, setCanCreate] = useState(false)
  const [loading, setLoading] = useState(quarterId != null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (quarterId == null) return
    setLoading(true)

    const { data: objectives, error: oError } = await supabase
      .from('individual_objectives')
      .select('id')
      .eq('quarter_id', quarterId)

    if (oError) {
      setError(oError.message)
      setCanCreate(false)
      setLoading(false)
      return
    }

    if (!objectives || objectives.length === 0) {
      setError(null)
      setCanCreate(true)
      setLoading(false)
      return
    }

    const ids = objectives.map(o => o.id)
    const { data: reviews, error: rError } = await supabase
      .from('quarter_reviews')
      .select('objective_id, finalized_at')
      .in('objective_id', ids)

    if (rError) {
      setError(rError.message)
      setCanCreate(false)
      setLoading(false)
      return
    }

    const finalizedIds = new Set(
      (reviews ?? []).filter(r => r.finalized_at != null).map(r => r.objective_id),
    )
    setError(null)
    setCanCreate(ids.every(id => finalizedIds.has(id)))
    setLoading(false)
  }, [quarterId])

  useEffect(() => { load() }, [load])

  return { canCreate, loading, error, refetch: load }
}
