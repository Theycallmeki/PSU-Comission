import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, LayoutDashboard, School
} from 'lucide-react';
import { enrollmentsApi, classroomsApi } from '../api/api';
import { motion } from 'framer-motion';
import '../styles/MetricsPage.css';

const ClassroomAnalytics = () => {
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
        setEnrollments(enrollmentData || []);
        setClassrooms(classroomData || []);
        setError(null);
      } catch (err) {
        setError("Unable to load classroom analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const utilizationData = useMemo(() => {
    if (!enrollments.length || !classrooms.length) return [];
    const latest = enrollments.sort((a,b) => a.school_year.localeCompare(b.school_year))[enrollments.length - 1];
    
    return classrooms.map(c => {
      const gradeKey = c.grade_level.toLowerCase().replace(' ', '');
      const studentCount = latest[`${gradeKey}_total`] || 0;
      const ratio = c.num_classrooms > 0 ? (studentCount / c.num_classrooms).toFixed(1) : 0;
      return {
        grade: c.grade_level,
        ratio: parseFloat(ratio),
        capacity: 45
      };
    });
  }, [enrollments, classrooms]);

  const totalClassrooms = useMemo(() => {
    return classrooms.reduce((acc, c) => acc + Number(c.num_classrooms || 0), 0);
  }, [classrooms]);

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading Classroom Analytics...</p></div>;

  return (
    <motion.div className="metrics-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="metrics-header">
        <div>
          <h1>Classroom Analytics</h1>
          <p>Infrastructure and capacity insights</p>
        </div>
      </header>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(52, 152, 219, 0.1)', color: 'var(--accent)' }}><School size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Classrooms</span>
            <span className="stat-value">{totalClassrooms}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across all grade levels</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(39, 174, 96, 0.1)', color: 'var(--success)' }}><Activity size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Average Density</span>
            <span className="stat-value">
              {(utilizationData.reduce((a,b) => a + b.ratio, 0) / (utilizationData.length || 1)).toFixed(1)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Students per room</span>
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
        <div className="chart-header">
          <h3 className="chart-title"><Activity size={18} /> Student-Classroom Density</h3>
        </div>
        <div className="chart-container" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ratio" name="Current Ratio" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6 }} />
              <Line type="step" dataKey="capacity" name="Target (45)" stroke="#cbd5e1" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassroomAnalytics;
