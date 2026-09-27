// Pure helpers for deriving a "next quarter" from the existing quarters
// list. Used by useCreateQuarter for the "+ New quarter" demo action
// (story: New quarter button) — no supabase calls in this file so the
// naming/date math can be unit-tested in isolation.

const QUARTER_LABEL_RE = /^Q([1-4])\s+(\d{4})$/

// Picks the chronologically-latest quarter (by end_date) to seed the next
// one from. Falls back to null when there are no quarters yet.
export function pickLatestQuarter(quarters = []) {
  return (quarters ?? []).reduce((latest, q) => {
    if (!latest) return q
    if (!q?.end_date) return latest
    if (!latest.end_date) return q
    return q.end_date > latest.end_date ? q : latest
  }, null)
}

// "Q3 2026" -> "Q4 2026", "Q4 2026" -> "Q1 2027". Unparseable/missing
// names fall back to a generic label rather than throwing, since this
// only feeds a demo convenience button.
export function nextQuarterLabel(name) {
  const match = QUARTER_LABEL_RE.exec((name ?? '').trim())
  if (!match) return 'New quarter'
  const quarterNum = Number(match[1])
  const year = Number(match[2])
  return quarterNum === 4 ? `Q1 ${year + 1}` : `Q${quarterNum + 1} ${year}`
}

function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

// Computes a 3-month quarter starting the day after `prevEndDate`
// (YYYY-MM-DD). With no prior quarter, starts today. Uses UTC date math
// throughout to avoid local-timezone off-by-one bugs.
export function nextQuarterDates(prevEndDate, today = new Date()) {
  const start = prevEndDate
    ? (() => {
        const prev = new Date(`${prevEndDate}T00:00:00Z`)
        return new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate() + 1))
      })()
    : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))

  const endExclusive = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, start.getUTCDate()))
  const end = new Date(endExclusive.getTime() - 24 * 60 * 60 * 1000)

  return { start_date: toISODate(start), end_date: toISODate(end) }
}
