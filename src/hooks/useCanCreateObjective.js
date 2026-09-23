import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Finds the quarter immediately prior to `quarterId`: the quarter whose
// end_date is the latest end_date still before the selected quarter's
// start_date. Returns null when no such quarter exists (e.g. the very
// first quarter ever).
function findPriorQuarter(quarters, quarterId) {
  const list = quarters ?? []
  const selected = list.find(q => q.id === quarterId)
  if (!selected?.start_date) return null

  const candidates = list.filter(
    q => q.id !== quarterId && q.end_date != null && q.end_date < selected.start_date,
  )
  if (candidates.length === 0) return null

  return candidates.reduce((latest, q) => (q.end_date > latest.end_date ? q : latest))
}

// Gate for the "+ Add objective" action (#8b, fixed in #B1). A brand-new
// quarter always has zero objectives of its own, so gating on the
// *selected* quarter's objectives is meaningless — it always says "go
// ahead". The real restart gate is whether the PRIOR quarter's individual
// objectives were reviewed and finalized (see useQuarterReview / #8a).
// If there is no chronologically-prior quarter, or the prior quarter has
// no individual objectives, the gate is vacuously satisfied.
export default function useCanCreateObjective(quarterId, quarters = []) {
  const [canCreate, setCanCreate] = useState(false)
  const [loading, setLoading] = useState(quarterId != null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (quarterId == null) return
    setLoading(true)

    const prior = findPriorQuarter(quarters, quarterId)
    if (!prior) {
      setError(null)
      setCanCreate(true)
      setLoading(false)
      return
    }

    const { data: objectives, error: oError } = await supabase
      .from('individual_objectives')
      .select('id')
      .eq('quarter_id', prior.id)

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
  }, [quarterId, quarters])

  useEffect(() => { load() }, [load])

  return { canCreate, loading, error, refetch: load }
}
