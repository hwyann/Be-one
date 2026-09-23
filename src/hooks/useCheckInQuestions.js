import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useCheckInQuestions(checkInIds) {
  const idsKey = (checkInIds ?? []).join(',')
  const [questionsByCheckInId, setQuestionsByCheckInId] = useState({})
  const [loading, setLoading] = useState(idsKey !== '')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const ids = idsKey === '' ? [] : idsKey.split(',')
    if (ids.length === 0) {
      setQuestionsByCheckInId({})
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('check_in_questions')
      .select('id, check_in_id, question_text, reply_text, created_at, replied_at')
      .in('check_in_id', ids)

    if (err) {
      setError(err.message)
      setQuestionsByCheckInId({})
    } else {
      const map = {}
      for (const row of data) map[row.check_in_id] = row
      setQuestionsByCheckInId(map)
      setError(null)
    }
    setLoading(false)
  }, [idsKey])

  useEffect(() => { load() }, [load])

  const askQuestion = useCallback(async (checkInId, questionText) => {
    setSaving(true)
    const { data, error: err } = await supabase
      .from('check_in_questions')
      .insert({ check_in_id: checkInId, question_text: questionText })
      .select('id, check_in_id, question_text, reply_text, created_at, replied_at')
      .single()
    setSaving(false)
    if (err) { setError(err.message); return false }
    setQuestionsByCheckInId(prev => ({ ...prev, [data.check_in_id]: data }))
    setError(null)
    return true
  }, [])

  const replyToQuestion = useCallback(async (questionId, replyText) => {
    setSaving(true)
    const { data, error: err } = await supabase
      .from('check_in_questions')
      .update({ reply_text: replyText, replied_at: new Date().toISOString() })
      .eq('id', questionId)
      .select('id, check_in_id, question_text, reply_text, created_at, replied_at')
      .single()
    setSaving(false)
    if (err) { setError(err.message); return false }
    setQuestionsByCheckInId(prev => ({ ...prev, [data.check_in_id]: data }))
    setError(null)
    return true
  }, [])

  return { questionsByCheckInId, loading, error, saving, askQuestion, replyToQuestion, refetch: load }
}
