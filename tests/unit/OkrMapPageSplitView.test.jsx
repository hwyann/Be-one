import { render, screen, fireEvent, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// This suite exercises the REAL OkrDialog and MyThreadPage (unlike
// OkrMapPage.test.jsx, which mocks both) specifically to prove the
// split-view remount fix: when the viewer clicks a different objective's
// card while the detail panel is already open, dialogState.objective goes
// directly from one non-null value to another non-null value without ever
// passing through null. Without a `key` on OkrDialog tied to the shown
// objective, React would keep the same OkrDialog instance mounted and its
// internal `title` state (initialized once via useState) would keep
// showing the previous objective's data (split-view-review-all).

const mocks = vi.hoisted(() => ({
  useCompanyObjectives: vi.fn(),
  useIndividualObjectives: vi.fn(),
  useActiveQuarter: vi.fn(),
  useViewMode: vi.fn(),
  useCanCreateObjective: vi.fn(),
  useCreateQuarter: vi.fn(),
}))

vi.mock('../../src/hooks/useCompanyObjectives', () => ({ default: mocks.useCompanyObjectives }))
vi.mock('../../src/hooks/useIndividualObjectives', () => ({ default: mocks.useIndividualObjectives }))
vi.mock('../../src/hooks/useActiveQuarter', () => ({ default: mocks.useActiveQuarter }))
vi.mock('../../src/hooks/useViewMode', () => ({ default: mocks.useViewMode }))
vi.mock('../../src/hooks/useCanCreateObjective', () => ({ default: mocks.useCanCreateObjective }))
vi.mock('../../src/hooks/useCreateQuarter', () => ({ default: mocks.useCreateQuarter }))

// OkrDialog and its descendants (ObjectiveCard, KrListInline, etc.) reach
// live hooks that hit supabase on mount (useRationale, useCheckInHistory).
// Stub those out the same way tests/unit/OkrDialog.test.jsx does, so this
// stays a fast, deterministic unit test rather than an integration test
// against a real backend.
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      update: () => ({ eq: () => ({ select: () => Promise.resolve({ data: [], error: null }) }) }),
    }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: { status: 'insufficient_data' }, error: null }) },
  },
}))

vi.mock('../../src/hooks/useRationale', () => ({
  default: () => ({ rationale: [], loading: false, error: null, saving: false, save: vi.fn(), refetch: vi.fn() }),
}))

vi.mock('../../src/hooks/useCheckIns', () => ({
  default: () => ({ save: vi.fn(), saving: false, error: null }),
}))

vi.mock('../../src/hooks/useCheckInHistory', () => ({
  default: () => ({ checkIns: [], loading: false, error: null }),
}))

import OkrMapPage from '../../src/components/OkrMapPage'

const individualObjectives = [
  { id: 'io-1', title: 'Objective A', owner_name: 'Satoshi Kimura', status: 'confirmed', key_results: [] },
  { id: 'io-2', title: 'Objective B', owner_name: 'Satoshi Kimura', status: 'confirmed', key_results: [] },
]

describe('OkrMapPage split view — OkrDialog remount on switching objectives', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useCompanyObjectives.mockReturnValue({ objectives: [], loading: false, error: null, refetch: vi.fn() })
    mocks.useIndividualObjectives.mockReturnValue({
      objectives: individualObjectives, loading: false, error: null, refetch: vi.fn(),
    })
    mocks.useActiveQuarter.mockReturnValue({
      quarterId: 'q1',
      quarters: [{ id: 'q1', label: 'Q1 2026', is_active: true }],
      error: null,
      selectQuarter: vi.fn(),
      refetch: vi.fn(),
    })
    mocks.useViewMode.mockReturnValue({ viewMode: 'member', setViewMode: vi.fn() })
    mocks.useCanCreateObjective.mockReturnValue({ canCreate: true, loading: false, error: null, refetch: vi.fn() })
    mocks.useCreateQuarter.mockReturnValue({ createQuarter: vi.fn(), creating: false, error: null })
  })

  // Both objectives are `status: 'confirmed'` (required for MyThreadPage to
  // list them as cards at all), which means OkrDialog renders the title via
  // its *stale-prone* path — a plain <div> populated from the `title`
  // useState initializer — rather than the always-fresh-from-props <input>
  // used while editing. The ObjectiveCard preview further down the same
  // dialog also happens to show the title, in a <span>, straight from props
  // (never stale) — so disambiguate by tag name to check the state-backed
  // <div>, which is the one this fix actually targets.
  function dialogTitleDivText(dialog) {
    return within(dialog).getAllByText(/^Objective (A|B)$/)
      .find(el => el.tagName === 'DIV')?.textContent
  }

  it("shows the newly-selected objective's data, not a stale previous one, when a different card is clicked while the panel is already open", () => {
    render(<OkrMapPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Objective A' }))
    let dialog = screen.getByRole('dialog')
    expect(dialogTitleDivText(dialog)).toBe('Objective A')

    // Switch directly to a different objective's card without ever closing
    // the panel — dialogState.objective goes from A straight to B.
    fireEvent.click(screen.getByRole('button', { name: 'Objective B' }))
    dialog = screen.getByRole('dialog')
    expect(dialogTitleDivText(dialog)).toBe('Objective B')
  })

  it('keeps the My Thread list visible (a genuine split, not a full overlay) while the detail panel is open', () => {
    render(<OkrMapPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Objective A' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // Both cards remain in the document/visible — the left column isn't
    // replaced or hidden by the right-hand detail panel.
    expect(screen.getByRole('button', { name: 'Objective A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Objective B' })).toBeInTheDocument()
  })
})
