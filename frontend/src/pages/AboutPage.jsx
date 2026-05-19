import React from 'react';
import '../styles/AboutPage.css';
import gemsLogo from '../assets/GEMS.jpg';

const SchoolIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18"/>
    <path d="M5 21V7l7-4 7 4v14"/>
    <path d="M9 21v-6h6v6"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4M12 8h.01"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ResourceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
    <line x1="10" y1="14" x2="14" y2="14"/>
  </svg>
);

const InsightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21c-4-4-7-7.333-7-11a7 7 0 1 1 14 0c0 3.667-3 7-7 11z"/>
    <circle cx="12" cy="10" r="2"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const IdIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="M7 15v-4a2 2 0 0 1 4 0v4M7 13h4M15 9h2M15 13h2"/>
  </svg>
);

const purposes = [
    {
      number: '01',
      icon: <TrendIcon />,
      accent: 'amber',        // ← changed from 'blue'
      title: 'Analyse Enrollment Trends',
      desc: 'Examine changes in student enrollment from SY 2021–2022 to 2025–2026, identifying increases or decreases and understanding possible reasons affecting these trends.',
    },
    {
      number: '02',
      icon: <UsersIcon />,
      accent: 'amber',        // ← changed from 'teal'
      title: 'Assess Retention & Performance',
      desc: 'Review data on dropouts and repeaters to better understand how well the school retains students and supports their learning progress.',
    },
    {
      number: '03',
      icon: <ResourceIcon />,
      accent: 'amber',        // ← already amber, no change
      title: 'Evaluate School Resources',
      desc: 'Analyze the relationship between the number of students, available classrooms, seats, and teacher-student ratio to determine if resources are sufficient.',
    },
    {
      number: '04',
      icon: <InsightIcon />,
      accent: 'amber',        // ← changed from 'purple'
      title: 'Provide Data-Based Insights',
      desc: 'Offer practical suggestions based on findings to help improve school planning and overall performance.',
    },
  ];

const AboutPage = () => {
  return (
    <div className="about-page">

      {/* ── Page Header ── */}
      <div className="about-page-header">
        <div className="about-page-header-left">
          <div className="about-page-icon-wrap">
            <InfoIcon />
          </div>
          <div>
            <h1 className="about-title">About</h1>
            <p className="about-sub">School background and project overview</p>
          </div>
        </div>
      </div>

      {/* ── School Background ── */}
      <section className="about-section">
        <div className="about-section-label">
          <div className="about-section-icon"><SchoolIcon /></div>
          <span>School Background</span>
        </div>

        <div className="about-school-card">
          <div className="about-school-card__accent" />
          <div className="about-school-card__body">

            {/* Logo + name row */}
            <div className="about-school-card__header">
              <img
                src={gemsLogo}
                alt="Galang Elementary Memorial School Logo"
                className="about-school-logo"
              />
              <div className="about-school-card__header-text">
                <h2 className="about-school-name">Galang Elementary Memorial School</h2>
                <p className="about-school-formerly">Formerly Calantipe Elementary School</p>
                <div className="about-school-meta">
                  <span className="about-meta-item"><MapPinIcon /> Brgy. Calantipe, Apalit, Pampanga</span>
                  <span className="about-meta-item"><IdIcon /> School ID: 105871</span>
                  <span className="about-meta-item"><CalendarIcon /> Est. 1986</span>
                </div>
              </div>
            </div>

            <div className="about-school-divider" />

            <p className="about-school-desc">
              Galang Elementary Memorial School (GEMS) is a public primary school located in
              Brgy. Calantipe, Apalit, Pampanga, Philippines. It operates under the jurisdiction
              of the Department of Education (DepEd) Schools Division Office of Pampanga.
            </p>
            <p className="about-school-desc">
              Established in 1986, it serves as a foundational learning institution, providing
              quality basic education to young learners in its community and helping them develop
              the skills and values they need for the future.
            </p>
          </div>
        </div>
      </section>

      {/* ── Purpose of the Project ── */}
      <section className="about-section">
        <div className="about-section-label">
          <div className="about-section-icon"><TargetIcon /></div>
          <span>Purpose of the Project</span>
        </div>

        <div className="about-purpose-grid">
          {purposes.map((p) => (
            <div key={p.number} className={`about-purpose-card about-purpose-card--${p.accent}`}>
              <div className="about-purpose-card__top">
                <div className="about-purpose-card__icon">{p.icon}</div>
                <span className="about-purpose-card__number">{p.number}</span>
              </div>
              <h3 className="about-purpose-card__title">{p.title}</h3>
              <p className="about-purpose-card__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;