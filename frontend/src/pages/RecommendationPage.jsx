import React, { useState, useEffect } from 'react';
import { recommendationsApi, classroomsApi, enrollmentsApi } from '../api/api';
import { 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  UserCheck, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Filter
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

        // Extract ALL possible grades from the classrooms table
        const allGrades = ['ALL', ...new Set(classroomData.map(c => c.grade_level))].sort((a, b) => {
          if (a === 'ALL') return -1;
          if (b === 'ALL') return 1;
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
      setFilteredRecommendations(allRecommendations.filter(r => r.grade === selectedGrade || r.grade === 'ALL'));
    }
  }, [selectedGrade, allRecommendations]);

  const getIcon = (category, type) => {
    if (type === 'danger') return <AlertCircle size={24} />;
    
    switch (category) {
      case 'Capacity': return <Users size={24} />;
      case 'Trend': return <TrendingUp size={24} />;
      case 'Retention': return <UserCheck size={24} />;
      case 'Demographics': return <Users size={24} />;
      case 'System': return <CheckCircle size={24} />;
      default: return <Info size={24} />;
    }
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
          {label}: {displayValue}{key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate') ? '%' : ''}
        </span>
      );
    });
  };

  const getGradeStats = () => {
    if (selectedGrade === 'ALL' || !enrollments.length) return null;

    const latest = enrollments[enrollments.length - 1];
    const gradeKey = selectedGrade.toLowerCase().replace(' ', ''); // 'GRADE 1' -> 'grade1', 'KINDER' -> 'kinder'
    
    const total = latest[`${gradeKey}_total`] || 0;
    const female = latest[`${gradeKey}_f`] || 0;
    const male = latest[`${gradeKey}_m`] || 0;
    
    const classroomMatch = classrooms.find(c => c.grade_level === selectedGrade);
    const classroomCount = classroomMatch ? classroomMatch.num_classrooms : 0;
    const ratio = classroomCount > 0 ? (total / classroomCount).toFixed(1) : 'N/A';

    // Interpretation logic
    let interpretation = "This grade level is currently stable.";
    if (classroomCount === 0 && total > 0) interpretation = "CRITICAL: No classrooms allocated for these students.";
    else if (ratio > 45) interpretation = "This grade is currently overcrowded and requires immediate attention.";
    else if (ratio < 20) interpretation = "This grade has low student density relative to available space.";

    return { total, female, male, classroomCount, ratio, interpretation };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Analyzing Live Database...</p>
      </div>
    );
  }

  const stats = getGradeStats();

  return (
    <div className="recommendation-container">
      <header className="recommendation-header">
        <div>
          <h1>Intelligent Insights</h1>
          <p>Data-driven recommendations and status interpretation for your school.</p>
        </div>

        <div className="filter-container">
          <label className="filter-label">Select Grade Level</label>
          <select 
            className="grade-select"
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
      </header>

      {/* Grade Overview Section */}
      {selectedGrade !== 'ALL' && stats && (
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-mini-card">
              <span className="stat-label">Total Enrollment</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-mini-card">
              <span className="stat-label">Gender (M/F)</span>
              <span className="stat-value">{stats.male} / {stats.female}</span>
            </div>
            <div className="stat-mini-card">
              <span className="stat-label">Classrooms</span>
              <span className="stat-value">{stats.classroomCount}</span>
            </div>
            <div className="stat-mini-card">
              <span className="stat-label">Student Ratio</span>
              <span className="stat-value">{stats.ratio}</span>
            </div>
          </div>
          <div className="interpretation-bar">
            <Info size={18} />
            <span><strong>Interpretation:</strong> {stats.interpretation}</span>
          </div>
        </section>
      )}

      {error ? (
        <div className="rec-card danger" style={{ borderLeft: 'none', textAlign: 'center' }}>
          <div className="rec-icon-wrapper" style={{ margin: '0 auto 16px' }}>
            <AlertTriangle size={32} />
          </div>
          <div className="rec-title">Analysis Error</div>
          <p className="rec-message">{error}</p>
        </div>
      ) : (
        <div className="rec-grid">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => (
              <div key={rec.id} className={`rec-card ${rec.type}`}>
                <div className="rec-icon-wrapper">
                  {getIcon(rec.category, rec.type)}
                </div>
                
                <div className="rec-category">{rec.category} {rec.grade !== 'ALL' && `• ${rec.grade}`}</div>
                <h3 className="rec-title">{rec.title}</h3>
                <p className="rec-message">{rec.message}</p>
                
                <div className="rec-footer">
                  <div className="rec-data-summary">
                    {renderDataTags(rec.data)}
                  </div>
                  <div className="rec-action-badge">{rec.action}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <Zap size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
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
