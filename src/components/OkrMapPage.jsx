import useCompanyObjectives from '../hooks/useCompanyObjectives'
import ObjectiveCard from './ObjectiveCard'

export default function OkrMapPage() {
  const { objectives, loading, error } = useCompanyObjectives()

  if (loading) return <div>Loading...</div>
  if (error) return <p role="alert">{error}</p>

  return (
    <div style={{ minWidth: '980px', padding: '24px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '14px',
      }}>
        {objectives.map(objective => (
          <ObjectiveCard key={objective.id} objective={objective} />
        ))}
      </div>
    </div>
  )
}
