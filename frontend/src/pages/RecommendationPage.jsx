import React, { useState, useEffect } from 'react';
import { recommendationsApi, classroomsApi, enrollmentsApi } from '../api/api';
import { 
  AlertTriangle, 
  Info, 
  TrendingUp,
  TrendingDown,
  UserCheck, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Zap,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle
} from 'lucide-react';
import '../styles/RecommendationPage.css';

const RecommendationPage = () => {
  const [allRecommendations, setAllRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [gradeOptions, setGradeOptions] = useState(['ALL']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recData, classroomData, enrollmentData] = await Promise.all([
          recommendationsApi.getAll(),
          classroomsApi.getAll(),
          enrollmentsApi.getAll()
        ]);
        
        setAllRecommendations(recData || []);
        setFilteredRecommendations(recData || []);
        setClassrooms(classroomData || []);
        setEnrollments(enrollmentData || []);

        const gradeOrder = ['ALL', 'KINDER'];
        const allGrades = ['ALL', ...new Set(classroomData.map(c => c.grade_level))].sort((a, b) => {
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
        console.error("Failed to fetch data:", err);
        setError("Unable to load insights. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGrade === 'ALL') {
      setFilteredRecommendations(allRecommendations);
    } else {
      setFilteredRecommendations(
        allRecommendations.filter(r => r.grade === selectedGrade || r.grade === 'ALL')
      );
    }
  }, [selectedGrade, allRecommendations]);

  /**
   * Derive the trend state from a recommendation object.
   * Priority:
   *   1. rec.trend   ('increase' | 'decrease' | 'optimal')
   *   2. rec.type    ('danger' → decrease, 'success' → increase, 'info' → optimal)
   *   3. Keyword scan of title/message
   */
  const getTrendState = (rec) => {
    // Explicit trend field wins
    if (rec.trend) {
      const t = rec.trend.toLowerCase();
      if (t === 'increase' || t === 'increased' || t === 'up')   return 'increase';
      if (t === 'decrease' || t === 'decreased' || t === 'down') return 'decrease';
      return 'optimal';
    }

    // Keyword scan on title + message
    const text = `${rec.title || ''} ${rec.message || ''}`.toLowerCase();
    const increaseWords = ['increase', 'increased', 'growing', 'risen', 'higher', 'surge', 'up'];
    const decreaseWords = ['decrease', 'decreased', 'declining', 'fallen', 'lower', 'drop', 'down', 'below'];

    if (increaseWords.some(w => text.includes(w))) return 'increase';
    if (decreaseWords.some(w => text.includes(w))) return 'decrease';

    // Fall back to type
    if (rec.type === 'danger')  return 'decrease';
    if (rec.type === 'success') return 'increase';
    return 'optimal';
  };

  /**
   * Return the correct icon component based on trend state.
   * increase → TrendingUp  (green)
   * decrease → TrendingDown (red)
   * optimal  → CheckCircle / category icon (blue)
   */
  const getIcon = (rec) => {
    const trend = getTrendState(rec);

    if (trend === 'increase') return <TrendingUp  size={20} />;
    if (trend === 'decrease') return <TrendingDown size={20} />;

    // Optimal — use category-specific icon
    switch (rec.category) {
      case 'Capacity':     return <Users      size={20} />;
      case 'Trend':        return <TrendingUp  size={20} />;
      case 'Retention':    return <UserCheck   size={20} />;
      case 'Demographics': return <Users       size={20} />;
      case 'System':       return <CheckCircle size={20} />;
      default:             return <Info        size={20} />;
    }
  };

  /** CSS class suffix for the icon wrapper */
  const getIconClass = (rec) => {
    const trend = getTrendState(rec);
    if (trend === 'increase') return 'increase';
    if (trend === 'decrease') return 'decrease';
    return 'optimal';
  };

  const renderDataTags = (data) => {
    if (!data) return null;
    return Object.entries(data).map(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
      const displayValue = typeof value === 'number' && !Number.isInteger(value)
        ? value.toFixed(1)
        : value;
      return (
        <span key={key} className="data-tag">
          {label}: {displayValue}
          {key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate') ? '%' : ''}
        </span>
      );
    });
  };

  const getGradeStats = () => {
    if (selectedGrade === 'ALL' || !enrollments.length) return null;
    const latest = enrollments[enrollments.length - 1];
    const gradeKey = selectedGrade.toLowerCase().replace(' ', '');
    const total = latest[`${gradeKey}_total`] || 0;
    const female = latest[`${gradeKey}_f`] || 0;
    const male = latest[`${gradeKey}_m`] || 0;
    const classroomMatch = classrooms.find(c => c.grade_level === selectedGrade);
    const classroomCount = classroomMatch ? classroomMatch.num_classrooms : 0;
    const ratio = classroomCount > 0 ? (total / classroomCount).toFixed(1) : 'N/A';

    let interpretation = "This grade level is currently stable.";
    if (classroomCount === 0 && total > 0) interpretation = "CRITICAL: No classrooms allocated for these students.";
    else if (ratio > 45) interpretation = "This grade is currently overcrowded and requires immediate attention.";
    else if (ratio < 20) interpretation = "This grade has low student density relative to available space.";

    return { total, female, male, classroomCount, ratio, interpretation };
  };

  if (loading) {
    return (
      <div className="rec-loading">
        <div className="rec-spinner"></div>
        <p>Analyzing Live Database...</p>
      </div>
    );
  }

  const stats = getGradeStats();

  return (
    <div className="rec-page">

      {/* Page Header */}
      <div className="rec-page-header">
        <div>
          <h1 className="rec-title-main">Intelligent Insights</h1>
          <p className="rec-subtitle">Data-driven recommendations and status interpretation for your school.</p>
        </div>

        <div className="rec-filter">
          <label className="rec-filter-label">Grade Level</label>
          <select
            className="rec-select"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            {gradeOptions.map(grade => (
              <option key={grade} value={grade}>
                {grade === 'ALL' ? 'School Overview' : grade}
              </option>
            ))}
          </select>
        </div>
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
              return (
                <div key={rec.id} className="rec-card">
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

                  <div className="rec-card-footer">
                    <div className="rec-data-tags">
                      {renderDataTags(rec.data)}
                    </div>
                    <span className="rec-action-badge">{rec.action}</span>
                  </div>
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