const db = require('../config/db');

// ==========================================
// HELPER: Dynamically extract grade keys from enrollment columns
// Instead of hardcoding ['kinder', 'grade1', ...], we derive them
// from column names that match the pattern: <grade>_total
// ==========================================
const extractGradeKeys = (enrollmentRow) => {
  if (!enrollmentRow) return [];
  return Object.keys(enrollmentRow)
    .filter(key => key.endsWith('_total') && key !== 'total_enrollees')
    .map(key => {
      const grade = key.replace('_total', '');
      // Convert 'kinder' → 'KINDER', 'grade1' → 'GRADE 1', etc.
      const label = grade === 'kinder'
        ? 'KINDER'
        : grade.replace(/^grade(\d+)$/, 'GRADE $1').toUpperCase();
      return { key: grade, label, totalCol: key };
    });
};

// ==========================================
// MODULE A: Student-to-Classroom Ratio
// ==========================================
const analyzeRatios = (latestEnrollment, classrooms, grades) => {
  const recs = [];

  grades.forEach(g => {
    const students = latestEnrollment[g.totalCol] || 0;
    const classroomMatch = classrooms.find(c => c.grade_level === g.label);
    const count = classroomMatch ? classroomMatch.num_classrooms : 0;

    if (count > 0) {
      const ratio = students / count;
      if (ratio > 45) {
        recs.push({
          id: `ratio_${g.key}`,
          type: 'warning',
          category: 'Capacity',
          title: `High Student-to-Classroom Ratio in ${g.label}`,
          message: `The current ratio is ${ratio.toFixed(1)} students per classroom. Consider allocating more space or hiring additional teachers for this level.`,
          action: 'Infrastructure Update',
          data: { ratio: parseFloat(ratio.toFixed(1)), students, classrooms: count }
        });
      } else if (ratio < 20) {
        recs.push({
          id: `ratio_${g.key}`,
          type: 'info',
          category: 'Capacity',
          title: `Low Utilization in ${g.label}`,
          message: `The current ratio is ${ratio.toFixed(1)} students per classroom. You may have excess capacity in this grade level.`,
          action: 'Resource Optimization',
          data: { ratio: parseFloat(ratio.toFixed(1)), students, classrooms: count }
        });
      }
    } else if (students > 0) {
      recs.push({
        id: `ratio_${g.key}`,
        type: 'danger',
        category: 'Capacity',
        title: `Missing Classrooms for ${g.label}`,
        message: `There are ${students} students enrolled in ${g.label} but no classrooms are allocated.`,
        action: 'Immediate Action Required',
        data: { ratio: null, students, classrooms: 0 }
      });
    }
  });

  return recs;
};

// ==========================================
// MODULE B: Enrollment Trend Analysis
// Compare the two most recent school years
// ==========================================
const analyzeTrends = (enrollments, grades) => {
  const recs = [];
  if (enrollments.length < 2) return recs;

  const latest = enrollments[enrollments.length - 1];
  const previous = enrollments[enrollments.length - 2];

  grades.forEach(g => {
    const current = latest[g.totalCol] || 0;
    const prev = previous[g.totalCol] || 0;

    if (prev === 0) return; // Can't calculate % change from zero

    const change = ((current - prev) / prev) * 100;

    if (change > 15) {
      recs.push({
        id: `trend_${g.key}`,
        type: 'warning',
        category: 'Trend',
        title: `Rapid Enrollment Growth in ${g.label}`,
        message: `Enrollment increased by ${change.toFixed(1)}% (from ${prev} to ${current}) between ${previous.school_year} and ${latest.school_year}. Additional classrooms may be needed soon.`,
        action: 'Capacity Planning',
        data: { changePercent: parseFloat(change.toFixed(1)), current, previous: prev }
      });
    } else if (change < -15) {
      recs.push({
        id: `trend_${g.key}`,
        type: 'info',
        category: 'Trend',
        title: `Significant Enrollment Decline in ${g.label}`,
        message: `Enrollment decreased by ${Math.abs(change).toFixed(1)}% (from ${prev} to ${current}) between ${previous.school_year} and ${latest.school_year}. Consider investigating possible causes.`,
        action: 'Investigation Needed',
        data: { changePercent: parseFloat(change.toFixed(1)), current, previous: prev }
      });
    }
  });

  return recs;
};

// ==========================================
// MODULE C: Dropout / Repeater Analysis
// ==========================================
const analyzeDropouts = (enrollments) => {
  const recs = [];

  // Check the most recent year
  const latest = enrollments[enrollments.length - 1];
  if (!latest || !latest.total_enrollees || latest.total_enrollees === 0) return recs;

  const dropoutRate = latest.dropped_repeater / latest.total_enrollees;

  if (dropoutRate > 0.05) {
    recs.push({
      id: 'dropout_current',
      type: 'warning',
      category: 'Retention',
      title: `High Dropout/Repeater Rate in ${latest.school_year}`,
      message: `The dropout/repeater count is ${latest.dropped_repeater} (${(dropoutRate * 100).toFixed(1)}% of total enrollees). Investigation into student retention programs is recommended.`,
      action: 'Intervention Program',
      data: {
        dropoutCount: latest.dropped_repeater,
        totalEnrollees: latest.total_enrollees,
        rate: parseFloat((dropoutRate * 100).toFixed(1))
      }
    });
  }

  // Check if dropout rate is increasing (trend over last 3 years)
  if (enrollments.length >= 3) {
    const recent3 = enrollments.slice(-3);
    const rates = recent3.map(e =>
      e.total_enrollees > 0 ? (e.dropped_repeater / e.total_enrollees) * 100 : 0
    );

    // If rate is increasing each year
    if (rates[2] > rates[1] && rates[1] > rates[0] && rates[2] > 3) {
      recs.push({
        id: 'dropout_trend',
        type: 'danger',
        category: 'Retention',
        title: 'Dropout Rate is Trending Upward',
        message: `The dropout rate has been increasing over the last 3 years: ${rates.map(r => r.toFixed(1) + '%').join(' → ')}. Immediate intervention is recommended.`,
        action: 'Urgent Review',
        data: { rates: rates.map(r => parseFloat(r.toFixed(1))) }
      });
    }
  }

  return recs;
};

// ==========================================
// MODULE D: Gender Balance Check
// ==========================================
const analyzeGenderBalance = (latestEnrollment, grades) => {
  const recs = [];

  grades.forEach(g => {
    const female = latestEnrollment[`${g.key}_f`] || 0;
    const male = latestEnrollment[`${g.key}_m`] || 0;
    const total = female + male;

    if (total === 0) return;

    const femalePercent = (female / total) * 100;
    const malePercent = (male / total) * 100;

    if (femalePercent < 35 || malePercent < 35) {
      const minority = femalePercent < malePercent ? 'Female' : 'Male';
      const minPercent = Math.min(femalePercent, malePercent);
      recs.push({
        id: `gender_${g.key}`,
        type: 'info',
        category: 'Demographics',
        title: `Gender Imbalance in ${g.label}`,
        message: `${minority} students represent only ${minPercent.toFixed(1)}% of enrollment in ${g.label} (${female}F / ${male}M). This may warrant attention for inclusivity programs.`,
        action: 'Monitoring',
        data: { female, male, total, femalePercent: parseFloat(femalePercent.toFixed(1)), malePercent: parseFloat(malePercent.toFixed(1)) }
      });
    }
  });

  return recs;
};

// ==========================================
// MAIN: Generate all recommendations
// ==========================================
const generateRecommendations = async () => {
  // Fetch data
  const [enrollmentResult, classroomResult] = await Promise.all([
    db.query('SELECT * FROM enrollments ORDER BY school_year ASC'),
    db.query(`
      SELECT * FROM classrooms 
      ORDER BY CASE grade_level
        WHEN 'KINDER' THEN 1
        WHEN 'GRADE 1' THEN 2
        WHEN 'GRADE 2' THEN 3
        WHEN 'GRADE 3' THEN 4
        WHEN 'GRADE 4' THEN 5
        WHEN 'GRADE 5' THEN 6
        WHEN 'GRADE 6' THEN 7
        ELSE 8
      END
    `)
  ]);

  const enrollments = enrollmentResult.rows;
  const classrooms = classroomResult.rows;

  // Edge case: no data at all
  if (enrollments.length === 0 && classrooms.length === 0) {
    return [{
      id: 'no_data',
      type: 'info',
      category: 'System',
      title: 'No Data Available',
      message: 'There are no enrollment or classroom records in the system. Please add data to generate recommendations.',
      action: 'Data Entry Required',
      data: {}
    }];
  }

  const latestEnrollment = enrollments[enrollments.length - 1];
  const grades = extractGradeKeys(latestEnrollment);

  // Run all analysis modules
  const recommendations = [
    ...analyzeRatios(latestEnrollment, classrooms, grades),
    ...analyzeTrends(enrollments, grades),
    ...analyzeDropouts(enrollments),
    ...analyzeGenderBalance(latestEnrollment, grades),
  ];

  // If nothing flagged, return the "all stable" message
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'stable',
      type: 'success',
      category: 'System',
      title: 'All Systems Stable',
      message: 'Student distribution and classroom utilization are within optimal ranges.',
      action: 'Regular Monitoring',
      data: {}
    });
  }

  return recommendations;
};

module.exports = { generateRecommendations };
