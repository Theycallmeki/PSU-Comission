import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const SchoolIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M9 9h1" />
    <path d="M14 9h1" />
    <path d="M9 13h1" />
    <path d="M14 13h1" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21c-4-4-7-7.333-7-11a7 7 0 1 1 14 0c0 3.667-3 7-7 11z" />
    <circle cx="12" cy="10" r="2" />
  </svg>
);

const IdIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 15v-4a2 2 0 0 1 4 0v4" />
    <path d="M7 13h4" />
    <path d="M15 9h2" />
    <path d="M15 13h2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const DashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ClassroomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 16l4-4 4 4 4-6" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="3" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
  </svg>
);

const ReportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M9 13h6M9 17h4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const modules = [
  {
    to: '/classrooms',
    icon: <ClassroomIcon />,
    iconClass: 'blue',
    title: 'Classrooms',
    description: 'View and manage classroom allocations and seat availability.',
    cta: 'View classrooms',
  },
  {
    to: '/enrollments',
    icon: <ChartIcon />,
    iconClass: 'teal',
    title: 'Enrollments',
    description: 'Track student enrollment statistics across school years.',
    cta: 'View enrollments',
  },
  {
    to: '/students',
    icon: <UsersIcon />,
    iconClass: 'amber',
    title: 'Students',
    description: 'Monitor retention, dropout, and repeater indicators.',
    cta: 'View students',
  },
  {
    to: '/reports',
    icon: <ReportIcon />,
    iconClass: 'rose',
    title: 'Reports',
    description: 'Generate data-based insights and download summaries.',
    cta: 'View reports',
  },
];

const HomePage = () => {
  return (
    <div className="homepage">

      {/* School Header */}
      <div className="school-header">
        <div className="school-emblem">
          <SchoolIcon />
        </div>
        <div className="school-info">
          <span className="tag">Public Elementary School · DepEd</span>
          <h1>Galang Elementary Memorial School</h1>
          <p className="formerly">Formerly Calantipe Elementary School · Est. 1986</p>
          <div className="school-meta">
            <span className="meta-item">
              <MapPinIcon />
              Brgy. Calantipe, Apalit, Pampanga
            </span>
            <span className="meta-item">
              <IdIcon />
              School ID: 105871
            </span>
            <span className="meta-item">
              <CalendarIcon />
              SY 2021–2022 to 2025–2026
            </span>
          </div>
        </div>
      </div>

      {/* Welcome */}
      <div className="welcome-banner">
        <div className="welcome-icon">
          <DashIcon />
        </div>
        <div className="welcome-text">
          <h2>GEMS Admin Dashboard</h2>
          <p>
            Manage and track educational data for GEMS. Use the modules below to access
            enrollment trends, classroom data, student performance, and generated reports.
          </p>
        </div>
      </div>

      {/* Modules */}
      <p className="section-label">Modules</p>
      <div className="module-grid">
        {modules.map((mod) => (
          <Link key={mod.to} to={mod.to} className="module-card">
            <div className={`module-card-icon ${mod.iconClass}`}>
              {mod.icon}
            </div>
            <div>
              <h3>{mod.title}</h3>
              <p>{mod.description}</p>
            </div>
            <div className="module-card-footer">
              {mod.cta} <ArrowRightIcon />
            </div>
          </Link>
        ))}
      </div>

      {/* About strip */}
      <p className="section-label">School at a glance</p>
      <div className="about-strip">
        <div className="about-item">
          <div className="label">Type</div>
          <div className="value">Public Elementary (K–6)</div>
        </div>
        <div className="about-item">
          <div className="label">Division</div>
          <div className="value">SDO Pampanga</div>
        </div>
        <div className="about-item">
          <div className="label">Analysis Period</div>
          <div className="value">SY 2021–22 to 2025–26</div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;