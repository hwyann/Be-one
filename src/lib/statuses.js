export const STATUSES = [
  { value: 'on_track', label: 'On track', color: 'var(--ontrack)' },
  { value: 'at_risk',  label: 'At risk',  color: 'var(--atrisk)'  },
  { value: 'behind',   label: 'Behind',   color: 'var(--behind)'  },
]

const NOT_STARTED = { value: 'not_started', label: 'Not started', color: 'var(--text-muted)' }

export const STATUS_BY_VALUE = Object.fromEntries(
  [NOT_STARTED, ...STATUSES].map(s => [s.value, s]),
)
