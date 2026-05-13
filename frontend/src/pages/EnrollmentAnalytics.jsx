import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, Users, UserMinus, LayoutDashboard, 
  ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react';
import { enrollmentsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';

const GENDER_COLORS = ['#3498db', '#e74c3c'];

const EnrollmentAnalytics = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const enrollmentData = await enrollmentsApi.getAll();
        const sortedEnrollments = (enrollmentData || []).sort((a, b) => 
          a.school_year.localeCompare(b.school_year)
        );
        setEnrollments(sortedEnrollments);
        setError(null);
      } catch (err) {
        setError("Unable to load enrollment analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const trendData = useMemo(() => enrollments.map(e => ({
    year: e.school_year,
    total: Number(e.total_enrollees),
    dropped: Number(e.dropped_repeater || 0)
  })), [enrollments]);

  const genderData = useMemo(() => {
    if (!enrollments.length) return [];
    const latest = enrollments[enrollments.length - 1];
    const grades = ['kinder', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'];
    let m = 0, f = 0;
    grades.forEach(g => {
      m += Number(latest[`${g}_m`] || 0);
      f += Number(latest[`${g}_f`] || 0);
    });
    return [{ name: 'Male', value: m }, { name: 'Female', value: f }];
  }, [enrollments]);

  const gradeBreakdownData = useMemo(() => {
    if (!enrollments.length) return [];
    const latest = enrollments[enrollments.length - 1];
    return ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((label, i) => {
      const key = label.toLowerCase().replace(' ', '');
      return {
        name: label === 'Kinder' ? 'Kinder' : `G${i}`,
        m: Number(latest[`${key}_m`] || 0),
        f: Number(latest[`${key}_f`] || 0)
      };
    });
  }, [enrollments]);

  const stats = useMemo(() => {
    if (!enrollments.length) return null;
    const latest = enrollments[enrollments.length - 1];
    const prev = enrollments.length > 1 ? enrollments[enrollments.length - 2] : null;
    const growth = prev ? (((latest.total_enrollees - prev.total_enrollees) / prev.total_enrollees) * 100).toFixed(1) : 0;
    return {
      total: latest.total_enrollees,
      growth: parseFloat(growth),
      dropped: latest.dropped_repeater || 0,
      year: latest.school_year
    };
  }, [enrollments]);

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading Enrollment Analytics...</p></div>;

  return (
    <motion.div className="metrics-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="metrics-header">
        <div>
          <h1>Enrollment Analytics</h1>
          <p>Statistical insights for SY {stats?.year}</p>
        </div>
      </header>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary)' }}><Users size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Enrollment</span>
            <span className="stat-value">{stats?.total.toLocaleString()}</span>
            <span style={{ fontSize: '0.8rem', color: stats?.growth >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {stats?.growth >= 0 ? '↑' : '↓'} {Math.abs(stats?.growth)}% vs last year
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--danger)' }}><UserMinus size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Dropped/Repeaters</span>
            <span className="stat-value">{stats?.dropped}</span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="chart-card">
          <div className="chart-header"><h3 className="chart-title"><TrendingUp size={18} /> Enrollment Trend</h3></div>
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

        <div className="chart-card">
          <div className="chart-header"><h3 className="chart-title"><Users size={18} /> Gender Distribution</h3></div>
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

        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header"><h3 className="chart-title"><LayoutDashboard size={18} /> Grade Level Breakdown</h3></div>
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
      </div>
    </motion.div>
  );
};

export default EnrollmentAnalytics;
