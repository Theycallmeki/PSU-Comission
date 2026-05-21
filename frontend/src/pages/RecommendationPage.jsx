import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsApi, classroomsApi, enrollmentsApi } from '../api/api';
import {
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Users,
  CheckCircle,
  Zap,
  Eye,
  Stethoscope,
  Lightbulb,
  Telescope,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import '../styles/RecommendationPage.css';

// ─── 4-Analysis icons & labels ────────────────────────────────────────────────
const ANALYSIS_META = [
  {
    key: 'descriptive',
    label: 'Descriptive',
    sublabel: 'What happened?',
    Icon: Eye,
    colorClass: 'analysis--descriptive',
  },
  {
    key: 'diagnostic',
    label: 'Diagnostic',
    sublabel: 'Why did it happen?',
    Icon: Stethoscope,
    colorClass: 'analysis--diagnostic',
  },
  {
    key: 'prescriptive',
    label: 'Prescriptive',
    sublabel: 'What should we do?',
    Icon: Lightbulb,
    colorClass: 'analysis--prescriptive',
  },
  {
    key: 'predictive',
    label: 'Predictive',
    sublabel: 'What is likely to happen?',
    Icon: Telescope,
    colorClass: 'analysis--predictive',
  },
];

// ─── Custom Dropdown Component ─────────────────────────────────────────────────
const CustomDropdown = ({ label, value, options, onChange, displayFn }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayLabel = displayFn ? displayFn(value) : value;

  return (
    <div className="rec-filter" ref={ref}>
      <label className="rec-filter-label">{label}</label>
      <div className="custom-dropdown">
        <button
          type="button"
          className="custom-dropdown-trigger"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="custom-dropdown-value">{displayLabel}</span>
          <ChevronDown size={14} className={`custom-dropdown-chevron ${open ? 'custom-dropdown-chevron--open' : ''}`} />
        </button>

        {open && (
          <ul className="custom-dropdown-menu" role="listbox">
            {options.map((opt) => {
              const optLabel = displayFn ? displayFn(opt) : opt;
              const isSelected = opt === value;
              return (
                <li
                  key={opt}
                  role="option"
                  aria-selected={isSelected}
                  className={`custom-dropdown-item ${isSelected ? 'custom-dropdown-item--selected' : ''}`}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {optLabel}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const RecommendationPage = () => {
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [gradeOptions, setGradeOptions] = useState(['ALL']);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [classroomData, enrollmentData] = await Promise.all([
          classroomsApi.getAll(),
          enrollmentsApi.getAll(),
        ]);

        setClassrooms(classroomData || []);
        const validEnrollments = enrollmentData || [];
        setEnrollments(validEnrollments);

        const years = validEnrollments.map(e => e.school_year).sort();
        setSchoolYearOptions(years);
        if (years.length > 0) {
          setSelectedSchoolYear(years[years.length - 1]);
        }

        const gradeOrder = ['ALL', 'KINDER'];
        const allGrades = ['ALL', ...new Set((classroomData || []).map(c => c.grade_level))].sort((a, b) => {
          const aIdx = gradeOrder.indexOf(a);
          const bIdx = gradeOrder.indexOf(b);
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        setGradeOptions(allGrades);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Unable to load initial data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedSchoolYear) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const recData = await recommendationsApi.getAll(selectedSchoolYear);
        setAllRecommendations(recData || []);
        setFilteredRecommendations(recData || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError('Unable to load insights for the selected school year.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedSchoolYear]);

  useEffect(() => {
    if (selectedGrade === 'ALL') {
      setFilteredRecommendations(allRecommendations);
    } else {
      setFilteredRecommendations(
        allRecommendations.filter(r => r.grade === selectedGrade || r.grade === 'ALL')
      );
    }
  }, [selectedGrade, allRecommendations]);

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Trend derivation ───────────────────────────────────────────────────────
  const getTrendState = (rec) => {
    if (rec.trend) {
      const t = rec.trend.toLowerCase();
      if (['increase', 'increased', 'up'].includes(t)) return 'increase';
      if (['decrease', 'decreased', 'down'].includes(t)) return 'decrease';
      return 'optimal';
    }
    const text = `${rec.title || ''} ${rec.message || ''}`.toLowerCase();
    const increaseWords = ['increase', 'increased', 'growing', 'risen', 'higher', 'surge', 'up'];
    const decreaseWords = ['decrease', 'decreased', 'declining', 'fallen', 'lower', 'drop', 'down', 'below'];
    if (increaseWords.some(w => text.includes(w))) return 'increase';
    if (decreaseWords.some(w => text.includes(w))) return 'decrease';
    if (rec.type === 'danger') return 'decrease';
    if (rec.type === 'success') return 'increase';
    return 'optimal';
  };

  const getIcon = (rec) => {
    const trend = getTrendState(rec);
    if (trend === 'increase') return <TrendingUp size={20} />;
    if (trend === 'decrease') return <TrendingDown size={20} />;
    switch (rec.category) {
      case 'Capacity':     return <Users size={20} />;
      case 'Trend':        return <TrendingUp size={20} />;
      case 'Retention':    return <UserCheck size={20} />;
      case 'Demographics': return <Users size={20} />;
      case 'System':       return <CheckCircle size={20} />;
      default:             return <Info size={20} />;
    }
  };

  const getIconClass = (rec) => {
    const trend = getTrendState(rec);
    if (trend === 'increase') return 'increase';
    if (trend === 'decrease') return 'decrease';
    return 'optimal';
  };

  // ─── Data tags ──────────────────────────────────────────────────────────────
  const renderDataTags = (data) => {
    if (!data) return null;
    return Object.entries(data).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      const displayValue = typeof value === 'number' && !Number.isInteger(value)
        ? value.toFixed(1)
        : Array.isArray(value) ? value.join(' → ') : value;
      return (
        <span key={key} className="data-tag">
          {label}: {displayValue}
          {key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate') ? '%' : ''}
        </span>
      );
    });
  };

  // ─── 4-Analysis panel ───────────────────────────────────────────────────────
  const renderAnalysisPanel = (analysis) => {
    if (!analysis) return null;
    const hasContent = ANALYSIS_META.some(m => analysis[m.key]);
    if (!hasContent) return null;

    return (
      <div className="analysis-grid">
        {ANALYSIS_META.map(({ key, label, sublabel, Icon, colorClass }) => {
          const text = analysis[key];
          if (!text) return null;
          return (
            <div key={key} className={`analysis-block ${colorClass}`}>
              <div className="analysis-block-header">
                <span className="analysis-icon-wrap">
                  <Icon size={14} />
                </span>
                <div className="analysis-labels">
                  <span className="analysis-label">{label}</span>
                  <span className="analysis-sublabel">{sublabel}</span>
                </div>
              </div>
              <p className="analysis-text">{text}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Grade stats ────────────────────────────────────────────────────────────
  const getGradeStats = () => {
    if (selectedGrade === 'ALL' || !enrollments.length || !selectedSchoolYear) return null;
    const targetEnrollment = enrollments.find(e => e.school_year === selectedSchoolYear);
    if (!targetEnrollment) return null;

    const gradeKey = selectedGrade.toLowerCase().replace(' ', '');
    const total = targetEnrollment[`${gradeKey}_total`] || 0;
    const female = targetEnrollment[`${gradeKey}_f`] || 0;
    const male = targetEnrollment[`${gradeKey}_m`] || 0;
    const classroomMatch = classrooms.find(c => c.grade_level === selectedGrade);
    const classroomCount = classroomMatch ? classroomMatch.num_classrooms : 0;
    const ratio = classroomCount > 0 ? (total / classroomCount).toFixed(1) : 'N/A';

    let interpretation = 'This grade level is currently stable.';
    if (classroomCount === 0 && total > 0)
      interpretation = 'CRITICAL: No classrooms allocated for these students.';
    else if (ratio > 45)
      interpretation = 'Teachers count is low, they are being piled up to number of students. Seats are equal to the number of students, it may not have the capacity to accommodate more.';
    else if (ratio < 20)
      interpretation = 'This grade has low student density relative to available space.';

    return { total, female, male, classroomCount, ratio, interpretation };
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading && !enrollments.length) {
    return (
      <div className="rec-loading">
        <div className="rec-spinner" />
        <p>Analyzing Live Database…</p>
      </div>
    );
  }

  const stats = getGradeStats();

  return (
    <div className="rec-page">

      {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/" className="breadcrumb-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item breadcrumb-inactive">Menu</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item breadcrumb-active">Recommendations</span>
        </nav>

      {/* Page Header */}
      <div className="rec-page-header">
        <div>
          <h1 className="rec-title-main">Intelligent Insights</h1>
          <p className="rec-subtitle">
            Data-driven recommendations and four-layer analysis for your school.
          </p>
        </div>

        <div className="rec-filters">
          <CustomDropdown
            label="School Year"
            value={selectedSchoolYear}
            options={schoolYearOptions}
            onChange={setSelectedSchoolYear}
          />

          <CustomDropdown
            label="Grade Level"
            value={selectedGrade}
            options={gradeOptions}
            onChange={setSelectedGrade}
            displayFn={(val) => val === 'ALL' ? 'School Overview' : val}
          />
        </div>
      </div>

      {/* Analysis Legend */}
      <div className="analysis-legend">
        {ANALYSIS_META.map(({ key, label, sublabel, Icon, colorClass }) => (
          <div key={key} className={`legend-pill ${colorClass}`}>
            <Icon size={13} />
            <span className="legend-label">{label}</span>
            <span className="legend-sublabel">— {sublabel}</span>
          </div>
        ))}
      </div>

      {/* Grade Stats */}
      {selectedGrade !== 'ALL' && stats && (
        <section className="rec-stats-section">
          <div className="rec-stats-grid">
            <div className="rec-stat-card">
              <span className="stat-label">Total Enrollment</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="rec-stat-card">
              <span className="stat-label">Gender (M / F)</span>
              <span className="stat-value">{stats.male} / {stats.female}</span>
            </div>
            <div className="rec-stat-card">
              <span className="stat-label">Classrooms</span>
              <span className="stat-value">{stats.classroomCount}</span>
            </div>
            <div className="rec-stat-card">
              <span className="stat-label">Student Ratio</span>
              <span className="stat-value">{stats.ratio}</span>
            </div>
          </div>
          <div className="rec-interpretation">
            <Info size={16} />
            <span><strong>Interpretation:</strong> {stats.interpretation}</span>
          </div>
        </section>
      )}

      {/* Cards / Error */}
      {error ? (
        <div className="error-box" style={{ marginTop: 16 }}>
          <AlertTriangle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {error}
        </div>
      ) : (
        <div className="rec-grid">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => {
              const iconClass = getIconClass(rec);
              const isExpanded = !!expandedCards[rec.id];
              const hasAnalysis = rec.analysis && ANALYSIS_META.some(m => rec.analysis[m.key]);

              return (
                <div key={rec.id} className={`rec-card ${isExpanded ? 'rec-card--expanded' : ''}`}>
                  {/* Card Header */}
                  <div className="rec-card-header">
                    <div className={`rec-icon rec-icon--${iconClass}`}>
                      {getIcon(rec)}
                    </div>
                    <span className="rec-card-category">
                      {rec.category}{rec.grade !== 'ALL' && ` • ${rec.grade}`}
                    </span>
                  </div>

                  <h3 className="rec-card-title">{rec.title}</h3>
                  <p className="rec-card-message">{rec.message}</p>

                  {/* Data tags + action badge */}
                  <div className="rec-card-footer">
                    <div className="rec-data-tags">
                      {renderDataTags(rec.data)}
                    </div>
                    <span className="rec-action-badge">{rec.action}</span>
                  </div>

                  {/* Toggle button — only if analysis exists */}
                  {hasAnalysis && (
                    <>
                      <button
                        className="analysis-toggle-btn"
                        onClick={() => toggleCard(rec.id)}
                        aria-expanded={isExpanded}
                      >
                        <span className="analysis-toggle-label">
                          {isExpanded ? 'Hide' : 'View'} 4-Layer Analysis
                        </span>
                        <span className="analysis-toggle-pills">
                          {ANALYSIS_META.map(({ key, Icon, colorClass }) =>
                            rec.analysis[key] ? (
                              <span key={key} className={`toggle-pill ${colorClass}`}>
                                <Icon size={11} />
                              </span>
                            ) : null
                          )}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* Expandable 4-analysis panel */}
                      <div className={`analysis-panel ${isExpanded ? 'analysis-panel--open' : ''}`}>
                        <div className="analysis-panel-inner">
                          {renderAnalysisPanel(rec.analysis)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rec-empty">
              <Zap size={36} />
              <h2>Optimal Performance!</h2>
              <p>No critical issues detected for {selectedGrade}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;