import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// A Manager can "request" that every member review their OKR for a given
// quarter (#B27). This just stamps quarters.review_requested_at — the
// Member-side Review button (gated in MyThreadPage) reads that same column
// via useActiveQuarter's existing `quarters` list (which already selects
// '*'), so no separate read hook is needed here, only the mutation.
export default function useRequestQuarterReview() {
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState(null)

  const requestReview = useCallback(async (quarterId) => {
    if (!quarterId) return false
    setRequesting(true)
    const { error: err } = await supabase
      .from('quarters')
      .update({ review_requested_at: new Date().toISOString() })
      .eq('id', quarterId)
    setRequesting(false)
    if (err) { setError(err.message); return false }
    setError(null)
    return true
  }, [])

  return { requestReview, requesting, error }
}
