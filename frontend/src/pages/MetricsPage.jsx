import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ReferenceLine
} from 'recharts';
import {
  TrendingUp, Users, UserMinus, LayoutDashboard,
  ArrowUpRight, ArrowDownRight, Activity, Calendar, ChevronDown, School,
  GraduationCap, Armchair, Ratio
} from 'lucide-react';
import { enrollmentsApi, classroomsApi, analyticsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';

const GENDER_COLORS = ['#3498db', '#e74c3c'];
const GRADE_COLORS  = ['#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c'];

/* ─────────────────────────────────────────
   Year Dropdown
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
   Custom Tooltips
───────────────────────────────────────── */
const ClassroomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
      padding: '10px 16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '0.875rem',
    }}>
      <p style={{ fontWeight: 700, color: '#2c3e50', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong> classroom{p.value !== 1 ? 's' : ''}
        </p>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
      padding: '10px 16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '0.875rem',
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

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
      padding: '10px 16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '0.875rem',
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

/* ─────────────────────────────────────────
   MetricsPage
───────────────────────────────────────── */
const MetricsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [classrooms,  setClassrooms]  = useState([]);
  const [statsHistory, setStatsHistory] = useState([]); // Teachers & Seats history
  const [loading, setLoading]         = useState(true);
  const [error,   setError]           = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrollmentData, classroomData, statsRes] = await Promise.all([
          enrollmentsApi.getAll(),
          classroomsApi.getAll(),
          analyticsApi.getQuickStats(),
        ]);

        /* ── Enrollments ── */
        const sortedEnrollments = (enrollmentData || []).sort((a, b) =>
          a.school_year.localeCompare(b.school_year)
        );
        setEnrollments(sortedEnrollments);
        setClassrooms(classroomData || []);

        /* ── Teachers & Seats history ── */
        const statsData = statsRes?.data || [];
        const statsRecords = statsData
          .map(item => ({
            school_year:          item.schoolYear,
            teacher_count:        item.teacherCount,
            seat_count:           item.seatCount,
            total_enrollees:      item.totalEnrollees,
            student_teacher_ratio: item.studentTeacherRatio,
            utilization:          item.utilization,
            utilization_ratio:    item.utilizationRatio,
          }))
          .sort((a, b) => {
            const yearA = parseInt(a.school_year.split('-')[0]);
            const yearB = parseInt(b.school_year.split('-')[0]);
            return yearA - yearB;
          });
        setStatsHistory(statsRecords);

        /* ── Default selected year = latest enrollment year ── */
        if (sortedEnrollments.length > 0) {
          setSelectedYear(sortedEnrollments[sortedEnrollments.length - 1].school_year);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch metrics data:', err);
        setError('Unable to load metrics. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ══════════════════════════════════════
     DERIVED DATA — all keyed to selectedYear
  ══════════════════════════════════════ */

  /* ── Enrollment for selected year ── */
  const selectedEnrollment = useMemo(() =>
    enrollments.find(e => e.school_year === selectedYear) ||
    enrollments[enrollments.length - 1] || null,
    [enrollments, selectedYear]
  );

  /* ── Previous year enrollment ── */
  const prevEnrollment = useMemo(() => {
    const idx = enrollments.findIndex(e => e.school_year === selectedYear);
    return idx > 0 ? enrollments[idx - 1] : null;
  }, [enrollments, selectedYear]);

  /* ── Teachers & Seats record for selected year ── */
  const selectedStats = useMemo(() =>
    statsHistory.find(r => r.school_year === selectedYear) ||
    statsHistory[statsHistory.length - 1] || null,
    [statsHistory, selectedYear]
  );

  /* ── 1. Enrollment trend ── */
  const trendData = useMemo(() =>
    enrollments
      .filter(e => e.school_year <= selectedYear)
      .map(e => ({
        year:    e.school_year,
        total:   Number(e.total_enrollees),
        dropped: Number(e.dropped_repeater || 0),
      })),
    [enrollments, selectedYear]
  );

  /* ── 2. Gender breakdown ── */
  const genderData = useMemo(() => {
    if (!selectedEnrollment) return [];
    const grades = ['kinder', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'];
    let maleTotal = 0, femaleTotal = 0;
    grades.forEach(g => {
      maleTotal   += Number(selectedEnrollment[`${g}_m`] || 0);
      femaleTotal += Number(selectedEnrollment[`${g}_f`] || 0);
    });
    return [
      { name: 'Male',   value: maleTotal   },
      { name: 'Female', value: femaleTotal },
    ];
  }, [selectedEnrollment]);

  /* ── 3. Grade breakdown ── */
  const gradeBreakdownData = useMemo(() => {
    if (!selectedEnrollment) return [];
    return [
      { name: 'Kinder', total: Number(selectedEnrollment.kinder_total || 0), m: Number(selectedEnrollment.kinder_m || 0), f: Number(selectedEnrollment.kinder_f || 0) },
      { name: 'G1',     total: Number(selectedEnrollment.grade1_total || 0), m: Number(selectedEnrollment.grade1_m || 0), f: Number(selectedEnrollment.grade1_f || 0) },
      { name: 'G2',     total: Number(selectedEnrollment.grade2_total || 0), m: Number(selectedEnrollment.grade2_m || 0), f: Number(selectedEnrollment.grade2_f || 0) },
      { name: 'G3',     total: Number(selectedEnrollment.grade3_total || 0), m: Number(selectedEnrollment.grade3_m || 0), f: Number(selectedEnrollment.grade3_f || 0) },
      { name: 'G4',     total: Number(selectedEnrollment.grade4_total || 0), m: Number(selectedEnrollment.grade4_m || 0), f: Number(selectedEnrollment.grade4_f || 0) },
      { name: 'G5',     total: Number(selectedEnrollment.grade5_total || 0), m: Number(selectedEnrollment.grade5_m || 0), f: Number(selectedEnrollment.grade5_f || 0) },
      { name: 'G6',     total: Number(selectedEnrollment.grade6_total || 0), m: Number(selectedEnrollment.grade6_m || 0), f: Number(selectedEnrollment.grade6_f || 0) },
    ];
  }, [selectedEnrollment]);

  /* ── 4. Classrooms per grade (static — not year-dependent) ── */
  const classroomChartData = useMemo(() => {
    if (!classrooms.length) return [];
    return classrooms.map(c => ({
      grade:      c.grade_level,
      classrooms: Number(c.num_classrooms || 0),
    }));
  }, [classrooms]);

  /* ── 5. Stats summary ── */
  const statsSummary = useMemo(() => {
    if (!selectedEnrollment) return null;
    const totalCurrent = Number(selectedEnrollment.total_enrollees);
    const totalPrev    = prevEnrollment ? Number(prevEnrollment.total_enrollees) : totalCurrent;
    const growth       = totalPrev > 0
      ? parseFloat((((totalCurrent - totalPrev) / totalPrev) * 100).toFixed(1))
      : 0;
    return {
      totalStudents: totalCurrent,
      growth,
      totalDropped:  Number(selectedEnrollment.dropped_repeater || 0),
      schoolYear:    selectedEnrollment.school_year,
    };
  }, [selectedEnrollment, prevEnrollment]);

  /* ── 6. Total classrooms KPI ── */
  const totalClassrooms = useMemo(() =>
    classrooms.reduce((acc, c) => acc + Number(c.num_classrooms || 0), 0),
    [classrooms]
  );

  /* ── 7. Teachers/Seats overview bar chart for selected year ── */
  const tsOverviewChartData = useMemo(() => {
    if (!selectedStats) return [];
    return [
      { metric: 'Teachers',        value: selectedStats.teacher_count,   fill: '#e74c3c' },
      { metric: 'Total Enrollees', value: selectedStats.total_enrollees, fill: '#c0392b' },
      { metric: 'Seat Count',      value: selectedStats.seat_count,      fill: '#922b21' },
    ];
  }, [selectedStats]);

  /* ── 8. Student:Teacher ratio trend ── */
  const ratioTrendData = useMemo(() =>
    statsHistory
      .filter(r => r.school_year <= selectedYear)
      .map(r => ({
        year:  r.school_year,
        ratio: r.student_teacher_ratio,
      })),
    [statsHistory, selectedYear]
  );

  /* ─────────── Early returns ─────────── */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Generating Real-time Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metrics-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Activity size={64} color="#e74c3c" style={{ marginBottom: '20px' }} />
        <h2>Data Synchrony Failed</h2>
        <p>{error}</p>
      </div>
    );
  }

  const schoolYears = enrollments.map(e => e.school_year);

  /* ─────────── Render ─────────── */
  return (
    <motion.div
      className="metrics-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Header ── */}
      <header className="metrics-header">
        <div>
          <h1>Metrics Insights</h1>
          <p>Comprehensive analytical overview for SY {statsSummary?.schoolYear || 'N/A'}</p>
        </div>

        {schoolYears.length > 0 && (
          <YearDropdown
            years={schoolYears}
            value={selectedYear}
            onChange={setSelectedYear}
          />
        )}
      </header>

      {/* ══════════════════════════════════════
          SECTION 1 — Enrollment KPIs
      ══════════════════════════════════════ */}
      <div className="metrics-section-label">Enrollment Overview</div>
      <div className="stats-overview">

        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon-wrap"><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Enrollment</span>
            <span className="stat-value">{statsSummary?.totalStudents.toLocaleString()}</span>
            <span style={{ fontSize: '0.8rem', color: statsSummary?.growth >= 0 ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              {statsSummary?.growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(statsSummary?.growth)}% from last year
            </span>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon-wrap"><UserMinus size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Dropped/Repeaters</span>
            <span className="stat-value">{statsSummary?.totalDropped}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Selected School Year
            </span>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon-wrap"><School size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Classrooms</span>
            <span className="stat-value">{totalClassrooms}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across all grade levels
            </span>
          </div>
        </motion.div>

      </div>

      {/* ══════════════════════════════════════
          SECTION 2 — Teachers & Seats KPIs
      ══════════════════════════════════════ */}
      <div className="metrics-section-label">Teachers &amp; Seats — SY {selectedYear}</div>
      <div className="stats-overview" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>

        <div className="stat-card">
          <div className="stat-icon-wrap"><GraduationCap size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Teachers</span>
            <span className="stat-value">
              {selectedStats ? Number(selectedStats.teacher_count).toLocaleString() : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              = No. of classrooms
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap"><Armchair size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Seat Count</span>
            <span className="stat-value">
              {selectedStats ? Number(selectedStats.seat_count).toLocaleString() : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              = Total enrollees
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap"><Ratio size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Student : Teacher</span>
            <span className="stat-value" style={{ fontSize: '1.4rem' }}>
              {selectedStats ? `${selectedStats.student_teacher_ratio}:1` : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Per classroom
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap"><Activity size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Seat Utilization</span>
            <span className="stat-value">
              {selectedStats ? `${selectedStats.utilization}%` : '—'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ratio: {selectedStats?.utilization_ratio ?? '—'}
            </span>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════
          CHARTS
      ══════════════════════════════════════ */}
      <div className="metrics-grid">

        {/* CHART 1: Enrollment Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon"><TrendingUp size={18} /></div>
              Enrollment Trends
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#800000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#800000" stopOpacity={0} />
                  </linearGradient>
                  <filter id="maroonShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#800000" floodOpacity="0.25" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} interval={0} tickMargin={10} padding={{ left: 20, right: 20 }} minTickGap={0} angle={-10} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="total" stroke="#800000" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" filter="url(#maroonShadow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Gender Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon"><Users size={18} /></div>
              Gender Distribution
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                  {genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Grade Breakdown — full width */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon"><LayoutDashboard size={18} /></div>
              Enrollment by Grade Level
            </h3>
          </div>
          <div className="chart-container" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10}
                  tickFormatter={(value) => {
                    const map = { K: 'Kinder', G1: 'Grade 1', G2: 'Grade 2', G3: 'Grade 3', G4: 'Grade 4', G5: 'Grade 5', G6: 'Grade 6', G7: 'Grade 7', G8: 'Grade 8', G9: 'Grade 9', G10: 'Grade 10', G11: 'Grade 11', G12: 'Grade 12' };
                    return map[value] || value;
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="top" align="right" />
                <Bar dataKey="m" name="Male"   fill={GENDER_COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="f" name="Female" fill={GENDER_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Classrooms per Grade Level */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon"><School size={18} /></div>
              Classrooms per Grade Level
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={classroomChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }} barSize={42}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} interval={0} minTickGap={0} tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (window.innerWidth < 768) {
                      const shortcuts = { Kindergarten: 'Kinder', 'Grade 1': 'G1', 'Grade 2': 'G2', 'Grade 3': 'G3', 'Grade 4': 'G4', 'Grade 5': 'G5', 'Grade 6': 'G6' };
                      return shortcuts[value] || value;
                    }
                    return value;
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false}
                  label={{ value: 'No. of Classrooms', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, dy: 60 }}
                />
                <Tooltip content={<ClassroomTooltip />} />
                <Bar dataKey="classrooms" name="Classrooms" radius={[6, 6, 0, 0]}>
                  {classroomChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Dropout Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon"><UserMinus size={18} /></div>
              Dropout &amp; Repeaters Trend
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} interval={0} minTickGap={0} tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (window.innerWidth < 768) {
                      return value.replace('2020-2021','20-21').replace('2021-2022','21-22').replace('2022-2023','22-23').replace('2023-2024','23-24').replace('2024-2025','24-25').replace('2025-2026','25-26');
                    }
                    return value;
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="dropped" name="Dropped/Repeaters" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Teachers, Enrollees & Seats — full width */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon"><Users size={18} /></div>
              Teachers, Enrollees &amp; Seats — SY {selectedYear}
            </h3>
          </div>
          <div className="chart-container" style={{ height: '360px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tsOverviewChartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }} barSize={56}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
                <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, dy: 30 }}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]}>
                  {tsOverviewChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 7: Student:Teacher Ratio Trend — full width */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon"><Ratio size={18} /></div>
              Student : Teacher Ratio Trend
            </h3>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratioTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={true}
                  label={{ value: 'Students per Teacher', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, dy: 70 }}
                />
                <Tooltip content={<LineTooltip />} />
                <ReferenceLine y={40} stroke="#e74c3c" strokeDasharray="5 5"
                  label={{ value: 'Recommended max (40)', fill: '#e74c3c', fontSize: 11, position: 'insideTopRight' }}
                />
                <Line type="monotone" dataKey="ratio" name="Students per Teacher" stroke="#e74c3c" strokeWidth={2.5}
                  dot={{ fill: '#e74c3c', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default MetricsPage;