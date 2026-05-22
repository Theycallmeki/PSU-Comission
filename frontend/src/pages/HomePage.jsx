import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import gemsLogo from '../assets/GEMS.jpg';
import { useAuth } from '../protected_routes/ProtectedRoute';

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

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const EnrollmentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const TeachersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    <line x1="19" y1="8" x2="19" y2="14"/>
    <line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

const RecommendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const MetricsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
);

const TableIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M3 9h18M3 15h18M9 3v18"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const SchoolTypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"/>
    <path d="M5 21V7l7-4 7 4v14"/>
    <path d="M9 21v-6h6v6"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21c-4-4-7-7.333-7-11a7 7 0 1 1 14 0c0 3.667-3 7-7 11z"/>
    <circle cx="12" cy="10" r="2"/>
  </svg>
);

const PeriodIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const modules = [
  {
    icon: <BookIcon />,
    accent: 'blue',
    label: 'Classrooms',
    pageKeys: ['classrooms', 'classrooms_analytics'],
    description: 'Monitor classroom allocations, seat capacity, and room usage across school years.',
    stat: '6 Rooms',
    statLabel: 'Active Classrooms',
    primaryAction:   { to: '/classrooms',           cta: 'View Table',     icon: <TableIcon /> },
    secondaryAction: { to: '/classrooms/analytics', cta: 'View Analytics', icon: <ChartIcon /> },
  },
  {
    icon: <EnrollmentIcon />,
    accent: 'teal',
    label: 'Enrollments',
    pageKeys: ['enrollments', 'enrollments_analytics'],
    description: 'Track and analyze student enrollment numbers and trends across grade levels.',
    stat: '5 Years',
    statLabel: 'Data Coverage',
    primaryAction:   { to: '/enrollments',           cta: 'View Table',     icon: <TableIcon /> },
    secondaryAction: { to: '/enrollments/analytics', cta: 'View Analytics', icon: <ChartIcon /> },
  },
  {
    icon: <TeachersIcon />,
    accent: 'purple',
    label: 'Teachers / Seats',
    pageKeys: ['teachers_seats', 'teachers_seats_analytics'],
    description: 'View teacher assignments, seat allocations, and staffing data across school years.',
    stat: 'Live Data',
    statLabel: 'Staff Records',
    primaryAction:   { to: '/teachers-seats',           cta: 'View Table',     icon: <TableIcon /> },
    secondaryAction: { to: '/teachers-seats/analytics', cta: 'View Analytics', icon: <ChartIcon /> },
  },
  {
    icon: <RecommendIcon />,
    accent: 'amber',
    label: 'Recommendations',
    pageKeys: ['recommendations'],
    description: 'Explore AI-generated insights and improvement strategies for your school.',
    stat: 'Live Data',
    statLabel: 'Smart Insights',
    singleAction: { to: '/recommendations', cta: 'View Recommendations', icon: <ArrowIcon /> },
  },
  {
    icon: <MetricsIcon />,
    accent: 'rose',
    label: 'Metrics',
    pageKeys: ['dashboard'],
    description: 'Deep-dive into performance metrics and KPIs across all school dimensions.',
    stat: 'Live Data',
    statLabel: 'Real-time Metrics',
    singleAction: { to: '/metrics', cta: 'View Metrics', icon: <ArrowIcon /> },
  },
];

const glanceItems = [
  { icon: <SchoolTypeIcon />, label: 'Type',            value: 'Public Elementary (K–6)' },
  { icon: <GlobeIcon />,      label: 'Division',        value: 'SDO Pampanga' },
  { icon: <PinIcon />,        label: 'District',        value: 'Apalit II' },
  { icon: <PeriodIcon />,     label: 'Analysis Period', value: 'SY 2021–22 to 2025–26' },
];

const HomePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const visibleModules = isAdmin
    ? modules
    : modules.filter(mod =>
        mod.pageKeys.some(key => user?.allowed_pages?.includes(key))
      );

  // Helper: check if user can access a specific page key
  const canAccess = (pageKey) =>
    isAdmin || user?.allowed_pages?.includes(pageKey);

  return (
    <div className="homepage">

      {/* ── School Header ── */}
      <div className="school-header">
        <div className="school-header__glow" />
        <div className="school-header__pattern" />
        <img
          src={gemsLogo}
          alt="Galang Elementary Memorial School Logo"
          className="school-logo"
        />
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
          <h2 className="welcome-title">GEMS ADMIN DASHBOARD</h2>
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
            <span className="welcome-stat__number">{visibleModules.length}</span>
            <span className="welcome-stat__label">Modules Available</span>
          </div>
        </div>
      </div>

      {/* ── Module Grid ── */}
      <div className="module-grid">
        {visibleModules.map((mod, i) => (
          <div
            key={mod.label}
            className={`module-card module-card--${mod.accent}`}
            style={{ '--delay': `${i * 60}ms` }}
          >
            {/* TOP */}
            <div className="module-card__top">
              <div className="module-card__icon-wrap">{mod.icon}</div>
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

            {/* FOOTER */}
            <div className="module-card__footer">
              <div className="module-card__actions">
                {mod.singleAction ? (
                  <Link
                    to={mod.singleAction.to}
                    className="module-card__pill module-card__pill--single"
                  >
                    <span className="pill-icon">{mod.singleAction.icon}</span>
                    {mod.singleAction.cta}
                  </Link>
                ) : (
                  <>
                    {canAccess(mod.pageKeys[0]) && (
                      <Link
                        to={mod.primaryAction.to}
                        className="module-card__pill module-card__pill--table"
                      >
                        <span className="pill-icon">{mod.primaryAction.icon}</span>
                        {mod.primaryAction.cta}
                      </Link>
                    )}
                    {canAccess(mod.pageKeys[1]) && (
                      <Link
                        to={mod.secondaryAction.to}
                        className="module-card__pill module-card__pill--analytics"
                      >
                        <span className="pill-icon">{mod.secondaryAction.icon}</span>
                        {mod.secondaryAction.cta}
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="module-card__shine" />
          </div>
        ))}
      </div>

      {/* ── School at a Glance ── */}
      <div className="section-header">
        <p className="section-eyebrow">School Profile</p>
        <h3 className="section-title">Overview</h3>
      </div>

      <div className="glance-grid">
        {glanceItems.map((item) => (
          <div key={item.label} className="glance-card">
            <div className="glance-card__icon">{item.icon}</div>
            <p className="glance-card__label">{item.label}</p>
            <p className="glance-card__value">{item.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HomePage;