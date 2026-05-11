// src/pages/performance/PerformanceAnalytics.jsx
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

import StatCard             from '../../components/StatCard'
import DropoutRepeaterChart from '../../components/charts/DropoutRepeaterChart'

import { usePerformance }   from '../../hooks/usePerformance'
import { retentionRate, dropoutRate, repeaterRate } from '../../utils/calculations'
import { formatPercent }    from '../../utils/formatters'

export default function PerformanceAnalytics() {
  const { data, trend, current, previous, loading, error } = usePerformance()

  if (loading) return <div className="loading-state">Loading performance data…</div>
  if (error)   return <div className="error-state">Error: {error}</div>

  const retention = retentionRate(current?.promoted, current?.enrolled)
  const dropout   = dropoutRate(current?.dropouts, current?.enrolled)
  const repeater  = repeaterRate(current?.repeaters, current?.enrolled)

  const prevDropout  = previous ? dropoutRate(previous.dropouts, previous.enrolled) : null
  const dropoutDelta = prevDropout && dropout ? parseFloat((dropout - prevDropout).toFixed(2)) : null

  return (
    <div className="page-wrapper">
      {/* ── Stat Cards ── */}
      <div className="stats-grid">
        <StatCard
          color="green"
          icon={<CheckCircle size={18} />}
          label="Retention Rate (Prev. SY)"
          value={formatPercent(retention)}
          sub="Students promoted to next grade"
          delay={0}
        />
        <StatCard
          color="rose"
          icon={<TrendingDown size={18} />}
          label="Dropout Count (Current SY)"
          value={current?.dropouts ?? '—'}
          delta={dropoutDelta}
          deltaLabel="% rate vs prev year"
          delay={80}
        />
        <StatCard
          color="amber"
          icon={<AlertTriangle size={18} />}
          label="Repeaters (Current SY)"
          value={current?.repeaters ?? '—'}
          sub={`${formatPercent(repeater)} of enrolled`}
          delay={160}
        />
        <StatCard
          color="blue"
          icon={<TrendingUp size={18} />}
          label="Dropout Rate"
          value={formatPercent(dropout, 2)}
          sub="As % of total enrolled"
          delay={240}
        />
      </div>

      {/* ── Dropout & Repeater Chart ── */}
      <DropoutRepeaterChart data={trend} />

      {/* ── Trend Analysis ── */}
      <div className="insight-card">
        <h3 className="chart-title" style={{ marginBottom: 12 }}>Trend Analysis</h3>
        <div className="insight-grid">
          <div className="insight-item green">
            <CheckCircle size={16} />
            <p>Repeater count has been <strong>declining</strong> from 14 (SY 21-22) to 8 (SY 25-26), indicating improved instructional support.</p>
          </div>
          <div className="insight-item amber">
            <AlertTriangle size={16} />
            <p>Dropout counts remain <strong>relatively stable</strong> at 5–10 per year. Root causes (economic, family) warrant further case-level investigation.</p>
          </div>
          <div className="insight-item blue">
            <TrendingUp size={16} />
            <p>Promotion rates have been <strong>consistently above 93%</strong>, showing strong overall learning support across grade levels.</p>
          </div>
        </div>
      </div>
    </div>
  )
}