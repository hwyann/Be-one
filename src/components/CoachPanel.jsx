import { useState } from 'react'

const QUESTIONS = [
  {
    id: 'outcome',
    text: 'これが達成されたら、他の誰か（クライアント・チームメンバー・会社）にとって、何もしなければ変わらなかった何が変わりますか？',
  },
  {
    id: 'alignment',
    text: 'もしこれらのKRが目標の前進につながらなかったとしても、あなたはそれらをやりますか？',
  },
]

export default function CoachPanel({ onSkip }) {
  const [answers, setAnswers] = useState({})

  function handleAnswerChange(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <div role="group" aria-label="Coach me">
      {QUESTIONS.map((question) => (
        <div key={question.id}>
          <label htmlFor={`coach-question-${question.id}`}>{question.text}</label>
          <textarea
            id={`coach-question-${question.id}`}
            value={answers[question.id] ?? ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={onSkip}>
        Skip coaching
      </button>
    </div>
  )
}
