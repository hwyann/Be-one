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
    link_type: 'direct_kr',
    linked_company_objective_id: 'co-1',
    key_result_id: 'kr-1',
  },
  {
    id: 'io-2',
    title: 'Interview 10 users',
    owner_name: 'Satoshi Kimura',
    link_type: 'objective_level',
    linked_company_objective_id: 'co-2',
    key_result_id: null,
  },
  {
    id: 'io-3',
    title: 'Hire designer',
    owner_name: 'Hiroshi Tanaka',
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

  it('renders a "My thread" heading when the viewer has at least one objective', () => {
    render(
      <MyThreadPage
        ownerName="Satoshi Kimura"
        objectives={objectives}
        companyObjectives={companyObjectives}
      />
    )
    expect(screen.getByText(/my thread/i)).toBeInTheDocument()
  })
})
