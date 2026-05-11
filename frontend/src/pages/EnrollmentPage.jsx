import React, { useState, useEffect } from 'react';
import { enrollmentsApi } from '../api/api';

const EnrollmentPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await enrollmentsApi.getAll();
        if (data) setEnrollments(data);
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Enrollments</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>View and manage student enrollment statistics.</p>
      
      {loading ? (
        <div>Loading enrollment data...</div>
      ) : (
        <div>
          {enrollments.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                  <th style={{ padding: '12px 15px', color: '#2c3e50' }}>School Year</th>
                  <th style={{ padding: '12px 15px', color: '#2c3e50' }}>Total Enrollees</th>
                  <th style={{ padding: '12px 15px', color: '#2c3e50' }}>Dropped / Repeater</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={{ padding: '12px 15px' }}>{e.school_year}</td>
                    <td style={{ padding: '12px 15px' }}>{e.total_enrollees}</td>
                    <td style={{ padding: '12px 15px' }}>{e.dropped_repeater}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#95a5a6' }}>No enrollments found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollmentPage;
