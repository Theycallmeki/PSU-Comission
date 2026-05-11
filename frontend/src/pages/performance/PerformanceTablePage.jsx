// src/pages/performance/PerformanceTablePage.jsx
import PerformanceTable   from '../../components/tables/PerformanceTable'
import { usePerformance } from '../../hooks/usePerformance'

export default function PerformanceTablePage() {
  const { data, loading, error } = usePerformance()

  if (loading) return <div className="loading-state">Loading performance data…</div>
  if (error)   return <div className="error-state">Error: {error}</div>

  return (
    <div className="page-wrapper">
      <PerformanceTable data={data} />
    </div>
  )
}