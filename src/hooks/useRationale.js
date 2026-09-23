import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useRationale(targetId) {
  const [rationale, setRationale] = useState([])
  const [loading, setLoading] = useState(targetId != null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (targetId == null) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('rationale')
      .select('id, question_key, answer, created_at')
      .eq('target_id', targetId)
      .order('created_at', { ascending: true })

    if (err) { setError(err.message); setRationale([]) }
    else { setRationale(data); setError(null) }
    setLoading(false)
  }, [targetId])

  useEffect(() => { load() }, [load])

  const save = useCallback(async ({ targetId: saveTargetId, answers }) => {
    const rows = Object.entries(answers ?? {})
      .filter(([, value]) => (value ?? '').trim() !== '')
      .map(([question_key, answer]) => ({
        target_id: saveTargetId,
        question_key,
        answer: answer.trim(),
      }))

    if (rows.length === 0) return true

    setSaving(true)
    const { error: err } = await supabase.from('rationale').insert(rows)
    setSaving(false)
    if (err) { setError(err.message); return false }
    setError(null)
    return true
  }, [])

  return { rationale, loading, error, saving, save, refetch: load }
}
