// src/components/charts/ResourceUtilizationChart.jsx
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ReferenceLine,
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
  
  export default function ResourceUtilizationChart({ data }) {
    return (
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Resource Utilization</h3>
            <p className="chart-sub">Students vs Seats & Teacher Ratio</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sy" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }} />
            <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'DepEd Limit', fill: '#f59e0b', fontSize: 10 }} />
            <Line type="monotone" dataKey="students"  name="Students"  stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
            <Line type="monotone" dataKey="seats"     name="Seats"     stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
            <Line type="monotone" dataKey="ratio"     name="Ratio (student/teacher)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }