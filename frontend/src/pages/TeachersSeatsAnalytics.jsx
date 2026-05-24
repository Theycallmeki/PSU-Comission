import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine
} from 'recharts';
import {
  Users, GraduationCap, Armchair, Ratio, Activity, Calendar, ChevronDown, Download
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

  const handleDownloadPDF = () => {
    const chartContainers = [...document.querySelectorAll('.chart-container')];
    const responsiveContainers = [...document.querySelectorAll('.recharts-responsive-container')];
    const svgs = [...document.querySelectorAll('.recharts-responsive-container svg')];
    const origCC  = chartContainers.map(el => ({ h: el.style.height, mh: el.style.minHeight }));
    const origRC  = responsiveContainers.map(el => ({ w: el.style.width, h: el.style.height }));
    const origSVG = svgs.map(el => ({ w: el.getAttribute('width'), h: el.getAttribute('height') }));
    const restore = () => {
      chartContainers.forEach((el, i) => { el.style.height = origCC[i].h; el.style.minHeight = origCC[i].mh; });
      responsiveContainers.forEach((el, i) => { el.style.width = origRC[i].w; el.style.height = origRC[i].h; });
      svgs.forEach((el, i) => {
        if (origSVG[i].w === null) el.removeAttribute('width'); else el.setAttribute('width', origSVG[i].w);
        if (origSVG[i].h === null) el.removeAttribute('height'); else el.setAttribute('height', origSVG[i].h);
      });
    };
    chartContainers.forEach(el => { el.style.height = el.offsetHeight + 'px'; el.style.minHeight = el.offsetHeight + 'px'; });
    responsiveContainers.forEach(el => { el.style.width = el.offsetWidth + 'px'; el.style.height = el.offsetHeight + 'px'; });
    svgs.forEach(el => { const r = el.getBoundingClientRect(); el.setAttribute('width', r.width + 'px'); el.setAttribute('height', r.height + 'px'); });
    const onAfterPrint = () => { restore(); window.removeEventListener('afterprint', onAfterPrint); };
    window.addEventListener('afterprint', onAfterPrint);
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => window.print(), 300)));
  };

  // Since getQuickStats returns only the LATEST year's data,
  // we fetch once and treat it as a single data point.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res  = await analyticsApi.getQuickStats();
        const data = res?.data || [];

        if (!data || data.length === 0) {
          setHistory([]);
          setError('No analytics data available. Please add enrollment and classroom records first.');
          return;
        }

        // Map the array of stats from the backend
        const records = data
        .map(item => ({
          school_year: item.schoolYear,
          teacher_count: item.teacherCount,
          seat_count: item.seatCount,
          total_enrollees: item.totalEnrollees,
          student_teacher_ratio: item.studentTeacherRatio,
          utilization: item.utilization,
          utilization_ratio: item.utilizationRatio,
        }))
        .sort((a, b) => {
          const yearA = parseInt(a.school_year.split('-')[0]);
          const yearB = parseInt(b.school_year.split('-')[0]);
      
          return yearA - yearB; // oldest → newest
        });

        setHistory(records);
        // Default to the first (latest) year in the sorted array
        const latestYear =
        records.find(r => r.school_year === '2025-2026') ||
        records[records.length - 1];

      setSelectedYear(latestYear.school_year);
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
  const ratioTrendData = useMemo(() => {
    if (!history.length || !selectedYear) return [];
  
    const selectedIndex = history.findIndex(
      r => r.school_year === selectedYear
    );
  
    return history
      .slice(0, selectedIndex + 1)
      .map(r => ({
        year: r.school_year,
        ratio: r.student_teacher_ratio,
      }));
  }, [history, selectedYear]);

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

      {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/" className="breadcrumb-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item breadcrumb-inactive">Menu</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item breadcrumb-inactive">Teachers / Seats</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item breadcrumb-active">Teachers/Seats Analytics</span>
        </nav>

      {/* ── Header ── */}
      <header className="metrics-header">
        <div>
          <h1>Teachers & Seats Analytics</h1>
          <p>Capacity and ratio insights for SY {selectedYear}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {schoolYears.length > 0 && (
            <YearDropdown
              years={schoolYears}
              value={selectedYear}
              onChange={setSelectedYear}
            />
          )}
          <button className="pdf-download-btn" onClick={handleDownloadPDF} type="button">
            <Download size={15} />
            Download PDF
          </button>
        </div>
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
              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />

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