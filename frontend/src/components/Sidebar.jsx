import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Classrooms', path: '/classrooms' },
    { name: 'Enrollments', path: '/enrollments' },
    { name: 'Recommendations', path: '/recommendations' },
  ];

  return (
    <div style={{ 
      width: '260px', 
      backgroundColor: '#2c3e50', 
      color: 'white', 
      padding: '20px',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '40px', color: '#ecf0f1', borderBottom: '1px solid #34495e', paddingBottom: '10px' }}>
        PSU Dashboard
      </h2>
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <li key={item.path} style={{ marginBottom: '15px' }}>
              <Link 
                to={item.path} 
                style={{ 
                  color: isActive ? '#fff' : '#bdc3c7', 
                  backgroundColor: isActive ? '#34495e' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '16px',
                  display: 'block',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
