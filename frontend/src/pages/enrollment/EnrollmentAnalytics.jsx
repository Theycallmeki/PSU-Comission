// src/pages/enrollment/EnrollmentAnalytics.jsx
import { Users, TrendingUp, User } from 'lucide-react'

import StatCard              from '../../components/StatCard'
import EnrollmentTrendChart  from '../../components/charts/EnrollmentTrendChart'

import { useEnrollment }     from '../../hooks/useEnrollment'
import { totalGrowth, yoyChange, femaleShare } from '../../utils/calculations'
import { formatPercent }     from '../../utils/formatters'

export default function EnrollmentAnalytics() {
  const { data, trend, current, loading, error } = useEnrollment()

  if (loading) return <div className="loading-state">Loading enrollment data…</div>
  if (error)   return <div className="error-state">Error: {error}</div>

  const growth = totalGrowth(data)
  const yoy    = yoyChange(data)
  const fShare = femaleShare(current?.female, current?.total)

  return (
    <div className="page-wrapper">
      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard
          color="blue"
          icon={<Users size={18} />}
          label="Current Enrollment"
          value={current?.total ?? '—'}
          delta={yoy?.absolute}
          deltaLabel="vs last SY"
          delay={0}
        />
        <StatCard
          color="green"
          icon={<TrendingUp size={18} />}
          label="5-Year Growth"
          value={`+${growth?.absolute ?? '—'}`}
          sub={`${formatPercent(growth?.percent)} overall increase`}
          delay={80}
        />
        <StatCard
          color="violet"
          icon={<User size={18} />}
          label="Male Enrolled"
          value={current?.male ?? '—'}
          sub={`${formatPercent(100 - fShare)} of total`}
          delay={160}
        />
        <StatCard
          color="rose"
          icon={<User size={18} />}
          label="Female Enrolled"
          value={current?.female ?? '—'}
          sub={`${formatPercent(fShare)} of total`}
          delay={240}
        />
      </div>

      {/* ── Trend Chart ── */}
      <EnrollmentTrendChart data={trend} />
    </div>
  )
}