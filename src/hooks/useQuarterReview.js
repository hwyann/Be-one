import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useQuarterReview(objectiveId) {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(objectiveId != null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (objectiveId == null) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('quarter_reviews')
      .select('id, objective_id, final_status, member_reflection, member_confirmed_at, manager_comment, manager_confirmed_at, finalized_at, created_at')
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (err) { setError(err.message); setReview(null) }
    else { setReview(data?.[0] ?? null); setError(null) }
    setLoading(false)
  }, [objectiveId])

  useEffect(() => { load() }, [load])

  const save = useCallback(async ({ finalStatus, memberReflection, memberConfirmed, managerComment, managerConfirmed }) => {
    const now = new Date().toISOString()
    const memberConfirmedAt = memberConfirmed ? now : null
    const managerConfirmedAt = managerConfirmed ? now : null
    const finalizedAt = memberConfirmedAt && managerConfirmedAt ? now : null

    const payload = {
      objective_id: objectiveId,
      final_status: finalStatus ?? null,
      member_reflection: memberReflection ?? null,
      member_confirmed_at: memberConfirmedAt,
      manager_comment: managerComment ?? null,
      manager_confirmed_at: managerConfirmedAt,
      finalized_at: finalizedAt,
    }

    setSaving(true)
    const { error: err } = review?.id
      ? await supabase.from('quarter_reviews').update(payload).eq('id', review.id)
      : await supabase.from('quarter_reviews').insert(payload)
    setSaving(false)
    if (err) { setError(err.message); return false }
    setError(null)
    await load()
    return true
  }, [objectiveId, review, load])

  return { review, loading, error, saving, save, refetch: load }
}
