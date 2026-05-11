import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const styles = {
    container: {
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      color: '#2c3e50',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      maxWidth: '800px',
      margin: '40px auto'
    },
    title: {
      fontSize: '32px',
      fontWeight: 700,
      marginBottom: '16px'
    },
    description: {
      fontSize: '18px',
      color: '#7f8c8d',
      marginBottom: '32px',
      lineHeight: 1.6
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px'
    },
    card: {
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #ecf0f1',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    cardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
    },
    icon: {
      fontSize: '40px',
      marginBottom: '12px'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to PSU Admin Dashboard</h1>
      <p style={styles.description}>
        Manage and track educational data efficiently. Use the navigation links below or the sidebar to access different modules.
      </p>
      
      <div style={styles.grid}>
        <Link to="/classrooms" style={styles.card}>
          <div style={styles.icon}>🏫</div>
          <div style={styles.cardTitle}>Classrooms</div>
          <p style={{ color: '#7f8c8d', fontSize: '14px' }}>View and manage classroom allocations.</p>
        </Link>
        
        <Link to="/enrollments" style={styles.card}>
          <div style={styles.icon}>📊</div>
          <div style={styles.cardTitle}>Enrollments</div>
          <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Track student enrollment statistics.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
