import { useEffect, useRef, useState } from 'react'
import useCompanyObjectives from '../hooks/useCompanyObjectives'
import useIndividualObjectives from '../hooks/useIndividualObjectives'
import useActiveQuarter from '../hooks/useActiveQuarter'
import useQuarterIsPast from '../hooks/useQuarterIsPast'
import useCanCreateObjective from '../hooks/useCanCreateObjective'
import useCreateQuarter from '../hooks/useCreateQuarter'
import useRequestQuarterReview from '../hooks/useRequestQuarterReview'
import useViewMode from '../hooks/useViewMode'
import ObjectiveCarousel from './ObjectiveCarousel'
import OkrDialog from './OkrDialog'
import Toast from './Toast'
import MyThreadPage from './MyThreadPage'
import { VIEWER_OWNER_NAME } from '../lib/viewer'

function QuarterSelector({ quarters, quarterId, onChange, disabled = false }) {
  return (
    <select
      aria-label="Quarter"
      value={quarterId ?? ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        font: '600 13px var(--font-display)',
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid var(--hairline)',
        background: 'var(--surface)',
        color: 'var(--ink-900)',
        opacity: disabled ? 0.5 : 1,
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

function newQuarterButtonStyle() {
  return {
    font: '600 13px var(--font-display)',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px dashed var(--hairline)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
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

function ViewModeToggle({ viewMode, onChange, managerDisabled = false }) {
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
        disabled={managerDisabled}
        style={{ ...toggleButtonStyle(viewMode === 'manager'), opacity: managerDisabled ? 0.5 : 1 }}
      >
        Manager
      </button>
    </div>
  )
}

export default function OkrMapPage() {
  const { quarterId, quarters = [], selectQuarter, refetch: refetchQuarters } = useActiveQuarter()
  const isPastQuarter = useQuarterIsPast(quarters, quarterId)
  const { canCreate, refetch: refetchCanCreate } = useCanCreateObjective(quarterId, quarters)
  const { objectives, loading, error, refetch } = useCompanyObjectives(quarterId)
  const {
    objectives: individualObjectives,
    loading: individualLoading,
    refetch: refetchIndividual,
  } = useIndividualObjectives(quarterId)
  const { viewMode, setViewMode } = useViewMode()
  const { createQuarter, creating: creatingQuarter } = useCreateQuarter()
  const { requestReview, requesting: requestingReview } = useRequestQuarterReview()
  const [dialogState, setDialogState] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [view, setView] = useState(viewMode === 'manager' ? 'map' : 'my-thread')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const autoOpenedQuarterRef = useRef(null)
  const prevQuarterIdRef = useRef(quarterId)

  useEffect(() => { setCarouselIndex(0) }, [quarterId])

  // Codex review finding (split-view-review-all): the split-view detail
  // panel no longer sits behind a backdrop, so the quarter selector stays
  // clickable while it's open. Since the panel isn't re-keyed by quarter,
  // switching quarters mid-edit would otherwise leave the in-progress
  // draft's supabase calls using the *new* quarterId with the *old*
  // draft content — silently creating the objective in the wrong quarter.
  // Close whatever's open on any quarter change so that can't happen; the
  // auto-open effect below will re-evaluate the new quarter on its own.
  useEffect(() => {
    if (prevQuarterIdRef.current !== quarterId) {
      prevQuarterIdRef.current = quarterId
      setDialogState(null)
    }
  }, [quarterId])

  useEffect(() => {
    if (viewMode === 'manager' && view === 'my-thread') {
      setView('map')
    }
  }, [viewMode, view])

  // Empty-state nudge: Company OKR is set for this quarter but the viewer
  // has no individual OKR of their own yet — open the Add Objective modal
  // by default so they have to set one to proceed, instead of landing on a
  // blank My Thread screen. Fires once per quarter (ref-gated) so an
  // explicit Cancel on that first prompt still works like any other close.
  useEffect(() => {
    if (viewMode !== 'member' || view !== 'my-thread') return
    if (loading || individualLoading) return
    if (isPastQuarter || !canCreate) return
    if (objectives.length === 0) return
    if (dialogState !== null) return
    if (autoOpenedQuarterRef.current === quarterId) return

    const mine = individualObjectives.filter(o => o.owner_name === VIEWER_OWNER_NAME)
    if (mine.length > 0) return

    autoOpenedQuarterRef.current = quarterId
    setDialogState({ mandatory: true })
  }, [
    viewMode, view, loading, individualLoading, isPastQuarter, canCreate,
    objectives, individualObjectives, dialogState, quarterId,
  ])

  if (loading) return <div>Loading...</div>
  if (error) return <p role="alert">{error}</p>

  // Once the viewer has confirmed an OKR this quarter, they can no longer
  // add or edit — only check in on progress (#B17/#B18). Drafts don't
  // count here; only a confirmed row closes the door.
  const hasConfirmedThisQuarter = individualObjectives.some(
    o => o.owner_name === VIEWER_OWNER_NAME && o.status === 'confirmed',
  )
  const myDrafts = individualObjectives.filter(
    o => o.owner_name === VIEWER_OWNER_NAME && o.status === 'draft',
  )

  const currentQuarter = quarters.find(q => q.id === quarterId)
  // Member's Review button (My OKR view) is gated on this (#B27) — a
  // Manager has to explicitly request a review before it's usable, rather
  // than it being always-on like it was under #B23.
  const reviewRequested = !!currentQuarter?.review_requested_at

  const liveDialogObjective = dialogState?.objective
    ? (individualObjectives.find(o => o.id === dialogState.objective.id) ?? dialogState.objective)
    : undefined

  // Codex review finding (split-view-review-all): with the backdrop gone,
  // "OKR map" and "Manager" are visible/clickable while the mandatory
  // empty-state prompt (#B15) is open, and both unmount the split view
  // entirely (it only renders in the my-thread branch) — silently letting
  // the viewer escape a prompt that says they can't proceed without
  // setting an OKR. Disable the two controls that navigate away from
  // My Thread/Member while it's open; the mandatory panel is themselves
  // guaranteed to only ever appear when already on my-thread + member.
  const mandatoryOpen = !!dialogState?.mandatory

  function closeDialog() { setDialogState(null) }

  function handleSave() {
    if (dialogState.objective) {
      refetchIndividual()
    } else {
      refetch()
      refetchCanCreate()
      refetchIndividual()
    }
    closeDialog()
  }

  async function handleCreateQuarter() {
    const newQuarter = await createQuarter(quarters)
    if (!newQuarter) return
    await refetchQuarters()
    selectQuarter(newQuarter.id)
    setToastMessage(`New quarter "${newQuarter.name}" created.`)
  }

  async function handleRequestReview() {
    const ok = await requestReview(quarterId)
    if (!ok) return
    await refetchQuarters()
    setToastMessage(`Requested all members to review their OKR for ${currentQuarter?.name ?? 'this quarter'}.`)
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
              disabled={mandatoryOpen}
              style={{ ...toggleButtonStyle(view === 'map'), opacity: mandatoryOpen ? 0.5 : 1 }}
            >
              OKR map
            </button>
            {viewMode !== 'manager' && (
              <button
                type="button"
                aria-pressed={view === 'my-thread'}
                onClick={() => setView('my-thread')}
                style={toggleButtonStyle(view === 'my-thread')}
              >
                My OKR
              </button>
            )}
          </div>
          {quarters.length > 0 && (
            <QuarterSelector
              quarters={quarters}
              quarterId={quarterId}
              onChange={selectQuarter}
              disabled={mandatoryOpen}
            />
          )}
          <button
            type="button"
            onClick={handleCreateQuarter}
            disabled={creatingQuarter || mandatoryOpen}
            style={{ ...newQuarterButtonStyle(), opacity: mandatoryOpen ? 0.5 : 1 }}
          >
            + New quarter
          </button>
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} managerDisabled={mandatoryOpen} />
        </div>
        {view === 'my-thread' && !isPastQuarter && !hasConfirmedThisQuarter && (
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
        {viewMode === 'manager' && (
          <button
            type="button"
            onClick={handleRequestReview}
            disabled={requestingReview}
            style={{
              font: '600 13px var(--font-display)',
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid var(--hairline)',
              background: 'var(--surface)',
              color: 'var(--ink-900)',
              cursor: requestingReview ? 'default' : 'pointer',
              opacity: requestingReview ? 0.6 : 1,
            }}
          >
            {reviewRequested ? 'Re-request OKR review' : 'Request all members to review OKR'}
          </button>
        )}
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
              onKrSaved={refetch}
              readOnly={isPastQuarter}
              viewMode={viewMode}
            />
          )}
        </>
      ) : (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MyThreadPage
              ownerName={VIEWER_OWNER_NAME}
              objectives={individualObjectives}
              companyObjectives={objectives}
              onEdit={objective => setDialogState({ objective })}
              readOnly={isPastQuarter}
              selectedObjectiveId={liveDialogObjective?.id}
              reviewEnabled={reviewRequested}
            />
          </div>
          {dialogState && (
            <div style={{ width: '30%', minWidth: '360px', flexShrink: 0, position: 'sticky', top: 0 }}>
              <OkrDialog
                key={liveDialogObjective?.id ?? 'create'}
                quarterId={quarterId}
                quarterName={currentQuarter?.name}
                objective={liveDialogObjective}
                companyObjectives={objectives}
                mandatory={!!dialogState?.mandatory}
                existingDrafts={myDrafts}
                viewMode={viewMode}
                onSave={handleSave}
                onClose={closeDialog}
                onKrSaved={refetchIndividual}
              />
            </div>
          )}
        </div>
      )}
      {toastMessage && (
        <Toast
          message={toastMessage}
          visibleMs={5000}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}
