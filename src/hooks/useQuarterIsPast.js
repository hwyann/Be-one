// Determines whether the selected quarter is read-only (i.e. not the
// currently active quarter). We compare against `is_active` rather than
// `start_date`/`end_date` because the AC defines "past" as "not the
// current quarter" — the same signal `useActiveQuarter` already treats as
// the single source of truth for which quarter is "current" — not as a
// chronological date comparison (which would also need to special-case
// not-yet-started future quarters).
export default function useQuarterIsPast(quarters = [], quarterId) {
  const selected = (quarters ?? []).find(q => q.id === quarterId)
  if (!selected) return false
  return selected.is_active === false
}
