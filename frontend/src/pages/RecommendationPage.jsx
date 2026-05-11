import React, { useState, useEffect } from 'react';
import { classroomsApi, enrollmentsApi } from '../api/api';

const RecommendationPage = () => {
  const [data, setData] = useState({ classrooms: [], enrollments: [] });
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classrooms, enrollments] = await Promise.all([
          classroomsApi.getAll(),
          enrollmentsApi.getAll()
        ]);
        setData({ classrooms, enrollments });
        generateRecommendations(classrooms, enrollments);
      } catch (error) {
        console.error("Failed to fetch data for recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateRecommendations = (classrooms, enrollments) => {
    const recs = [];
    
    // Simple logic: Check student/classroom ratio for the most recent year
    if (enrollments.length > 0 && classrooms.length > 0) {
      const latest = enrollments[enrollments.length - 1];
      
      const grades = [
        { key: 'kinder', label: 'KINDER' },
        { key: 'grade1', label: 'GRADE 1' },
        { key: 'grade2', label: 'GRADE 2' },
        { key: 'grade3', label: 'GRADE 3' },
        { key: 'grade4', label: 'GRADE 4' },
        { key: 'grade5', label: 'GRADE 5' },
        { key: 'grade6', label: 'GRADE 6' },
      ];

      grades.forEach(g => {
        const students = latest[`${g.key}_total`] || 0;
        const classroomMatch = classrooms.find(c => c.grade_level === g.label);
        const count = classroomMatch ? classroomMatch.num_classrooms : 0;
        
        if (count > 0) {
          const ratio = students / count;
          if (ratio > 45) {
            recs.push({
              id: g.key,
              type: 'warning',
              title: `High Student-to-Classroom Ratio in ${g.label}`,
              message: `The current ratio is ${ratio.toFixed(1)} students per classroom. Consider allocating more space or hiring additional teachers for this level.`,
              action: 'Infrastructure Update'
            });
          } else if (ratio < 20) {
             recs.push({
              id: g.key,
              type: 'info',
              title: `Low Utilization in ${g.label}`,
              message: `The current ratio is ${ratio.toFixed(1)} students per classroom. You may have excess capacity in this grade level.`,
              action: 'Resource Optimization'
            });
          }
        } else if (students > 0) {
          recs.push({
            id: g.key,
            type: 'danger',
            title: `Missing Classrooms for ${g.label}`,
            message: `There are ${students} students enrolled in ${g.label} but no classrooms are allocated.`,
            action: 'Immediate Action Required'
          });
        }
      });
    }

    // Dropout check
    const highDropoutYears = enrollments.filter(e => e.dropped_repeater > (e.total_enrollees * 0.05));
    if (highDropoutYears.length > 0) {
      const latestHigh = highDropoutYears[highDropoutYears.length - 1];
      recs.push({
        id: 'dropout',
        type: 'warning',
        title: `High Dropout/Repeater Rate in ${latestHigh.school_year}`,
        message: `The dropout/repeater count is ${latestHigh.dropped_repeater} (${((latestHigh.dropped_repeater / latestHigh.total_enrollees) * 100).toFixed(1)}%). Investigation into student retention programs is recommended.`,
        action: 'Intervention Program'
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: 'stable',
        type: 'success',
        title: 'All Systems Stable',
        message: 'Student distribution and classroom utilization are within optimal ranges.',
        action: 'Regular Monitoring'
      });
    }

    setRecommendations(recs);
  };

  const styles = {
    page: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' },
    title: { color: '#2c3e50', marginBottom: '10px', fontSize: '22px', fontWeight: 600 },
    sub: { color: '#7f8c8d', marginBottom: '30px', fontSize: '14px' },
    card: (type) => ({
      borderLeft: `5px solid ${type === 'warning' ? '#f39c12' : type === 'danger' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'}`,
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }),
    recTitle: { fontSize: '16px', fontWeight: 600, color: '#2c3e50', marginBottom: '4px' },
    recMsg: { fontSize: '14px', color: '#7f8c8d' },
    badge: {
      padding: '6px 12px',
      borderRadius: '4px',
      backgroundColor: '#fff',
      border: '1px solid #ecf0f1',
      fontSize: '12px',
      fontWeight: 600,
      color: '#2c3e50'
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Data-Driven Recommendations</h1>
      <p style={styles.sub}>Insights generated based on current enrollment and classroom data.</p>

      {loading ? (
        <div style={{ color: '#7f8c8d' }}>Analyzing data...</div>
      ) : (
        <div>
          {recommendations.map(rec => (
            <div key={rec.id} style={styles.card(rec.type)}>
              <div>
                <div style={styles.recTitle}>{rec.title}</div>
                <div style={styles.recMsg}>{rec.message}</div>
              </div>
              <div style={styles.badge}>{rec.action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;
