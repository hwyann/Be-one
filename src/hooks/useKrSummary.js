import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function useKrSummary(individualObjectiveId) {
  const [summary, setSummary] = useState(null)
  const [status, setStatus] = useState(individualObjectiveId == null ? null : 'loading')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (individualObjectiveId == null) return
    setStatus('loading')
    setSummary(null)
    setError(null)

    const { data, error: invokeErr } = await supabase.functions.invoke('generate-kr-summary', {
      body: { individual_objective_id: individualObjectiveId },
    })

    if (invokeErr) {
      setError(invokeErr.message ?? 'Summary unavailable')
      setStatus('error')
      return
    }
    if (data?.status === 'insufficient_data') {
      setStatus('insufficient_data')
      return
    }
    if (typeof data?.summary_text === 'string' && data.summary_text.length > 0) {
      setSummary(data.summary_text)
      setStatus('ready')
      return
    }
    setError('Unexpected response')
    setStatus('error')
  }, [individualObjectiveId])

  useEffect(() => { load() }, [load])

  return { summary, loading: status === 'loading', error, status }
}
