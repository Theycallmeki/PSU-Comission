import React, { useState, useEffect } from 'react';
import { classroomsApi } from '../api/api';

const ClassroomPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const data = await classroomsApi.getAll();
        if (data) setClassrooms(data);
      } catch (error) {
        console.error("Failed to fetch classrooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Classrooms</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>Manage your classroom allocations and grade levels here.</p>
      
      {loading ? (
        <div>Loading classroom data...</div>
      ) : (
        <div>
          {classrooms.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                  <th style={{ padding: '12px 15px', color: '#2c3e50' }}>Grade Level</th>
                  <th style={{ padding: '12px 15px', color: '#2c3e50' }}>Number of Classrooms</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={{ padding: '12px 15px' }}>{c.grade_level}</td>
                    <td style={{ padding: '12px 15px' }}>{c.num_classrooms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#95a5a6' }}>No classrooms found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassroomPage;
