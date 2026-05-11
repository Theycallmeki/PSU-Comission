// src/components/charts/EnrollmentTrendChart.jsx
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
  } from 'recharts'
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">SY {label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  
  export default function EnrollmentTrendChart({ data }) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Enrollment Trend</h3>
            <p className="chart-sub">Total, Male & Female — SY 2021 to 2026</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradFemale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sy" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }} />
            <Area type="monotone" dataKey="total"  name="Total"  stroke="#3b82f6" strokeWidth={2} fill="url(#gradTotal)"  dot={{ fill: '#3b82f6', r: 3 }} />
            <Area type="monotone" dataKey="male"   name="Male"   stroke="#8b5cf6" strokeWidth={2} fill="url(#gradMale)"   dot={{ fill: '#8b5cf6', r: 3 }} />
            <Area type="monotone" dataKey="female" name="Female" stroke="#f43f5e" strokeWidth={2} fill="url(#gradFemale)" dot={{ fill: '#f43f5e', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }