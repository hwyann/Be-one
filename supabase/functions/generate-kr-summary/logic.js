const CACHE_TTL_MS = 60_000
const MIN_CHECK_INS = 3

export function hasSufficientData(count) {
  return count >= MIN_CHECK_INS
}

export function isCacheFresh(cached, currentCount, now) {
  if (!cached) return false
  if (cached.based_on_check_in_count !== currentCount) return false
  return now - new Date(cached.generated_at).getTime() < CACHE_TTL_MS
}

export function formatCheckInLines(checkIns) {
  return checkIns.map(formatCheckInLine).join('\n')
}

function formatCheckInLine({ status, note, plan_next, created_at }) {
  const date = created_at.slice(0, 10)
  const body = note ?? ''
  const plan = plan_next ? ` (plan: ${plan_next})` : ''
  return `[${date}] ${status.toUpperCase()}: ${body}${plan}`
}

export function buildPrompt(title, checkInLines) {
  return `You are summarizing progress on a Key Result: "${title}".

Below are the check-ins ordered oldest to newest:
${checkInLines}

Write a 2–3 sentence summary in this order:
1. Trajectory: "Improving", "Stable", or "At risk" — based on the status trend.
2. Key theme: one recurring concern or accomplishment across the notes.
3. Latest signal: the most notable recent update.

Be concise. No preamble. No bullet points. Plain prose.`
}
