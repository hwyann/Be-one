import { useEffect, useState } from 'react'
import useCompanyObjectives from '../hooks/useCompanyObjectives'
import useIndividualObjectives from '../hooks/useIndividualObjectives'
import useActiveQuarter from '../hooks/useActiveQuarter'
import useQuarterIsPast from '../hooks/useQuarterIsPast'
import useCanCreateObjective from '../hooks/useCanCreateObjective'
import useViewMode from '../hooks/useViewMode'
import ObjectiveCarousel from './ObjectiveCarousel'
import OkrDialog from './OkrDialog'
import Toast from './Toast'
import MyThreadPage from './MyThreadPage'

const VIEWER_OWNER_NAME = 'Satoshi Kimura'

function LinkTypeLegend() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      marginBottom: '14px',
      font: '600 12px var(--font-display)',
      color: 'var(--text-secondary)',
    }}>
      <LegendEntry testId="legend-icon-direct" label="Direct KR link">
        <line x1="2" y1="6" x2="26" y2="6" stroke="var(--ink-900)" strokeWidth="2.5" strokeLinecap="round" />
      </LegendEntry>
      <LegendEntry testId="legend-icon-objective" label="Objective-level">
        <line x1="2" y1="6" x2="26" y2="6" stroke="var(--ink-900)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 4" />
      </LegendEntry>
    </div>
  )
}

function LegendEntry({ testId, label, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg data-testid={testId} width="28" height="12" viewBox="0 0 28 12" aria-hidden="true">
        {children}
      </svg>
      {label}
    </span>
  )
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

function QuarterSelector({ quarters, quarterId, onChange }) {
  return (
    <select
      aria-label="Quarter"
      value={quarterId ?? ''}
      onChange={e => onChange(e.target.value)}
      style={{
        font: '600 13px var(--font-display)',
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid var(--hairline)',
        background: 'var(--surface)',
        color: 'var(--ink-900)',
      }}
    >
      {quarters.map(q => (
        <option key={q.id} value={q.id}>
          {q.label ?? q.name ?? q.title ?? q.id}
        </option>
      ))}
    </select>
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

function ViewModeToggle({ viewMode, onChange }) {
  return (
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
        aria-pressed={viewMode === 'member'}
        onClick={() => onChange('member')}
        style={toggleButtonStyle(viewMode === 'member')}
      >
        Member
      </button>
      <button
        type="button"
        aria-pressed={viewMode === 'manager'}
        onClick={() => onChange('manager')}
        style={toggleButtonStyle(viewMode === 'manager')}
      >
        Manager
      </button>
    </div>
  )
}

export default function OkrMapPage() {
  const { quarterId, quarters = [], selectQuarter } = useActiveQuarter()
  const isPastQuarter = useQuarterIsPast(quarters, quarterId)
  const { canCreate, refetch: refetchCanCreate } = useCanCreateObjective(quarterId, quarters)
  const { objectives, loading, error, refetch } = useCompanyObjectives(quarterId)
  const {
    objectives: individualObjectives,
    refetch: refetchIndividual,
  } = useIndividualObjectives(quarterId)
  const { viewMode, setViewMode } = useViewMode()
  const [dialogState, setDialogState] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [view, setView] = useState(viewMode === 'manager' ? 'map' : 'my-thread')
  const [carouselIndex, setCarouselIndex] = useState(0)

  useEffect(() => { setCarouselIndex(0) }, [quarterId])

  if (loading) return <div>Loading...</div>
  if (error) return <p role="alert">{error}</p>

  const liveDialogObjective = dialogState?.objective
    ? (individualObjectives.find(o => o.id === dialogState.objective.id) ?? dialogState.objective)
    : undefined

  function closeDialog() { setDialogState(null) }

  function handleSave() {
    if (dialogState.objective) {
      refetchIndividual()
    } else {
      refetch()
      refetchCanCreate()
    }
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
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
          {quarters.length > 0 && (
            <QuarterSelector
              quarters={quarters}
              quarterId={quarterId}
              onChange={selectQuarter}
            />
          )}
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
        {!isPastQuarter && canCreate && (
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
        )}
      </div>
      {view === 'map' ? (
        <>
          <LinkTypeLegend />
          {objectives.length > 0 && (
            <ObjectiveCarousel
              objectives={objectives}
              index={carouselIndex}
              onPrev={() => setCarouselIndex(i => Math.max(0, i - 1))}
              onNext={() => setCarouselIndex(i => Math.min(objectives.length - 1, i + 1))}
              onCheckInSaved={() => setToastMessage('KR check-in notes saved.')}
              onStatusSaved={refetch}
              onKrSaved={refetch}
              readOnly={isPastQuarter}
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
          readOnly={isPastQuarter}
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
            objective={liveDialogObjective}
            companyObjectives={objectives}
            onSave={handleSave}
            onClose={closeDialog}
            onKrSaved={refetchIndividual}
          />
        </div>
      )}
    </div>
  )
}
