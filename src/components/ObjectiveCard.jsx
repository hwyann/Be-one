const STATUS_CONFIG = {
  on_track: { label: 'On track', color: 'var(--ontrack)' },
  at_risk:  { label: 'At risk',  color: 'var(--atrisk)' },
  behind:   { label: 'Behind',   color: 'var(--behind)' },
}

export default function ObjectiveCard({ objective }) {
  const { category, title, status } = objective
  const { label: dotLabel, color: dotColor } = STATUS_CONFIG[status] ?? { label: status, color: 'var(--text-muted)' }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--hairline)',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(19,30,40,.06)',
      padding: '14px 14px 8px',
    }}>
      <div style={{
        font: '700 10px var(--font-display)',
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: 'var(--coral-700)',
      }}>
        {category.toUpperCase()}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        margin: '3px 0 8px',
      }}>
        <span style={{
          flex: 1,
          font: '700 14.5px/1.3 var(--font-display)',
          color: 'var(--ink-900)',
        }}>
          {title}
        </span>
        <span
          role="img"
          aria-label={dotLabel}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dotColor,
            display: 'inline-block',
            flexShrink: 0,
            marginTop: '4px',
          }}
        />
      </div>
    </div>
  )
}
