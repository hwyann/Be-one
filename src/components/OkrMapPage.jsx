import { useEffect, useRef, useState } from 'react'
import useCompanyObjectives from '../hooks/useCompanyObjectives'
import useIndividualObjectives from '../hooks/useIndividualObjectives'
import useActiveQuarter from '../hooks/useActiveQuarter'
import ObjectiveCard from './ObjectiveCard'
import OkrDialog from './OkrDialog'
import Toast from './Toast'
import MyThreadPage from './MyThreadPage'

const VIEWER_OWNER_NAME = 'Satoshi Kimura'

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

function ObjectiveCarousel({ objectives, index, onPrev, onNext, onCheckInSaved, onStatusSaved }) {
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

function AlignmentSummaryStrip({ objectives }) {
  const directKrCount = objectives.filter(o => o.link_type === 'direct_kr').length
  const objectiveLevelCount = objectives.filter(
    o => o.link_type === 'objective_level' || o.link_type == null,
  ).length
  return (
    <div style={{ display: 'flex', gap: '14px', marginTop: '14px' }}>
      <SummaryCard label="Direct KR" count={directKrCount} borderStyle="solid" />
      <SummaryCard label="Objective-level" count={objectiveLevelCount} borderStyle="dashed" />
    </div>
  )
}

function SummaryCard({ label, count, borderStyle }) {
  return (
    <div style={{
      flex: 1,
      border: `1.5px ${borderStyle} var(--hairline)`,
      borderRadius: '12px',
      background: 'var(--surface)',
      padding: '12px 14px',
    }}>
      <div style={{
        font: '700 10px var(--font-display)',
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)',
      }}>
        {label} · {count}
      </div>
    </div>
  )
}

function toggleButtonStyle(active) {
  return {
    font: '600 13px var(--font-display)',
    padding: '6px 12px',
    borderRadius: '8px',
    border: 'none',
    background: active ? 'var(--surface)' : 'transparent',
    color: active ? 'var(--ink-900)' : 'var(--text-secondary)',
    boxShadow: active ? '0 1px 2px rgba(19,30,40,.08)' : 'none',
    cursor: 'pointer',
  }
}

export default function OkrMapPage() {
  const { objectives, loading, error, refetch } = useCompanyObjectives()
  const {
    objectives: individualObjectives,
    refetch: refetchIndividual,
  } = useIndividualObjectives()
  const { quarterId } = useActiveQuarter()
  const [dialogState, setDialogState] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [view, setView] = useState('map')
  const [carouselIndex, setCarouselIndex] = useState(0)

  if (loading) return <div>Loading...</div>
  if (error) return <p role="alert">{error}</p>

  function closeDialog() { setDialogState(null) }

  function handleSave() {
    if (dialogState.objective) refetchIndividual()
    else refetch()
    closeDialog()
  }

  return (
    <div style={{ minWidth: '980px', padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
      }}>
        <div style={{
          display: 'inline-flex',
          gap: '4px',
          padding: '4px',
          borderRadius: '10px',
          background: 'var(--panel)',
          border: '1px solid var(--hairline)',
        }}>
          <button
            type="button"
            aria-pressed={view === 'map'}
            onClick={() => setView('map')}
            style={toggleButtonStyle(view === 'map')}
          >
            OKR map
          </button>
          <button
            type="button"
            aria-pressed={view === 'my-thread'}
            onClick={() => setView('my-thread')}
            style={toggleButtonStyle(view === 'my-thread')}
          >
            My thread
          </button>
        </div>
        <button
          type="button"
          onClick={() => setDialogState({})}
          style={{
            font: '600 13px var(--font-display)',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid var(--hairline)',
            background: 'var(--surface)',
            color: 'var(--ink-900)',
            cursor: 'pointer',
          }}
        >
          + Add objective
        </button>
      </div>
      {view === 'map' ? (
        <>
          {objectives.length > 0 && (
            <ObjectiveCarousel
              objectives={objectives}
              index={carouselIndex}
              onPrev={() => setCarouselIndex(i => Math.max(0, i - 1))}
              onNext={() => setCarouselIndex(i => Math.min(objectives.length - 1, i + 1))}
              onCheckInSaved={() => setToastMessage('KR check-in notes saved.')}
              onStatusSaved={refetch}
            />
          )}
          <AlignmentSummaryStrip objectives={individualObjectives} />
        </>
      ) : (
        <MyThreadPage
          ownerName={VIEWER_OWNER_NAME}
          objectives={individualObjectives}
          companyObjectives={objectives}
          onEdit={objective => setDialogState({ objective })}
        />
      )}
      {toastMessage && (
        <Toast
          message={toastMessage}
          visibleMs={5000}
          onDismiss={() => setToastMessage(null)}
        />
      )}
      {dialogState && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(19,30,40,.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <OkrDialog
            quarterId={quarterId}
            objective={dialogState.objective}
            companyObjectives={objectives}
            onSave={handleSave}
            onClose={closeDialog}
          />
        </div>
      )}
    </div>
  )
}
