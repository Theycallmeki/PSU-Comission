import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Activity, LayoutDashboard, School, Calendar, ChevronDown, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { enrollmentsApi, classroomsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';

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
   Custom Tooltip
───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
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
   ClassroomAnalytics
───────────────────────────────────────── */
const ClassroomAnalytics = () => {
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
        setError('Unable to load classroom analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Selected enrollment record ── */
  const selectedEnrollment = useMemo(() =>
    enrollments.find(e => e.school_year === selectedYear) ||
    enrollments[enrollments.length - 1] ||
    null,
    [enrollments, selectedYear]
  );

  /* ── Classroom count per grade — drives the bar chart ── */
  const classroomChartData = useMemo(() => {
    if (!classrooms.length) return [];
    return classrooms.map(c => ({
      grade:      c.grade_level,
      classrooms: Number(c.num_classrooms || 0),
    }));
  }, [classrooms]);

  /* ── Students per classroom (density) per grade for selected year ── */
  const densityData = useMemo(() => {
    if (!selectedEnrollment || !classrooms.length) return [];
    return classrooms.map(c => {
      const gradeKey     = c.grade_level.toLowerCase().replace(' ', '');
      const studentCount = Number(selectedEnrollment[`${gradeKey}_total`] || 0);
      const ratio        = c.num_classrooms > 0
        ? parseFloat((studentCount / c.num_classrooms).toFixed(1))
        : 0;
      return { grade: c.grade_level, ratio };
    });
  }, [selectedEnrollment, classrooms]);

  /* ── KPIs ── */

  // Total classrooms across all grades (from classroomsApi — not year dependent)
  const totalClassrooms = useMemo(() =>
    classrooms.reduce((acc, c) => acc + Number(c.num_classrooms || 0), 0),
    [classrooms]
  );

// Grade levels with the most classrooms
const busiestGrade = useMemo(() => {
  if (!classroomChartData.length) return '—';

  // highest classroom count
  const maxClassrooms = Math.max(
    ...classroomChartData.map(item => item.classrooms)
  );

  // all grades with highest count
  const maxGrades = classroomChartData
    .filter(item => item.classrooms === maxClassrooms)
    .map(item => item.grade);

  return `${maxGrades.join(', ')} (${maxClassrooms})`;
}, [classroomChartData]);

// Grade levels with the fewest classrooms
const leastGrade = useMemo(() => {
  if (!classroomChartData.length) return '—';

  // lowest classroom count
  const minClassrooms = Math.min(
    ...classroomChartData.map(item => item.classrooms)
  );

  // all grades with lowest count
  const minGrades = classroomChartData
    .filter(item => item.classrooms === minClassrooms)
    .map(item => item.grade);

  return `${minGrades.join(', ')} (${minClassrooms})`;
}, [classroomChartData]);

  // Average students per classroom for selected year
  const avgDensity = useMemo(() => {
    if (!densityData.length) return '0.0';
    const sum = densityData.reduce((a, b) => a + b.ratio, 0);
    return (sum / densityData.length).toFixed(1);
  }, [densityData]);

  const schoolYears = enrollments.map(e => e.school_year);

  /* ─────────── Early returns ─────────── */
  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading Classroom Analytics...</p>
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
          <span className="breadcrumb-item breadcrumb-inactive">Classrooms</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item breadcrumb-active">Classroom Analytics</span>
        </nav>

      {/* ── Header ── */}
      <header className="metrics-header">
        <div>
          <h1>Classroom Analytics</h1>
          <p>Infrastructure and capacity insights for SY {selectedYear}</p>
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
      <div className="stats-overview">

        {/* Total Classrooms */}
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <School size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Classrooms</span>
            <span className="stat-value">{totalClassrooms}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Across all grade levels
            </span>
          </div>
        </div>

        {/* Most Classrooms */}
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Most Classrooms</span>
            <span className="stat-value" style={{ fontSize: '1.25rem' }}>{busiestGrade}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Highest allocated grade
            </span>
          </div>
        </div>

        {/* Fewest Classrooms */}
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <LayoutDashboard size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Fewest Classrooms</span>
            <span className="stat-value" style={{ fontSize: '1.25rem' }}>{leastGrade}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Lowest allocated grade
            </span>
          </div>
        </div>

        {/* Avg Density for selected year */}
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Avg Students / Room</span>
            <span className="stat-value">{avgDensity}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              SY {selectedYear}
            </span>
          </div>
        </div>

      </div>

{/* ── Bar Chart: Classrooms per Grade ── */}
<div className="chart-card" >
  <div className="chart-header">
    <h3 className="chart-title">
      <School size={18} />
      &nbsp; Number of Classrooms per Grade Level
    </h3>
  </div>

  <div className="chart-container" style={{ height: '420px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={classroomChartData}
        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        barSize={48}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />

        <XAxis
          dataKey="grade"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          dy={10}
          tickFormatter={(value) => {
            if (value === 'K') return 'Kinder';
            if (value === 'G1') return 'Grade 1';
            if (value === 'G2') return 'Grade 2';
            if (value === 'G3') return 'Grade 3';
            if (value === 'G4') return 'Grade 4';
            if (value === 'G5') return 'Grade 5';
            if (value === 'G6') return 'Grade 6';
            if (value === 'G7') return 'Grade 7';
            if (value === 'G8') return 'Grade 8';
            if (value === 'G9') return 'Grade 9';
            if (value === 'G10') return 'Grade 10';
            if (value === 'G11') return 'Grade 11';
            if (value === 'G12') return 'Grade 12';
            return value;
          }}
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
            fontSize: 12,
            dy: 60,
          }}
        />

        <Tooltip content={<CustomTooltip />} />

        <Bar
          dataKey="classrooms"
          name="Classrooms"
          radius={[6, 6, 0, 0]}
        >
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

    </motion.div>
  );
};

export default ClassroomAnalytics;