// src/pages/Dashboard.jsx
import { Users, BookOpen, TrendingUp, AlertTriangle, GraduationCap } from 'lucide-react'
import StatCard from '../components/StatCard'
import EnrollmentTrendChart from '../components/charts/EnrollmentTrendChart'
import DropoutRepeaterChart from '../components/charts/DropoutRepeaterChart'
import { useEnrollment } from '../hooks/useEnrollment'
import { usePerformance } from '../hooks/usePerformance'
import { useResources } from '../hooks/useResources'
import { yoyChange, seatUtilization } from '../utils/calculations'
import { formatPercent, formatRatio } from '../utils/formatters'
import { SCHOOL_INFO } from '../constants/schoolInfo'

export default function Dashboard() {
  const enrollment  = useEnrollment()
  const performance = usePerformance()
  const resources   = useResources()

  if (enrollment.loading || performance.loading || resources.loading) {
    return <div className="loading-state">Loading dashboard data…</div>
  }

  const yoy         = yoyChange(enrollment.data)
  const curr        = enrollment.current
  const currPerf    = performance.current
  const currRes     = resources.current
  const seatUtil    = seatUtilization(currRes?.students, currRes?.seats)

  return (
    <div className="page-wrapper">
      {/* School Info Banner */}
      <div className="school-banner">
        <div className="school-banner-icon"><GraduationCap size={24} /></div>
        <div>
          <h2 className="school-banner-name">{SCHOOL_INFO.name}</h2>
          <p className="school-banner-sub">
            {SCHOOL_INFO.address} &nbsp;·&nbsp; {SCHOOL_INFO.division} &nbsp;·&nbsp; Est. {SCHOOL_INFO.established}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          color="blue"
          icon={<Users size={18} />}
          label="Total Enrolled (Current SY)"
          value={curr?.total ?? '—'}
          delta={yoy?.absolute}
          deltaLabel="students vs last year"
          delay={0}
        />
        <StatCard
          color="green"
          icon={<TrendingUp size={18} />}
          label="Retention Rate"
          value={currPerf?.promoted ? formatPercent((currPerf.promoted / currPerf.enrolled) * 100) : 'In Progress'}
          sub="Promoted students"
          delay={80}
        />
        <StatCard
          color="amber"
          icon={<BookOpen size={18} />}
          label="Seat Utilization"
          value={formatPercent(seatUtil)}
          sub={`${currRes?.seats} seats available`}
          delta={seatUtil > 95 ? 'High' : null}
          delay={160}
        />
        <StatCard
          color="rose"
          icon={<AlertTriangle size={18} />}
          label="Dropouts (Current SY)"
          value={currPerf?.dropouts ?? '—'}
          sub={`${currPerf?.repeaters ?? '—'} repeaters`}
          delay={240}
        />
        <StatCard
          color="violet"
          icon={<Users size={18} />}
          label="Teacher–Student Ratio"
          value={formatRatio(currRes?.students, currRes?.teachers)}
          sub={`${currRes?.teachers} teachers on staff`}
          delay={320}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid-2">
        <EnrollmentTrendChart data={enrollment.trend} />
        <DropoutRepeaterChart data={performance.trend} />
      </div>

      {/* Quick Summary */}
      <div className="summary-card">
        <h3 className="summary-title">5-Year Snapshot (SY 2021–2022 to 2025–2026)</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-num blue">+{yoy ? enrollment.data[enrollment.data.length-1].total - enrollment.data[0].total : '—'}</span>
            <span className="summary-desc">Total enrollment growth over 5 years</span>
          </div>
          <div className="summary-item">
            <span className="summary-num green">↓{(enrollment.data[0] ? performance.data[0]?.dropouts : '—')}</span>
            <span className="summary-desc">Dropouts in first tracked year</span>
          </div>
          <div className="summary-item">
            <span className="summary-num amber">+{(resources.data[resources.data.length-1]?.classrooms ?? 0) - (resources.data[0]?.classrooms ?? 0)}</span>
            <span className="summary-desc">Additional classrooms since 2021</span>
          </div>
          <div className="summary-item">
            <span className="summary-num violet">+{(resources.data[resources.data.length-1]?.teachers ?? 0) - (resources.data[0]?.teachers ?? 0)}</span>
            <span className="summary-desc">Additional teachers hired</span>
          </div>
        </div>
      </div>
    </div>
  )
}