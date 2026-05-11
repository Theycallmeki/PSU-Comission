// src/components/common/StatCard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * @param {string}  color     - 'blue' | 'green' | 'amber' | 'rose' | 'violet'
 * @param {ReactNode} icon    - Lucide icon element
 * @param {string}  label     - Card label
 * @param {string}  value     - Main display value
 * @param {number}  delta     - Change value (positive / negative)
 * @param {string}  deltaLabel- e.g. "vs last year"
 * @param {string}  sub       - Small sub-text below value
 * @param {number}  delay     - Animation delay in ms
 */
export default function StatCard({ color = 'blue', icon, label, value, delta, deltaLabel, sub, delay = 0 }) {
  const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'

  return (
    <div className={`stat-card ${color}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${color}`}>{icon}</div>
        {delta !== undefined && delta !== null && (
          <div className={`stat-badge ${dir}`}>
            {dir === 'up'   && <TrendingUp  size={10} />}
            {dir === 'down' && <TrendingDown size={10} />}
            {dir === 'neutral' && <Minus size={10} />}
            {dir === 'up' ? '+' : ''}{delta}{typeof delta === 'number' && !String(delta).includes('%') ? '' : ''}
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {deltaLabel && delta !== undefined && delta !== null && (
        <div className="stat-sub">{dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'} {Math.abs(delta)} {deltaLabel}</div>
      )}
    </div>
  )
}