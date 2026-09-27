import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MyThreadPage from '../../src/components/MyThreadPage'

const companyObjectives = [
  {
    id: 'co-1',
    title: 'Grow revenue',
    key_results: [
      { id: 'kr-1', title: 'Reach 100 accounts' },
      { id: 'kr-2', title: 'Launch APAC' },
    ],
  },
  {
    id: 'co-2',
    title: 'Improve retention',
    key_results: [],
  },
]

const objectives = [
  {
    id: 'io-1',
    title: 'Ship MVP',
    owner_name: 'Satoshi Kimura',
    status: 'confirmed',
    link_type: 'direct_kr',
    linked_company_objective_id: 'co-1',
    key_result_id: 'kr-1',
  },
  {
    id: 'io-2',
    title: 'Interview 10 users',
    owner_name: 'Satoshi Kimura',
    status: 'confirmed',
    link_type: 'objective_level',
    linked_company_objective_id: 'co-2',
    key_result_id: null,
  },
  {
    id: 'io-3',
    title: 'Hire designer',
    owner_name: 'Hiroshi Tanaka',
    status: 'confirmed',
    link_type: 'objective_level',
    linked_company_objective_id: 'co-1',
    key_result_id: null,
  },
]

describe('MyThreadPage', () => {
  it('renders each of the viewer\'s objectives', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={objectives}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.getByText('Ship MVP')).toBeInTheDocument()
    expect(screen.getByText('Interview 10 users')).toBeInTheDocument()
  })

  it('does not render objectives owned by other contributors', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={objectives}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.queryByText('Hire designer')).not.toBeInTheDocument()
  })

  it('shows the linked company objective title for a direct_kr row', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={[objectives[0]]}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.getByText(/Grow revenue/)).toBeInTheDocument()
  })

  it('labels the company-OKR link with "Linked to Company OKR: "', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={[objectives[0]]}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.getByText(/^Linked to Company OKR: Grow revenue/)).toBeInTheDocument()
  })

  it('shows the linked KR title for direct_kr rows', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={[objectives[0]]}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.getByText(/Reach 100 accounts/)).toBeInTheDocument()
  })

  it('shows the linked company objective title for an objective_level row', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={[objectives[1]]}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.getByText(/Improve retention/)).toBeInTheDocument()
  })

  it('does not render any KR title for an objective_level row', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={[objectives[1]]}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.queryByText(/Reach 100 accounts/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Launch APAC/)).not.toBeInTheDocument()
  })

  it('calls onEdit with the objective when a row is clicked', () => {
    const onEdit = vi.fn()
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={objectives}
        companyObjectives={companyObjectives}
        onEdit={onEdit}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /Ship MVP/ }))
    expect(onEdit).toHaveBeenCalledWith(objectives[0])
  })

  it('renders nothing when the viewer has no objectives', () => {
    render(
      <MyThreadPage
        ownerName="Nobody Here"
        objectives={objectives}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.queryByText('Ship MVP')).not.toBeInTheDocument()
    expect(screen.queryByText('Interview 10 users')).not.toBeInTheDocument()
    expect(screen.queryByText('Hire designer')).not.toBeInTheDocument()
  })

  it('renders a "My Current OKR" heading when the viewer has at least one objective', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={objectives}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.getByText(/my current okr/i)).toBeInTheDocument()
  })

  it('renders the heading as a prominent, non-kicker section heading (bigger font, no uppercase treatment)', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={objectives}
        companyObjectives={companyObjectives}
      />
    )
    const heading = screen.getByText(/my current okr/i)
    expect(heading.style.font).toContain('20px')
    expect(heading.style.textTransform).not.toBe('uppercase')
  })

  describe('draft objectives are not shown as cards (#B17/#B18)', () => {
    it('does not render a card for an objective with status "draft"', () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[{ ...objectives[0], status: 'draft' }]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.queryByText('Ship MVP')).not.toBeInTheDocument()
    })

    it('renders nothing (no "My Current OKR" heading either) when the viewer only has drafts', () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[{ ...objectives[0], status: 'draft' }, { ...objectives[1], status: 'draft' }]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.queryByText(/my current okr/i)).not.toBeInTheDocument()
    })

    it('renders confirmed objectives even when a draft also exists alongside them', () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[objectives[0], { ...objectives[1], status: 'draft' }]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.getByText('Ship MVP')).toBeInTheDocument()
      expect(screen.queryByText('Interview 10 users')).not.toBeInTheDocument()
    })
  })

  describe("objective's own key results", () => {
    it("renders each of the objective's own key results", () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[{
            ...objectives[0],
            key_results: [
              { id: 'own-kr-1', title: 'Ship v1 to prod' },
              { id: 'own-kr-2', title: 'Onboard 3 pilot customers' },
            ],
          }]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.getByText('Ship v1 to prod')).toBeInTheDocument()
      expect(screen.getByText('Onboard 3 pilot customers')).toBeInTheDocument()
    })

    it("renders a key result's target_note as muted secondary text when present", () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[{
            ...objectives[0],
            key_results: [
              { id: 'own-kr-1', title: 'Ship v1 to prod', target_note: 'by end of quarter' },
            ],
          }]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.getByText('Ship v1 to prod')).toBeInTheDocument()
      expect(screen.getByText('by end of quarter')).toBeInTheDocument()
    })

    it('does not render a target_note when the key result has none', () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[{
            ...objectives[0],
            key_results: [{ id: 'own-kr-1', title: 'Ship v1 to prod' }],
          }]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.getByText('Ship v1 to prod')).toBeInTheDocument()
    })

    it('renders fine with no crash and no empty KR list when the objective has zero key results', () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[{ ...objectives[0], key_results: [] }]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.getByText('Ship MVP')).toBeInTheDocument()
      expect(screen.queryByTestId('objective-krs-io-1')).not.toBeInTheDocument()
    })

    it('renders fine when key_results is not provided on the objective at all', () => {
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={[objectives[0]]}
          companyObjectives={companyObjectives}
        />
      )
      expect(screen.getByText('Ship MVP')).toBeInTheDocument()
    })
  })

  describe('read-only past quarter (#5a-2)', () => {
    it('disables the edit trigger when readOnly is true', () => {
      const onEdit = vi.fn()
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={objectives}
          companyObjectives={companyObjectives}
          onEdit={onEdit}
          readOnly
        />
      )
      expect(screen.getByRole('button', { name: /Ship MVP/ })).toBeDisabled()
      fireEvent.click(screen.getByRole('button', { name: /Ship MVP/ }))
      expect(onEdit).not.toHaveBeenCalled()
    })

    it('keeps the edit trigger enabled when readOnly is false', () => {
      const onEdit = vi.fn()
      render(
        <MyThreadPage
          ownerName="Satoshi Kimura"
          objectives={objectives}
          companyObjectives={companyObjectives}
          onEdit={onEdit}
          readOnly={false}
        />
      )
      expect(screen.getByRole('button', { name: /Ship MVP/ })).not.toBeDisabled()
      fireEvent.click(screen.getByRole('button', { name: /Ship MVP/ }))
      expect(onEdit).toHaveBeenCalledWith(objectives[0])
    })
  })
})
