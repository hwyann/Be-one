export const STATUSES = [
  { value: 'on_track', label: 'On track', color: 'var(--ontrack)' },
  { value: 'at_risk',  label: 'At risk',  color: 'var(--atrisk)'  },
  { value: 'behind',   label: 'Behind',   color: 'var(--behind)'  },
]

export const STATUS_BY_VALUE = Object.fromEntries(
  STATUSES.map(s => [s.value, s]),
)
