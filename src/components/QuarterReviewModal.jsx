import { useState, useEffect } from 'react'
import { STATUSES } from '../lib/statuses'
import useQuarterReview from '../hooks/useQuarterReview'

const panelStyle = {
  margin: '4px 0 8px',
  padding: '10px 12px',
  background: 'var(--panel)',
  border: '1px solid var(--hairline)',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  font: '500 11px var(--font-sans)',
  color: 'var(--text-secondary)',
}

const textareaStyle = {
  padding: '6px 8px',
  border: '1px solid var(--hairline)',
  borderRadius: '8px',
  font: '500 12px var(--font-sans)',
  background: 'var(--surface)',
  minHeight: '60px',
  resize: 'vertical',
}

function buttonStyle(primary) {
  return {
    font: primary ? '600 12px var(--font-sans)' : '500 12px var(--font-sans)',
    padding: '5px 10px',
    borderRadius: '8px',
    border: primary ? '1px solid var(--coral-800)' : '1px solid var(--hairline)',
    background: primary ? 'var(--coral-700)' : 'transparent',
    color: primary ? 'var(--surface)' : 'var(--text-secondary)',
    cursor: 'pointer',
  }
}

export default function QuarterReviewModal({ objectiveId, onDone }) {
  const { review, loading, save, saving, error } = useQuarterReview(objectiveId)
  const [finalStatus, setFinalStatus] = useState(review?.final_status ?? null)
  const [memberReflection, setMemberReflection] = useState(review?.member_reflection ?? '')
  const [memberConfirmed, setMemberConfirmed] = useState(!!review?.member_confirmed_at)
  const [managerComment, setManagerComment] = useState(review?.manager_comment ?? '')
  const [managerConfirmed, setManagerConfirmed] = useState(!!review?.manager_confirmed_at)

  // `review` arrives asynchronously from useQuarterReview, after this
  // component's first render — sync local form state whenever it (re)loads
  // so an existing, possibly-finalized review isn't shown as blank/unchecked
  // and later saved over with nulls (#B3).
  useEffect(() => {
    setFinalStatus(review?.final_status ?? null)
    setMemberReflection(review?.member_reflection ?? '')
    setMemberConfirmed(!!review?.member_confirmed_at)
    setManagerComment(review?.manager_comment ?? '')
    setManagerConfirmed(!!review?.manager_confirmed_at)
  }, [review])

  async function handleSave() {
    await save({
      finalStatus,
      memberReflection,
      memberConfirmed,
      managerComment,
      managerConfirmed,
    })
  }

  return (
    <div role="dialog" aria-label="Quarter review" style={panelStyle}>
      <div style={{
        padding: '8px 10px',
        borderRadius: '8px',
        background: 'var(--panel)',
        border: '1px solid var(--hairline)',
        font: '500 11px/1.5 var(--font-sans)',
        color: 'var(--text-secondary)',
      }}>
        <div>この評価は給与査定・人事考課には使用されません。振り返りと次サイクルへの学びのための対話です。</div>
        <div style={{ marginTop: '4px' }}>
          This evaluation is not used for salary or performance calibration — it is a dialogue for reflection and learning for the next cycle.
        </div>
      </div>

      <div role="radiogroup" aria-label="Final status" style={{ display: 'flex', gap: '10px' }}>
        {STATUSES.map(opt => {
          const selected = finalStatus === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={opt.label}
              onClick={() => setFinalStatus(opt.value)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '999px',
                border: `1px solid ${selected ? opt.color : 'var(--hairline)'}`,
                background: selected ? 'var(--surface)' : 'transparent',
                font: '500 12px var(--font-sans)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', background: opt.color, display: 'inline-block',
              }} />
              {opt.label}
            </button>
          )
        })}
      </div>

      <label htmlFor="member-reflection" style={labelStyle}>
        Member's reflection
        <textarea
          id="member-reflection"
          value={memberReflection}
          onChange={e => setMemberReflection(e.target.value)}
          style={textareaStyle}
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', font: '500 12px var(--font-sans)', color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={memberConfirmed}
          onChange={e => setMemberConfirmed(e.target.checked)}
        />
        Member confirms
      </label>

      <label htmlFor="manager-comment" style={labelStyle}>
        Manager's comment
        <textarea
          id="manager-comment"
          value={managerComment}
          onChange={e => setManagerComment(e.target.value)}
          style={textareaStyle}
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', font: '500 12px var(--font-sans)', color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          checked={managerConfirmed}
          onChange={e => setManagerConfirmed(e.target.checked)}
        />
        Manager confirms
      </label>

      {review?.finalized_at ? (
        <div style={{ font: '600 11px var(--font-sans)', color: 'var(--ontrack)' }}>
          Finalized at {review.finalized_at}
        </div>
      ) : (
        <div style={{ font: '500 11px var(--font-sans)', color: 'var(--text-muted)' }}>
          Not yet finalized — both sides must confirm.
        </div>
      )}

      {error && <div role="alert" style={{ font: '500 11px var(--font-sans)', color: 'var(--behind)' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
        <button type="button" onClick={() => onDone?.()} style={buttonStyle(false)}>
          Close
        </button>
        <button type="button" onClick={handleSave} disabled={saving || loading} style={buttonStyle(true)}>
          Save
        </button>
      </div>
    </div>
  )
}
