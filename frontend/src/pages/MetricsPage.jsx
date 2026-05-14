import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, UserMinus, LayoutDashboard, 
  ArrowUpRight, ArrowDownRight, Activity, Calendar, ChevronDown, School
} from 'lucide-react';
import { enrollmentsApi, classroomsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';

const GENDER_COLORS = ['#3498db', '#e74c3c'];
const GRADE_COLORS = ['#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c', '#e74c3c'];

/* ─────────────────────────────────────────
   Custom Year Dropdown
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
   Custom Classroom Tooltip
───────────────────────────────────────── */
const ClassroomTooltip = ({ active, payload, label }) => {
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
        <p key={i} style={{ color: p.fill, margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong> classroom{p.value !== 1 ? 's' : ''}
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
  const [classrooms, setClassrooms]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrollmentData, classroomData] = await Promise.all([
          enrollmentsApi.getAll(),
          classroomsApi.getAll()
        ]);

        const sortedEnrollments = (enrollmentData || []).sort((a, b) =>
          a.school_year.localeCompare(b.school_year)
        );

        setEnrollments(sortedEnrollments);
        setClassrooms(classroomData || []);

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

  /* ── Derived: record for the selected year ── */
  const selectedEnrollment = useMemo(() =>
    enrollments.find(e => e.school_year === selectedYear) ||
    enrollments[enrollments.length - 1] ||
    null,
    [enrollments, selectedYear]
  );

  /* ── Derived: previous year record (for growth %) ── */
  const prevEnrollment = useMemo(() => {
    const idx = enrollments.findIndex(e => e.school_year === selectedYear);
    return idx > 0 ? enrollments[idx - 1] : null;
  }, [enrollments, selectedYear]);

  /* ── 1. Trend data — all years up to & including selected ── */
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

  /* ── 2. Gender breakdown for selected year ── */
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

  /* ── 3. Grade breakdown for selected year ── */
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

  /* ── 4. Classrooms per grade — from classroomsApi, not year-dependent ── */
  const classroomChartData = useMemo(() => {
    if (!classrooms.length) return [];
    return classrooms.map(c => ({
      grade:      c.grade_level,
      classrooms: Number(c.num_classrooms || 0),
    }));
  }, [classrooms]);

  /* ── 5. Stats summary for selected year ── */
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

      {/* ── Stat Cards ── */}
      <div className="stats-overview">

        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon-wrap" style={{ background: 'rgba(128,0,0,0.1)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
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
          <div className="stat-icon-wrap" style={{ background: 'rgba(231,76,60,0.1)', color: 'var(--danger)' }}>
            <UserMinus size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Dropped/Repeaters</span>
            <span className="stat-value">{statsSummary?.totalDropped}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Selected School Year
            </span>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon-wrap" style={{ background: 'rgba(52,152,219,0.1)', color: 'var(--accent)' }}>
            <School size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Classrooms</span>
            <span className="stat-value">{totalClassrooms}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across all grade levels
            </span>
          </div>
        </motion.div>

      </div>

      {/* ── Charts ── */}
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year"  axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Gender Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon" style={{ background: 'var(--secondary)' }}><Users size={18} /></div>
              Gender Distribution
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%" cy="50%"
                  innerRadius={80} outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
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

        {/* CHART 3: Grade Breakdown */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon" style={{ background: 'var(--accent)' }}><LayoutDashboard size={18} /></div>
              Enrollment by Grade Level
            </h3>
          </div>
          <div className="chart-container" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
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
              <div className="chart-icon" style={{ background: 'var(--warning)' }}><School size={18} /></div>
              Classrooms per Grade Level
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classroomChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                barSize={42}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="grade"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  allowDecimals={false}
                  label={{
                    value: 'No. of Classrooms',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    dy: 60,
                  }}
                />
                <Tooltip content={<ClassroomTooltip />} />
                <Bar dataKey="classrooms" name="Classrooms" radius={[6, 6, 0, 0]}>
                  {classroomChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GRADE_COLORS[index % GRADE_COLORS.length]}
                    />
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
              <div className="chart-icon" style={{ background: 'var(--danger)' }}><UserMinus size={18} /></div>
              Dropout & Repeaters Trend
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="dropped" name="Dropped/Repeaters" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default MetricsPage;