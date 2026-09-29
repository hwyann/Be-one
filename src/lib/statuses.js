export const STATUSES = [
  { value: 'on_track', label: 'On track', color: 'var(--ontrack)', bg: 'var(--ontrack-bg)', text: 'var(--ontrack-text)', border: 'var(--ontrack-border)' },
  { value: 'at_risk',  label: 'At risk',  color: 'var(--atrisk)',  bg: 'var(--atrisk-bg)',  text: 'var(--atrisk-text)',  border: 'var(--atrisk-border)'  },
  { value: 'behind',   label: 'Behind',   color: 'var(--behind)',  bg: 'var(--behind-bg)',  text: 'var(--behind-text)',  border: 'var(--behind-border)'  },
]

// Bg/text/border are used by ObjectiveCard's StatusBadge (#B29) to render
// the status as a labeled, colored-background badge instead of a bare dot.
const NOT_STARTED = {
  value: 'not_started', label: 'Not started', color: 'var(--text-muted)',
  bg: 'var(--panel)', text: 'var(--text-secondary)', border: 'var(--hairline)',
}

export const STATUS_BY_VALUE = Object.fromEntries(
  [NOT_STARTED, ...STATUSES].map(s => [s.value, s]),
)
