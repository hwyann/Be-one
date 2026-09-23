import { useEffect, useRef, useState } from 'react'
import ObjectiveCard from './ObjectiveCard'

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const handler = e => setReduced(e.matches)
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])
  return reduced
}

function carouselButtonStyle(disabled) {
  return {
    font: '600 13px var(--font-display)',
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid var(--hairline)',
    background: 'var(--surface)',
    color: disabled ? 'var(--text-muted)' : 'var(--ink-900)',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }
}

export default function ObjectiveCarousel({ objectives, index, onPrev, onNext, onCheckInSaved, onStatusSaved, onKrSaved }) {
  const total = objectives.length
  const current = objectives[index]
  const prefersReduced = usePrefersReducedMotion()
  const prevIndexRef = useRef(index)
  const [direction, setDirection] = useState('none')
  useEffect(() => {
    const prev = prevIndexRef.current
    if (index === prev) return
    setDirection(index > prev ? 'forward' : 'backward')
    prevIndexRef.current = index
  }, [index])
  const animate = !prefersReduced && (direction === 'forward' || direction === 'backward')
  return (
    <div>
      <div style={{
        font: '700 10px var(--font-display)',
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
        marginBottom: '10px',
      }}>
        Company Objective
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div
          key={index}
          data-testid="carousel-slide"
          data-direction={direction}
          style={{
            width: '70%',
            marginLeft: 'auto',
            marginRight: 'auto',
            animation: animate ? `carousel-slide-${direction} 280ms ease-out` : undefined,
          }}
        >
          <ObjectiveCard
            objective={current}
            onCheckInSaved={onCheckInSaved}
            onStatusSaved={onStatusSaved}
            onKrSaved={onKrSaved}
          />
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        marginTop: '14px',
      }}>
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          style={carouselButtonStyle(index === 0)}
        >
          Previous
        </button>
        <span style={{
          font: '600 12px var(--font-display)',
          color: 'var(--text-secondary)',
          minWidth: '52px',
          textAlign: 'center',
        }}>
          {index + 1} of {total}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={index >= total - 1}
          style={carouselButtonStyle(index >= total - 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}
