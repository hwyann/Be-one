import { useState } from 'react'

const STORAGE_KEY = 'be-one:view-mode'
const DEFAULT_VIEW_MODE = 'member'
const VALID_VIEW_MODES = ['member', 'manager']

function readStoredViewMode() {
  if (typeof window === 'undefined') return DEFAULT_VIEW_MODE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return VALID_VIEW_MODES.includes(stored) ? stored : DEFAULT_VIEW_MODE
}

export default function useViewMode() {
  const [viewMode, setViewModeState] = useState(readStoredViewMode)

  function setViewMode(mode) {
    setViewModeState(mode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode)
    }
  }

  return { viewMode, setViewMode }
}
