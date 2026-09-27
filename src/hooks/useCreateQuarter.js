import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { nextQuarterLabel, nextQuarterDates, pickLatestQuarter } from '../lib/quarters'

// Backs the "+ New quarter" demo button (OkrMapPage): creates the next
// quarter and clones the current quarter's Company OKRs into it, so a demo
// can show the intended empty state immediately — Company OKR already set,
// individual OKR not yet — without an admin having to re-author company
// objectives by hand for every new quarter.
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
    const newQuarter = inserted[0]

    if (source) {
      const { data: sourceObjectives, error: fetchError } = await supabase
        .from('company_objectives')
        .select('title, description, category, key_results(title, description, target_value, unit, target_note)')
        .eq('quarter_id', source.id)

      if (fetchError) {
        setError(fetchError.message)
        setCreating(false)
        return newQuarter
      }

      for (const co of sourceObjectives ?? []) {
        const { data: newCoRows, error: coError } = await supabase
          .from('company_objectives')
          .insert([{
            quarter_id: newQuarter.id,
            title: co.title,
            description: co.description,
            category: co.category,
            status: 'not_started',
          }])
          .select()

        if (coError) {
          setError(coError.message)
          continue
        }

        const newCo = newCoRows[0]
        for (const kr of co.key_results ?? []) {
          await supabase.from('key_results').insert([{
            objective_id: newCo.id,
            title: kr.title,
            description: kr.description,
            target_value: kr.target_value,
            unit: kr.unit,
            target_note: kr.target_note,
            current_value: 0,
          }])
        }
      }
    }

    setCreating(false)
    return newQuarter
  }, [])

  return { createQuarter, creating, error }
}
