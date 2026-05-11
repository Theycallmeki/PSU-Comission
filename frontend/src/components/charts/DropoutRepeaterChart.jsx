// src/components/charts/DropoutRepeaterChart.jsx
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
  } from 'recharts'
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">SY {label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: <strong>{p.value ?? '—'}</strong>
          </p>
        ))}
      </div>
    )
  }
  
  export default function DropoutRepeaterChart({ data }) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Dropouts & Repeaters</h3>
            <p className="chart-sub">Annual count — SY 2021 to 2026</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sy" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }} />
            <Bar dataKey="dropouts"  name="Dropouts"  fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="repeaters" name="Repeaters" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }