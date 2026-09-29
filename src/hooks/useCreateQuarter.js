import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { nextQuarterLabel, nextQuarterDates, pickLatestQuarter } from '../lib/quarters'

// Backs the "+ New quarter" demo button (OkrMapPage): creates the next
// quarter, always starting with zero Company OKR (#B31) -- previously this
// cloned the prior quarter's Company OKR to fake the intended empty state,
// but that meant "+ New quarter" almost never actually produced an empty
// Map, and the Manager's fresh company-objective-setup flow (#B30) rarely
// fired. Now the Manager sets the Company OKR from scratch every time via
// CompanyOkrDialog, opened directly by OkrMapPage right after creation.
export default function useCreateQuarter() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const createQuarter = useCallback(async (quarters = []) => {
    setCreating(true)
    setError(null)

    const source = pickLatestQuarter(quarters)
    const name = nextQuarterLabel(source?.name)
    const { start_date, end_date } = nextQuarterDates(source?.end_date)

    const activeIds = (quarters ?? []).filter(q => q.is_active).map(q => q.id)
    if (activeIds.length > 0) {
      const { error: deactivateError } = await supabase
        .from('quarters')
        .update({ is_active: false })
        .in('id', activeIds)
      if (deactivateError) {
        setError(deactivateError.message)
        setCreating(false)
        return null
      }
    }

    const { data: inserted, error: insertError } = await supabase
      .from('quarters')
      .insert([{ name, start_date, end_date, is_active: true }])
      .select()

    if (insertError) {
      setError(insertError.message)
      setCreating(false)
      return null
    }

    setCreating(false)
    return inserted[0]
  }, [])

  return { createQuarter, creating, error }
}
