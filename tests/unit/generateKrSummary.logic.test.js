import { describe, it, expect } from 'vitest'
import {
  hasSufficientData,
  isCacheFresh,
  formatCheckInLines,
  buildPrompt,
} from '../../supabase/functions/generate-kr-summary/logic.js'

describe('hasSufficientData', () => {
  it('is false when there are fewer than 3 check-ins', () => {
    expect(hasSufficientData(0)).toBe(false)
    expect(hasSufficientData(2)).toBe(false)
  })

  it('is true at 3 or more check-ins', () => {
    expect(hasSufficientData(3)).toBe(true)
    expect(hasSufficientData(7)).toBe(true)
  })
})

describe('isCacheFresh', () => {
  const now = new Date('2026-07-17T12:00:00Z').getTime()

  it('is false when there is no cached row', () => {
    expect(isCacheFresh(null, 5, now)).toBe(false)
  })

  it('is false when the cached count differs from the current count', () => {
    const cached = { based_on_check_in_count: 4, generated_at: new Date(now - 10_000).toISOString() }
    expect(isCacheFresh(cached, 5, now)).toBe(false)
  })

  it('is false when the cached row is older than 60 seconds', () => {
    const cached = { based_on_check_in_count: 5, generated_at: new Date(now - 60_001).toISOString() }
    expect(isCacheFresh(cached, 5, now)).toBe(false)
  })

  it('is true when the count matches and the row is under 60 seconds old', () => {
    const cached = { based_on_check_in_count: 5, generated_at: new Date(now - 30_000).toISOString() }
    expect(isCacheFresh(cached, 5, now)).toBe(true)
  })
})

describe('formatCheckInLines', () => {
  it('renders each check-in as "[YYYY-MM-DD] STATUS: note (plan: plan_next)"', () => {
    const lines = formatCheckInLines([
      {
        status: 'on_track',
        note: 'shipped first draft',
        plan_next: 'wire the review flow',
        created_at: '2026-07-01T10:00:00Z',
      },
      {
        status: 'at_risk',
        note: 'blocked on API keys',
        plan_next: 'pair with Chip',
        created_at: '2026-07-08T09:30:00Z',
      },
    ])
    expect(lines).toBe(
      '[2026-07-01] ON_TRACK: shipped first draft (plan: wire the review flow)\n' +
      '[2026-07-08] AT_RISK: blocked on API keys (plan: pair with Chip)'
    )
  })

  it('omits the "(plan: ...)" suffix when plan_next is empty or missing', () => {
    const lines = formatCheckInLines([
      { status: 'behind', note: 'stalled', plan_next: null, created_at: '2026-07-01T00:00:00Z' },
      { status: 'behind', note: 'still stalled', plan_next: '', created_at: '2026-07-02T00:00:00Z' },
    ])
    expect(lines).toBe(
      '[2026-07-01] BEHIND: stalled\n' +
      '[2026-07-02] BEHIND: still stalled'
    )
  })

  it('treats missing note as an empty note', () => {
    const lines = formatCheckInLines([
      { status: 'on_track', note: null, plan_next: null, created_at: '2026-07-01T00:00:00Z' },
    ])
    expect(lines).toBe('[2026-07-01] ON_TRACK: ')
  })
})

describe('buildPrompt', () => {
  it('embeds the objective title and the check-in lines verbatim in the story-specified template', () => {
    const prompt = buildPrompt('Ship the AI summary feature', '[2026-07-01] ON_TRACK: kicked off')
    expect(prompt).toBe(
`You are summarizing progress on a Key Result: "Ship the AI summary feature".

Below are the check-ins ordered oldest to newest:
[2026-07-01] ON_TRACK: kicked off

Write a 2–3 sentence summary in this order:
1. Trajectory: "Improving", "Stable", or "At risk" — based on the status trend.
2. Key theme: one recurring concern or accomplishment across the notes.
3. Latest signal: the most notable recent update.

Be concise. No preamble. No bullet points. Plain prose.`
    )
  })
})
