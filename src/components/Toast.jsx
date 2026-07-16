import { useEffect } from 'react'

export default function Toast({ message, visibleMs = 5000, onDismiss }) {
  useEffect(() => {
    const id = setTimeout(() => onDismiss?.(), visibleMs)
    return () => clearTimeout(id)
  }, [message, visibleMs, onDismiss])

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 16px',
        borderRadius: '10px',
        background: 'var(--ink-900)',
        color: 'var(--surface)',
        font: '500 13px var(--font-sans)',
        boxShadow: 'var(--shadow-card)',
        zIndex: 20,
      }}
    >
      {message}
    </div>
  )
}
