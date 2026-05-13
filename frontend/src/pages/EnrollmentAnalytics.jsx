import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, UserMinus, LayoutDashboard, Calendar
} from 'lucide-react';
import { enrollmentsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';
import '../styles/YearDropdown.css';

const GENDER_COLORS = ['#3498db', '#e74c3c'];

const EnrollmentAnalytics = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const enrollmentData = await enrollmentsApi.getAll();
        const sortedEnrollments = (enrollmentData || []).sort((a, b) =>
          a.school_year.localeCompare(b.school_year)
        );
        setEnrollments(sortedEnrollments);

        // Default to the latest year returned by the API
        if (sortedEnrollments.length > 0) {
          setSelectedYear(sortedEnrollments[sortedEnrollments.length - 1].school_year);
        }

        setError(null);
      } catch (err) {
        setError('Unable to load enrollment analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Record matching selected year
  const selectedEnrollment = useMemo(() =>
    enrollments.find(e => e.school_year === selectedYear) || null,
    [enrollments, selectedYear]
  );

  // Previous year record for growth calculation
  const prevEnrollment = useMemo(() => {
    const idx = enrollments.findIndex(e => e.school_year === selectedYear);
    return idx > 0 ? enrollments[idx - 1] : null;
  }, [enrollments, selectedYear]);

  // Trend data: all years up to and including selected year
  const trendData = useMemo(() =>
    enrollments
      .filter(e => e.school_year <= selectedYear)
      .map(e => ({
        year: e.school_year,
        total: Number(e.total_enrollees),
        dropped: Number(e.dropped_repeater || 0),
      })),
    [enrollments, selectedYear]
  );

  // Gender data for selected year
  const genderData = useMemo(() => {
    if (!selectedEnrollment) return [];
    const grades = ['kinder', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'];
    let m = 0, f = 0;
    grades.forEach(g => {
      m += Number(selectedEnrollment[`${g}_m`] || 0);
      f += Number(selectedEnrollment[`${g}_f`] || 0);
    });
    return [{ name: 'Male', value: m }, { name: 'Female', value: f }];
  }, [selectedEnrollment]);

  // Grade breakdown for selected year
  const gradeBreakdownData = useMemo(() => {
    if (!selectedEnrollment) return [];
    return ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((label, i) => {
      const key = label.toLowerCase().replace(' ', '');
      return {
        name: label === 'Kinder' ? 'Kinder' : `G${i}`,
        m: Number(selectedEnrollment[`${key}_m`] || 0),
        f: Number(selectedEnrollment[`${key}_f`] || 0),
      };
    });
  }, [selectedEnrollment]);

  // Stats for selected year
  const stats = useMemo(() => {
    if (!selectedEnrollment) return null;
    const growth = prevEnrollment
      ? (((selectedEnrollment.total_enrollees - prevEnrollment.total_enrollees) / prevEnrollment.total_enrollees) * 100).toFixed(1)
      : null;
    return {
      total: selectedEnrollment.total_enrollees,
      growth: growth !== null ? parseFloat(growth) : null,
      dropped: selectedEnrollment.dropped_repeater || 0,
      year: selectedEnrollment.school_year,
    };
  }, [selectedEnrollment, prevEnrollment]);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading Enrollment Analytics...</p>
    </div>
  );

  if (error) return (
    <div className="loading-container">
      <p style={{ color: 'var(--danger)' }}>{error}</p>
    </div>
  );

  return (
    <motion.div className="metrics-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="metrics-header">
        <div>
          <h1>Enrollment Analytics</h1>
          <p>Statistical insights for SY {stats?.year}</p>
        </div>

        {/* ── Year Dropdown — options built directly from API data ── */}
        {enrollments.length > 0 && (
          <div className="year-dropdown-wrapper">
            <Calendar size={16} className="year-dropdown-icon" />
            <select
              className="year-dropdown"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              {enrollments.map(e => (
                <option key={e.school_year} value={e.school_year}>
                  SY {e.school_year}
                </option>
              ))}
            </select>
            <span className="year-dropdown-arrow">▾</span>
          </div>
        )}
      </header>

      {/* ── Stat Cards ── */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Enrollment</span>
            <span className="stat-value">{stats?.total?.toLocaleString() ?? '—'}</span>
            {stats?.growth !== null && prevEnrollment && (
              <span style={{ fontSize: '0.8rem', color: stats.growth >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {stats.growth >= 0 ? '↑' : '↓'} {Math.abs(stats.growth)}% vs last year
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--danger)' }}>
            <UserMinus size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Dropped/Repeaters</span>
            <span className="stat-value">{stats?.dropped ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="metrics-grid">
        {/* Grade Breakdown */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3 className="chart-title"><LayoutDashboard size={18} /> Grade Level Breakdown</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="m" name="Male" fill={GENDER_COLORS[0]} />
                <Bar dataKey="f" name="Female" fill={GENDER_COLORS[1]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dropout & Repeater Analysis */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3 className="chart-title"><UserMinus size={18} /> Dropout & Repeater Analysis</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', marginLeft: '1rem' }}>
            Historical trend of dropped students and repeaters up to SY {selectedYear}
          </p>
          <div className="chart-container" style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="dropped" name="Dropped/Repeaters" fill="#e74c3c" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title"><TrendingUp size={18} /> Enrollment Trend</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title"><Users size={18} /> Gender Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {genderData.map((e, i) => <Cell key={i} fill={GENDER_COLORS[i % 2]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnrollmentAnalytics;