import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine
} from 'recharts';
import {
  Users, GraduationCap, Armchair, Ratio, Activity, Calendar, ChevronDown
} from 'lucide-react';
import { analyticsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';

/* ─────────────────────────────────────────
   Year Dropdown (same pattern as ClassroomAnalytics)
───────────────────────────────────────── */
const YearDropdown = ({ years, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="year-dropdown-wrapper" ref={ref}>
      <button
        className="year-dropdown-trigger"
        onClick={() => setOpen(prev => !prev)}
        type="button"
      >
        <Calendar size={16} className="year-dropdown-icon" />
        <span className="year-dropdown-label">SY {value}</span>
        <ChevronDown
          size={16}
          className={`year-dropdown-chevron ${open ? 'open' : ''}`}
        />
      </button>

      {open && (
        <ul className="year-dropdown-list" role="listbox">
          {years.map(year => (
            <li
              key={year}
              role="option"
              aria-selected={year === value}
              className={`year-dropdown-item ${year === value ? 'active' : ''}`}
              onClick={() => { onChange(year); setOpen(false); }}
            >
              {year === value && <span className="year-dropdown-check">✓</span>}
              SY {year}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────
   Custom Tooltip — Bar
───────────────────────────────────────── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '10px 16px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      fontSize: '0.875rem',
    }}>
      <p style={{ fontWeight: 700, color: '#2c3e50', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.stroke, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Custom Tooltip — Line
───────────────────────────────────────── */
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '10px 16px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      fontSize: '0.875rem',
    }}>
      <p style={{ fontWeight: 700, color: '#2c3e50', marginBottom: '4px' }}>SY {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.stroke, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const BAR_COLORS = ['#e74c3c', '#e74c3c', '#e74c3c'];

/* ─────────────────────────────────────────
   TeachersSeatsAnalytics
───────────────────────────────────────── */
const TeachersSeatsAnalytics = () => {
  const [history, setHistory]       = useState([]); // all fetched stats snapshots
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  // Since getQuickStats returns only the LATEST year's data,
  // we fetch once and treat it as a single data point.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res  = await analyticsApi.getQuickStats();
        const data = res?.data || res;

        if (!data || data.schoolYear === 'N/A') {
          setHistory([]);
          setError('No analytics data available. Please add enrollment and classroom records first.');
          return;
        }

        // Wrap single record in array so charts work uniformly
        const record = {
          school_year:           data.schoolYear,
          teacher_count:         data.teacherCount,
          seat_count:            data.seatCount,
          total_enrollees:       data.totalEnrollees,
          student_teacher_ratio: data.studentTeacherRatio,
          utilization:           data.utilization,
          utilization_ratio:     data.utilizationRatio,
        };

        setHistory([record]);
        setSelectedYear(record.school_year);
        setError(null);
      } catch {
        setError('Unable to load Teachers & Seats analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Selected record ── */
  const selected = useMemo(
    () => history.find(r => r.school_year === selectedYear) || history[0] || null,
    [history, selectedYear]
  );

  const schoolYears = history.map(r => r.school_year);

  /* ── Bar chart: Teachers vs Enrollees vs Seats ── */
  const overviewChartData = useMemo(() => {
    if (!selected) return [];
    return [
      { metric: 'Teachers',        value: selected.teacher_count,   fill: '#e74c3c' },
      { metric: 'Total Enrollees', value: selected.total_enrollees, fill: '#c0392b' },
      { metric: 'Seat Count',      value: selected.seat_count,      fill: '#922b21' },
    ];
  }, [selected]);

  /* ── Line chart: Student:Teacher ratio trend (works with multiple years too) ── */
  const ratioTrendData = useMemo(() =>
    history.map(r => ({
      year:  r.school_year,
      ratio: r.student_teacher_ratio,
    })),
    [history]
  );

  /* ─────────── Early returns ─────────── */
  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading Teachers & Seats Analytics...</p>
    </div>
  );

  if (error) return (
    <div className="loading-container">
      <p style={{ color: 'var(--danger)' }}>{error}</p>
    </div>
  );

  /* ─────────── Render ─────────── */
  return (
    <motion.div
      className="metrics-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* ── Header ── */}
      <header className="metrics-header">
        <div>
          <h1>Teachers & Seats Analytics</h1>
          <p>Capacity and ratio insights for SY {selectedYear}</p>
        </div>

        {schoolYears.length > 0 && (
          <YearDropdown
            years={schoolYears}
            value={selectedYear}
            onChange={setSelectedYear}
          />
        )}
      </header>

      {/* ── KPI Cards ── */}
      <div className="stats-overview" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Teachers</span>
            <span className="stat-value">
              {selected ? Number(selected.teacher_count).toLocaleString() : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              = No. of classrooms
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Armchair size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Seat Count</span>
            <span className="stat-value">
              {selected ? Number(selected.seat_count).toLocaleString() : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              = Total enrollees
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Ratio size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Student : Teacher</span>
            <span className="stat-value" style={{ fontSize: '1.4rem' }}>
              {selected ? `${selected.student_teacher_ratio}:1` : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Per classroom
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Seat Utilization</span>
            <span className="stat-value">
              {selected ? `${selected.utilization}%` : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ratio: {selected?.utilization_ratio ?? '—'}
            </span>
          </div>
        </div>

      </div>

      {/* ── Bar Chart: Overview ── */}
      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="chart-header">
          <h3 className="chart-title">
            <Users size={18} />
            &nbsp; Teachers, Enrollees & Seats — SY {selectedYear}
          </h3>
        </div>

        <div className="chart-container" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={overviewChartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              barSize={56}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

              <XAxis
                dataKey="metric"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 13 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                allowDecimals={false}
                label={{
                  value: 'Count',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#64748b',
                  fontSize: 12,
                  dy: 30,
                }}
              />

              <Tooltip content={<BarTooltip />} />

              <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]}>
                {overviewChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Line Chart: Student:Teacher Ratio Trend ── */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">
            <Ratio size={18} />
            &nbsp; Student : Teacher Ratio Trend
          </h3>
        </div>

        <div className="chart-container" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={ratioTrendData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                allowDecimals={true}
                label={{
                  value: 'Students per Teacher',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#64748b',
                  fontSize: 12,
                  dy: 70,
                }}
              />

              <Tooltip content={<LineTooltip />} />

              {/* Reference line at 40 — common recommended max */}
              <ReferenceLine
                y={40}
                stroke="#e74c3c"
                strokeDasharray="5 5"
                label={{ value: 'Recommended max (40)', fill: '#e74c3c', fontSize: 11, position: 'insideTopRight' }}
              />

              <Line
                type="monotone"
                dataKey="ratio"
                name="Students per Teacher"
                stroke="#e74c3c"
                strokeWidth={2.5}
                dot={{ fill: '#e74c3c', r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </motion.div>
  );
};

export default TeachersSeatsAnalytics;