import { useState } from 'react'
import CheckInPanel from './CheckInPanel'
import CheckInHistory from './CheckInHistory'

function TriggerButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        font: '500 11px var(--font-sans)',
        padding: '3px 8px',
        borderRadius: '999px',
        border: '1px solid var(--hairline)',
        background: 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export function useCheckInPanelRegion(kr) {
  const linked = kr.individual_objectives ?? []
  const checkInTarget = linked.find(o => o.id)
  const [panelMode, setPanelMode] = useState(null)
  return { checkInTarget, panelMode, setPanelMode }
}

export function CheckInTriggers({ region }) {
  const { checkInTarget, panelMode, setPanelMode } = region
  if (!checkInTarget) return null
  function toggle(mode) {
    setPanelMode(prev => (prev === mode ? null : mode))
  }
  return (
    <>
      {panelMode !== 'checkin' && (
        <TriggerButton label="Check in" onClick={() => toggle('checkin')} />
      )}
      <TriggerButton label="History" onClick={() => toggle('history')} />
    </>
  )
}

export function CheckInPanels({ region, onCheckInSaved }) {
  const { checkInTarget, panelMode, setPanelMode } = region
  if (!checkInTarget) return null
  return (
    <>
      {panelMode === 'checkin' && (
        <CheckInPanel
          individualObjectiveId={checkInTarget.id}
          onSaved={onCheckInSaved}
          onDone={() => setPanelMode(null)}
        />
      )}
      {panelMode === 'history' && (
        <CheckInHistory individualObjectiveId={checkInTarget.id} />
      )}
    </>
  )
}
