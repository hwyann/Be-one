import { useNavigate } from 'react-router-dom'
import useActiveQuarter from '../hooks/useActiveQuarter'
import useIndividualObjectives from '../hooks/useIndividualObjectives'
import { VIEWER_OWNER_NAME } from '../lib/viewer'
import { QuarterReviewFields } from './QuarterReviewModal'

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  paddingBottom: '16px',
  marginBottom: '16px',
  borderBottom: '1px solid var(--hairline)',
}

const sectionHeadingStyle = {
  font: '700 14px var(--font-display)',
  color: 'var(--ink-900)',
}

function backButtonStyle() {
  return {
    font: '600 12px var(--font-sans)',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--hairline)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
}

// A real routed page now, not a modal overlay (#B27) — reached from the
// gated Review button on My OKR view. Each objective's QuarterReviewFields
// already saves independently to its own quarter_reviews row (#B3), so
// navigating here, filling in a few fields, hitting Save, and leaving
// without finalizing both sides works as "save as draft" out of the box —
// nothing extra to build for that part.
export default function ReviewPage() {
  const navigate = useNavigate()
  const { quarterId, quarters } = useActiveQuarter()
  const { objectives, loading } = useIndividualObjectives(quarterId)
  const quarterName = quarters.find(q => q.id === quarterId)?.name

  const mine = objectives.filter(
    o => o.owner_name === VIEWER_OWNER_NAME && o.status === 'confirmed',
  )

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '18px',
      }}>
        <div style={{ font: '700 20px var(--font-display)', color: 'var(--ink-900)' }}>
          Review your OKR{quarterName ? ` — ${quarterName}` : ''}
        </div>
        <button type="button" onClick={() => navigate('/')} style={backButtonStyle()}>
          Back
        </button>
      </div>
      <div style={{ font: '500 12px var(--font-sans)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Each objective saves on its own — fill in what you have and hit Save;
        you can come back and finish later.
      </div>
      {loading && <div>Loading...</div>}
      {!loading && mine.length === 0 && (
        <div style={{ font: '500 12px var(--font-sans)', color: 'var(--text-muted)' }}>
          No confirmed OKR to review yet.
        </div>
      )}
      {mine.map(objective => (
        <div key={objective.id} style={sectionStyle}>
          <div style={sectionHeadingStyle}>{objective.title}</div>
          <QuarterReviewFields objectiveId={objective.id} />
        </div>
      ))}
    </div>
  )
}
