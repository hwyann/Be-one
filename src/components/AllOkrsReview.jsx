import { QuarterReviewFields } from './QuarterReviewModal'

const backdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(19,30,40,.4)',
  zIndex: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const panelStyle = {
  width: '640px',
  maxWidth: '90vw',
  maxHeight: '85vh',
  overflowY: 'auto',
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
  borderRadius: '14px',
  boxShadow: '0 4px 16px rgba(19,30,40,.18)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

const headerRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const headingStyle = {
  font: '700 18px var(--font-display)',
  color: 'var(--ink-900)',
}

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--hairline)',
}

const sectionHeadingStyle = {
  font: '700 14px var(--font-display)',
  color: 'var(--ink-900)',
}

function closeButtonStyle() {
  return {
    font: '600 12px var(--font-sans)',
    padding: '5px 10px',
    borderRadius: '8px',
    border: '1px solid var(--hairline)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  }
}

// "Review all at once" screen (#B22 follow-up, split-view-review-all) — lets
// the member work through every one of their confirmed objectives for the
// quarter in a single sitting instead of opening each one's drawer
// individually. There's no single "review all" row in the schema: each
// objective still has its own quarter_reviews row (one per objective_id),
// so this component just presents QuarterReviewFields per objective — it
// doesn't merge them into one record.
export default function AllOkrsReview({ objectives = [], onClose }) {
  return (
    <div style={backdropStyle}>
      <div role="dialog" aria-label="Review all OKRs" style={panelStyle}>
        <div style={headerRowStyle}>
          <div style={headingStyle}>Review all OKRs</div>
          <button type="button" onClick={() => onClose?.()} style={closeButtonStyle()}>
            Close
          </button>
        </div>
        {objectives.map(objective => (
          <div key={objective.id} style={sectionStyle}>
            <div style={sectionHeadingStyle}>{objective.title}</div>
            <QuarterReviewFields objectiveId={objective.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
