import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Activity, LayoutDashboard, School, Calendar, ChevronDown, BookOpen
} from 'lucide-react';
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

  // Grade level with the most classrooms
  const busiestGrade = useMemo(() => {
    if (!classroomChartData.length) return '—';
    const max = classroomChartData.reduce((a, b) => a.classrooms >= b.classrooms ? a : b);
    return `${max.grade} (${max.classrooms})`;
  }, [classroomChartData]);

  // Grade level with fewest classrooms
  const leastGrade = useMemo(() => {
    if (!classroomChartData.length) return '—';
    const min = classroomChartData.reduce((a, b) => a.classrooms <= b.classrooms ? a : b);
    return `${min.grade} (${min.classrooms})`;
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
          <div className="stat-icon-wrap" style={{ background: 'rgba(52,152,219,0.1)', color: 'var(--accent)' }}>
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
          <div className="stat-icon-wrap" style={{ background: 'rgba(128,0,0,0.1)', color: 'var(--primary)' }}>
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
          <div className="stat-icon-wrap" style={{ background: 'rgba(243,156,18,0.1)', color: 'var(--warning)' }}>
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
          <div className="stat-icon-wrap" style={{ background: 'rgba(39,174,96,0.1)', color: 'var(--success)' }}>
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
      <div className="chart-card">
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
                  fontSize: 12,
                  dy: 60,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
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

    </motion.div>
  );
};

export default ClassroomAnalytics;