import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const FK_ERROR = 'A key result must belong to exactly one objective.'

function normalize(value) {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

export default function useKrMutation() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const create = useCallback(async ({ objectiveId, individualObjectiveId, title, targetNote }) => {
    const hasCompany = !!objectiveId
    const hasIndividual = !!individualObjectiveId
    if (hasCompany === hasIndividual) {
      setError(FK_ERROR)
      return false
    }
    const cleanTitle = (title ?? '').trim()
    if (!cleanTitle) {
      setError('Key result text is required.')
      return false
    }
    setSaving(true)
    const { error: err } = await supabase.from('key_results').insert({
      objective_id: objectiveId ?? null,
      individual_objective_id: individualObjectiveId ?? null,
      title: cleanTitle,
      target_note: normalize(targetNote),
    })
    setSaving(false)
    if (err) { setError(err.message); return false }
    setError(null)
    return true
  }, [])

  const update = useCallback(async ({ id, title, targetNote }) => {
    const cleanTitle = (title ?? '').trim()
    if (!cleanTitle) {
      setError('Key result text is required.')
      return false
    }
    setSaving(true)
    const { error: err } = await supabase
      .from('key_results')
      .update({ title: cleanTitle, target_note: normalize(targetNote) })
      .eq('id', id)
    setSaving(false)
    if (err) { setError(err.message); return false }
    setError(null)
    return true
  }, [])

  return { create, update, saving, error }
}
