import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, UserMinus, LayoutDashboard, 
  ArrowUpRight, ArrowDownRight, Activity, Calendar
} from 'lucide-react';
import { enrollmentsApi, classroomsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';

const COLORS = ['#800000', '#2c3e50', '#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6'];
const GENDER_COLORS = ['#3498db', '#e74c3c']; // Blue for Male, Red/Pink for Female

const MetricsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [enrollmentData, classroomData] = await Promise.all([
          enrollmentsApi.getAll(),
          classroomsApi.getAll()
        ]);
        
        // Sort enrollments by school year
        const sortedEnrollments = (enrollmentData || []).sort((a, b) => 
          a.school_year.localeCompare(b.school_year)
        );
        
        setEnrollments(sortedEnrollments);
        setClassrooms(classroomData || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch metrics data:", err);
        setError("Unable to load metrics. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Data Transformations ---

  // 1. Enrollment Trends (Total & Dropped)
  const trendData = useMemo(() => {
    return enrollments.map(e => ({
      year: e.school_year,
      total: Number(e.total_enrollees),
      dropped: Number(e.dropped_repeater || 0)
    }));
  }, [enrollments]);

  // 2. Gender Breakdown (Latest Year)
  const genderData = useMemo(() => {
    if (!enrollments.length) return [];
    const latest = enrollments[enrollments.length - 1];
    
    // Sum all male and female across grades
    const grades = ['kinder', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'];
    let maleTotal = 0;
    let femaleTotal = 0;
    
    grades.forEach(g => {
      maleTotal += Number(latest[`${g}_m`] || 0);
      femaleTotal += Number(latest[`${g}_f`] || 0);
    });

    return [
      { name: 'Male', value: maleTotal },
      { name: 'Female', value: femaleTotal }
    ];
  }, [enrollments]);

  // 3. Grade Breakdown (Latest Year)
  const gradeBreakdownData = useMemo(() => {
    if (!enrollments.length) return [];
    const latest = enrollments[enrollments.length - 1];
    
    return [
      { name: 'Kinder', total: Number(latest.kinder_total || 0), m: Number(latest.kinder_m || 0), f: Number(latest.kinder_f || 0) },
      { name: 'G1', total: Number(latest.grade1_total || 0), m: Number(latest.grade1_m || 0), f: Number(latest.grade1_f || 0) },
      { name: 'G2', total: Number(latest.grade2_total || 0), m: Number(latest.grade2_m || 0), f: Number(latest.grade2_f || 0) },
      { name: 'G3', total: Number(latest.grade3_total || 0), m: Number(latest.grade3_m || 0), f: Number(latest.grade3_f || 0) },
      { name: 'G4', total: Number(latest.grade4_total || 0), m: Number(latest.grade4_m || 0), f: Number(latest.grade4_f || 0) },
      { name: 'G5', total: Number(latest.grade5_total || 0), m: Number(latest.grade5_m || 0), f: Number(latest.grade5_f || 0) },
      { name: 'G6', total: Number(latest.grade6_total || 0), m: Number(latest.grade6_m || 0), f: Number(latest.grade6_f || 0) },
    ];
  }, [enrollments]);

  // 4. Classroom Utilization (Students per Classroom)
  const utilizationData = useMemo(() => {
    if (!enrollments.length || !classrooms.length) return [];
    const latest = enrollments[enrollments.length - 1];
    
    return classrooms.map(c => {
      const gradeKey = c.grade_level.toLowerCase().replace(' ', '');
      const studentCount = latest[`${gradeKey}_total`] || 0;
      const ratio = c.num_classrooms > 0 ? (studentCount / c.num_classrooms).toFixed(1) : 0;
      
      return {
        grade: c.grade_level,
        ratio: parseFloat(ratio),
        capacity: 45 // Standard target
      };
    });
  }, [enrollments, classrooms]);

  // --- Stats Summary ---
  const statsSummary = useMemo(() => {
    if (!enrollments.length) return null;
    const latest = enrollments[enrollments.length - 1];
    const previous = enrollments.length > 1 ? enrollments[enrollments.length - 2] : null;
    
    const totalCurrent = Number(latest.total_enrollees);
    const totalPrev = previous ? Number(previous.total_enrollees) : totalCurrent;
    const growth = totalPrev > 0 ? (((totalCurrent - totalPrev) / totalPrev) * 100).toFixed(1) : 0;
    
    return {
      totalStudents: totalCurrent,
      growth: parseFloat(growth),
      totalDropped: Number(latest.dropped_repeater || 0),
      schoolYear: latest.school_year
    };
  }, [enrollments]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
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

  return (
    <motion.div 
      className="metrics-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="metrics-header">
        <div>
          <h1>Metrics Insights</h1>
          <p>Comprehensive analytical overview for SY {statsSummary?.schoolYear || 'N/A'}</p>
        </div>
        <div className="chart-icon" style={{ background: 'var(--primary)', padding: '12px', borderRadius: '16px' }}>
          <LayoutDashboard size={28} color="white" />
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div className="stats-overview">
        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
        >
          <div className="stat-icon-wrap" style={{ background: 'rgba(128, 0, 0, 0.1)', color: 'var(--primary)' }}>
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

        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
        >
          <div className="stat-icon-wrap" style={{ background: 'rgba(231, 76, 60, 0.1)', color: 'var(--danger)' }}>
            <UserMinus size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Dropped/Repeaters</span>
            <span className="stat-value">{statsSummary?.totalDropped}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Current School Year
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
        >
          <div className="stat-icon-wrap" style={{ background: 'rgba(52, 152, 219, 0.1)', color: 'var(--accent)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Records</span>
            <span className="stat-value">{enrollments.length}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Historical Data Points
            </span>
          </div>
        </motion.div>
      </div>

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
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Grade Distribution */}
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
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" align="right" />
                <Bar dataKey="m" name="Male" fill={GENDER_COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="f" name="Female" fill={GENDER_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Classroom Utilization */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <div className="chart-icon" style={{ background: 'var(--warning)' }}><Activity size={18} /></div>
              Student-Classroom Density
            </h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="ratio" name="Current Ratio" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} />
                <Line type="step" dataKey="capacity" name="Target (45)" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
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
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
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
