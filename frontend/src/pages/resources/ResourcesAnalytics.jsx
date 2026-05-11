// src/pages/resources/ResourcesAnalytics.jsx
import { BookOpen, Users, Home, AlertTriangle } from 'lucide-react'

import StatCard                 from '../../components/StatCard'
import ResourceUtilizationChart from '../../components/charts/ResourceUtilizationChart'

import { useResources }         from '../../hooks/useResources'
import { seatUtilization }      from '../../utils/calculations'
import { formatPercent, formatRatio, formatSY } from '../../utils/formatters'
import { DEPED_RATIO_STANDARD } from '../../data/resourcesData'

export default function ResourcesAnalytics() {
  const { trend, current, loading, error } = useResources()

  if (loading) return <div className="loading-state">Loading resources data…</div>
  if (error)   return <div className="error-state">Error: {error}</div>

  const seatUtil   = seatUtilization(current?.students, current?.seats)
  const isOverRatio = current?.ratio > DEPED_RATIO_STANDARD

  return (
    <div className="page-wrapper">
      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard
          color="blue"
          icon={<Home size={18} />}
          label="Total Classrooms"
          value={current?.classrooms ?? '—'}
          sub={`Current SY: ${formatSY('2025-2026')}`}
          delay={0}
        />
        <StatCard
          color="green"
          icon={<BookOpen size={18} />}
          label="Available Seats"
          value={current?.seats ?? '—'}
          sub={`${formatPercent(seatUtil)} utilized`}
          delay={80}
        />
        <StatCard
          color={isOverRatio ? 'rose' : 'emerald'}
          icon={<Users size={18} />}
          label="Teacher–Student Ratio"
          value={formatRatio(current?.students, current?.teachers)}
          sub={`DepEd standard: ${DEPED_RATIO_STANDARD}:1`}
          delay={160}
        />
        <StatCard
          color="amber"
          icon={<AlertTriangle size={18} />}
          label="Seat Utilization"
          value={formatPercent(seatUtil)}
          sub={seatUtil > 95 ? '⚠ Near capacity' : '✓ Adequate'}
          delay={240}
        />
      </div>

      {/* ── Chart ── */}
      <ResourceUtilizationChart data={trend} />

      {/* ── Insights ── */}
      <div className="insight-card">
        <h3 className="chart-title" style={{ marginBottom: 12 }}>
          Resource Adequacy Assessment
        </h3>
        <div className="insight-grid">
          <div className="insight-item green">
            <BookOpen size={16} />
            <p>
              Classrooms increased from <strong>8 to 10</strong> over 5 years,
              keeping pace with enrollment growth.
            </p>
          </div>
          <div className="insight-item blue">
            <Users size={16} />
            <p>
              Teacher count grew from <strong>9 to 11</strong>, maintaining a
              ratio within DepEd's 40:1 standard each year.
            </p>
          </div>
          <div className="insight-item amber">
            <AlertTriangle size={16} />
            <p>
              Seat utilization is approaching <strong>89%</strong>. Continued
              enrollment growth may require additional classroom investment by
              SY 2027–2028.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}