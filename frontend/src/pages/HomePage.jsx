  import React from 'react';
  import { Link } from 'react-router-dom';
  import '../styles/HomePage.css';

  const SchoolIcon = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 9h1" /><path d="M14 9h1" />
      <path d="M9 13h1" /><path d="M14 13h1" />
    </svg>
  );

  const MapPinIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-4-4-7-7.333-7-11a7 7 0 1 1 14 0c0 3.667-3 7-7 11z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  );

  const IdIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15v-4a2 2 0 0 1 4 0v4M7 13h4M15 9h2M15 13h2" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );

  const ClassroomIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );

  const EnrollmentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 4-6" />
    </svg>
  );

  const RecommendIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );

  const MetricsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  );

  const ArrowIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );

  const modules = [
    {
      icon: <ClassroomIcon />,
      accent: 'blue',
      label: 'Classrooms',
      description: 'Monitor classroom allocations, seat capacity, and room usage across school years.',
      stat: '6 Rooms',
      statLabel: 'Active Classrooms',
    
      primaryAction: {
        to: '/classrooms',
        cta: 'View Classrooms Table',
      },
    
      secondaryAction: {
        to: '/classrooms/analytics',
        cta: 'View Classroom Analytics',
      },
    },
    {
      icon: <EnrollmentIcon />,
      accent: 'teal',
      label: 'Enrollments',
      description: 'Track and analyze student enrollment numbers and trends across grade levels.',
      stat: '5 Years',
      statLabel: 'Data Coverage',
    
      primaryAction: {
        to: '/enrollments',
        cta: 'View Enrollments',
      },
    
      secondaryAction: {
        to: '/enrollments/analytics',
        cta: 'View Enrollment Analytics',
      },
    },
    {
      to: '/recommendations',
      icon: <RecommendIcon />,
      accent: 'amber',
      label: 'Recommendations',
      description: 'Explore AI-generated insights and improvement strategies for your school.',
      stat: 'AI-Powered',
      statLabel: 'Smart Insights',
      cta: 'View Recommendations',
    },
    {
      to: '/metrics',
      icon: <MetricsIcon />,
      accent: 'rose',
      label: 'Metrics',
      description: 'Deep-dive into performance metrics and KPIs across all school dimensions.',
      stat: 'Live Data',
      statLabel: 'Real-time Metrics',
      cta: 'View Metrics',
    },
  ];

  const glanceItems = [
    { label: 'Type', value: 'Public Elementary (K–6)' },
    { label: 'Division', value: 'SDO Pampanga' },
    { label: 'District', value: 'Apalit II' },
    { label: 'Analysis Period', value: 'SY 2021–22 to 2025–26' },
  ];

  const HomePage = () => {
    return (
      <div className="homepage">

        {/* ── School Header ── */}
        <div className="school-header">
          <div className="school-header__glow" />
          <div className="school-header__pattern" />

          <div className="school-emblem">
            <SchoolIcon />
          </div>

          <div className="school-info">
            <span className="school-badge">Public Elementary · DepEd Pampanga</span>
            <h1 className="school-name">Galang Elementary Memorial School</h1>
            <p className="school-formerly">Formerly Calantipe Elementary School · Est. 1986</p>
            <div className="school-meta">
              <span className="meta-item"><MapPinIcon /> Brgy. Calantipe, Apalit, Pampanga</span>
              <span className="meta-item"><IdIcon /> School ID: 105871</span>
              <span className="meta-item"><CalendarIcon /> SY 2021–2022 to 2025–2026</span>
            </div>
          </div>
        </div>

        {/* ── Welcome Banner ── */}
        <div className="welcome-banner">
          <div className="welcome-banner__left">
            <p className="welcome-eyebrow">Welcome back</p>
            <h2 className="welcome-title">GEMS Admin Dashboard</h2>
            <p className="welcome-desc">
              Manage and monitor educational data for Galang Elementary Memorial School.
              Navigate the modules below to access enrollment trends, classroom data,
              AI recommendations, and performance metrics.
            </p>
          </div>
          <div className="welcome-banner__divider" />
          <div className="welcome-banner__right">
            <div className="welcome-stat">
              <span className="welcome-stat__number">5</span>
              <span className="welcome-stat__label">School Years Tracked</span>
            </div>
            <div className="welcome-stat">
              <span className="welcome-stat__number">4</span>
              <span className="welcome-stat__label">Modules Available</span>
            </div>
          </div>
        </div>

        <div className="module-grid">
              {modules.map((mod, i) => (
                <div
                  key={mod.label}
                  className={`module-card module-card--${mod.accent}`}
                  style={{ '--delay': `${i * 60}ms` }}
                >
                  {/* TOP */}
                  <div className="module-card__top">
                    <div className="module-card__icon-wrap">
                      {mod.icon}
                    </div>

                    <div className="module-card__stat-wrap">
                      <span className="module-card__stat">{mod.stat}</span>
                      <span className="module-card__stat-label">{mod.statLabel}</span>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="module-card__body">
                    <h3 className="module-card__title">{mod.label}</h3>
                    <p className="module-card__desc">{mod.description}</p>
                  </div>

                  {/* FOOTER (NOW MULTI-ROUTE SUPPORT) */}
                  <div className="module-card__footer">

                {/* PRIMARY ACTION */}
            {mod.primaryAction ? (
              <Link to={mod.primaryAction.to} className="module-card__cta">
                {mod.primaryAction.cta} <ArrowIcon />
              </Link>
            ) : (
              <Link to={mod.to} className="module-card__cta">
                {mod.cta} <ArrowIcon />
              </Link>
            )}

            <br />

            {/* SECONDARY ACTION */}
            {mod.secondaryAction && (
              <>
                <br />
                <Link
                  to={mod.secondaryAction.to}
                  className="module-card__cta module-card__cta--secondary"
                >
                  {mod.secondaryAction.cta} <ArrowIcon />
                </Link>
              </>
            )}
      </div>

      <div className="module-card__shine" />
    </div>
  ))}
</div>

        {/* ── School at a Glance ── */}
        <div className="section-header">
          <p className="section-eyebrow">School Profile</p>
          <h3 className="section-title">At a glance</h3>
        </div>

        <div className="glance-grid">
          {glanceItems.map((item) => (
            <div key={item.label} className="glance-card">
              <p className="glance-card__label">{item.label}</p>
              <p className="glance-card__value">{item.value}</p>
            </div>
          ))}
        </div>

      </div>
    );
  };

  export default HomePage;