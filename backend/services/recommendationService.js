const db = require('../config/db');

// ==========================================
// CONSTANTS  (keep in sync with analyticsController)
// ==========================================
const SEATS_PER_ROOM = 45;   // DepEd ideal max per classroom
const RATIO_HIGH     = 45;   // warn above this  (matches analyzeRatios)
const RATIO_LOW      = 20;   // warn below this
const TEACHER_HIGH   = 45;   // students-per-teacher danger threshold
const TEACHER_WARN   = 40;   // students-per-teacher warning threshold
const UTIL_HIGH      = 95;   // seat utilization % — overcrowded
const UTIL_WARN      = 85;   // seat utilization % — approaching capacity
const UTIL_LOW       = 50;   // seat utilization % — underutilized

// ==========================================
// HELPER: Dynamically extract grade keys from enrollment columns
// ==========================================
const extractGradeKeys = (enrollmentRow) => {
  if (!enrollmentRow) return [];
  return Object.keys(enrollmentRow)
    .filter(key => key.endsWith('_total') && key !== 'total_enrollees')
    .map(key => {
      const grade = key.replace('_total', '');
      const label = grade === 'kinder'
        ? 'KINDER'
        : grade.replace(/^grade(\d+)$/, 'GRADE $1').toUpperCase();
      return { key: grade, label, totalCol: key };
    });
};

// ==========================================
// HELPER: Build the 4-analysis block
// ==========================================
const buildAnalysis = ({ descriptive, diagnostic, prescriptive, predictive }) => ({
  descriptive,
  diagnostic,
  prescriptive,
  predictive,
});

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

      if (ratio > RATIO_HIGH) {
        recs.push({
          id: `ratio_${g.key}`,
          type: 'warning',
          category: 'Capacity',
          grade: g.label,
          title: `High Student-to-Classroom Ratio in ${g.label}`,
          message: `teachers count is low, they are being piled up to number of students. seats are equal to the number of students, it may not have the capacity to accommodate more.`,
          action: 'Infrastructure Update',
          data: { ratio: parseFloat(ratio.toFixed(1)), students, classrooms: count },
          analysis: buildAnalysis({
            descriptive: `${g.label} currently has ${students} students spread across ${count} classroom(s), resulting in a ratio of ${ratio.toFixed(1)} students per room — exceeding the ${RATIO_HIGH}-student threshold.`,
            diagnostic: `Overcrowding in ${g.label} may stem from population growth in the catchment area, lack of classroom construction keeping pace with enrollment, or consolidation of sections due to teacher shortages.`,
            prescriptive: `Immediately open additional sections or temporary learning spaces for ${g.label}. Consider hiring a supplemental teacher or splitting the largest sections. Coordinate with the district for emergency room allocation.`,
            predictive: `If enrollment trends continue and no classrooms are added, the ratio could exceed ${RATIO_HIGH + 5} students per room within 1–2 school years, significantly impacting learning outcomes and regulatory compliance.`,
          }),
        });
      } else if (ratio < RATIO_LOW) {
        recs.push({
          id: `ratio_${g.key}`,
          type: 'info',
          category: 'Capacity',
          grade: g.label,
          title: `Low Utilization in ${g.label}`,
          message: `The current ratio is ${ratio.toFixed(1)} students per classroom. You may have excess capacity in this grade level.`,
          action: 'Resource Optimization',
          data: { ratio: parseFloat(ratio.toFixed(1)), students, classrooms: count },
          analysis: buildAnalysis({
            descriptive: `${g.label} has ${students} students across ${count} classroom(s), yielding a ratio of ${ratio.toFixed(1)} — well below the ${RATIO_LOW}-student minimum efficiency threshold.`,
            diagnostic: `Low utilization may be caused by declining community enrollment, a recent classroom expansion that outpaced demand, or demographic shifts moving families away from the area.`,
            prescriptive: `Consider repurposing underused rooms for enrichment programs, library expansion, or support services. Alternatively, consolidate sections to reduce operational costs and allow teachers to focus on fewer, better-resourced classes.`,
            predictive: `Without intervention, maintaining underused classrooms will continue to drain maintenance and utilities budget. If enrollment does not recover within 2 years, formal consolidation is likely necessary.`,
          }),
        });
      }
    } else if (students > 0) {
      recs.push({
        id: `ratio_${g.key}`,
        type: 'danger',
        category: 'Capacity',
        grade: g.label,
        title: `Missing Classrooms for ${g.label}`,
        message: `There are ${students} students enrolled in ${g.label} but no classrooms are allocated.`,
        action: 'Immediate Action Required',
        data: { ratio: null, students, classrooms: 0 },
        analysis: buildAnalysis({
          descriptive: `${students} students are enrolled in ${g.label} for the current school year, but the system shows zero classrooms assigned to this grade level.`,
          diagnostic: `This critical gap likely results from a data entry oversight (classrooms exist physically but aren't recorded), a sudden surge in enrollment without corresponding room allocation, or administrative error during school year setup.`,
          prescriptive: `Verify classroom records immediately in the system and update allocations. If no physical rooms exist, escalate to administration for emergency space solutions such as shared rooms, modular classrooms, or schedule staggering.`,
          predictive: `Without immediate resolution, these ${students} students face an unstructured learning environment. This situation will also cause cascade issues in teacher load calculations and compliance reporting.`,
        }),
      });
    }
  });

  return recs;
};

// ==========================================
// MODULE B: Enrollment Trend Analysis
// ==========================================
const analyzeTrends = (enrollments, grades) => {
  const recs = [];
  if (enrollments.length < 2) return recs;

  const latest   = enrollments[enrollments.length - 1];
  const previous = enrollments[enrollments.length - 2];

  grades.forEach(g => {
    const current = latest[g.totalCol]   || 0;
    const prev    = previous[g.totalCol] || 0;

    if (prev === 0) return;

    const change = ((current - prev) / prev) * 100;

    if (change > 15) {
      recs.push({
        id: `trend_${g.key}`,
        type: 'warning',
        category: 'Trend',
        grade: g.label,
        title: `Rapid Enrollment Growth in ${g.label}`,
        message: `Enrollment increased by ${change.toFixed(1)}% (from ${prev} to ${current}) between ${previous.school_year} and ${latest.school_year}. Additional classrooms may be needed soon.`,
        action: 'Capacity Planning',
        data: { changePercent: parseFloat(change.toFixed(1)), current, previous: prev },
        analysis: buildAnalysis({
          descriptive: `${g.label} enrollment jumped from ${prev} in ${previous.school_year} to ${current} in ${latest.school_year} — a ${change.toFixed(1)}% increase in a single school year.`,
          diagnostic: `Such rapid growth often results from residential development nearby, feeder school overflow, improved school reputation, or a policy change (e.g., district rezoning) directing more students to this school.`,
          prescriptive: `Begin capacity planning now: assess current room availability, project teacher requirements, and submit infrastructure requests before the next enrollment cycle. Coordinate with local government on housing data that may signal continued growth.`,
          predictive: `If the ${change.toFixed(1)}% growth rate persists, ${g.label} could reach ${Math.round(current * 1.15)} students next year. Proactive classroom and staffing additions within the next 6–12 months are strongly recommended.`,
        }),
      });
    } else if (change < -15) {
      recs.push({
        id: `trend_${g.key}`,
        type: 'info',
        category: 'Trend',
        grade: g.label,
        title: `Significant Enrollment Decline in ${g.label}`,
        message: `Enrollment decreased by ${Math.abs(change).toFixed(1)}% (from ${prev} to ${current}) between ${previous.school_year} and ${latest.school_year}. Consider investigating possible causes.`,
        action: 'Investigation Needed',
        data: { changePercent: parseFloat(change.toFixed(1)), current, previous: prev },
        analysis: buildAnalysis({
          descriptive: `${g.label} lost ${prev - current} students between ${previous.school_year} and ${latest.school_year}, a decline of ${Math.abs(change).toFixed(1)}%.`,
          diagnostic: `Significant decline may be due to population movement out of the barangay, competition from nearby private schools, concerns about school quality or safety, or birth rate changes affecting the incoming cohort size.`,
          prescriptive: `Conduct a community survey to identify push factors. Launch re-enrollment campaigns and strengthen relationships with feeder schools and local officials. Review school programs to enhance attractiveness to families.`,
          predictive: `If the trend continues at this rate, ${g.label} enrollment may fall to approximately ${Math.round(current * (1 + change / 100))} next year. This could trigger section mergers and teacher redeployment needs.`,
        }),
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

  const latest = enrollments[enrollments.length - 1];
  if (!latest || !latest.total_enrollees || latest.total_enrollees === 0) return recs;

  const dropoutRate = latest.dropped_repeater / latest.total_enrollees;
  const ratePercent = dropoutRate * 100;

  let dropoutStatus = '';
  let dropoutType = 'info';
  let dropoutAction = '';

  if (ratePercent >= 10) {
    dropoutStatus = 'Very High / Critical';
    dropoutType = 'danger';
    dropoutAction = 'Urgent Intervention Required';
  } else if (ratePercent > 5) {
    dropoutStatus = 'High';
    dropoutType = 'danger';
    dropoutAction = 'Intervention Program';
  } else if (ratePercent >= 3) {
    dropoutStatus = 'Moderate Concern';
    dropoutType = 'warning';
    dropoutAction = 'Close Monitoring';
  } else {
    dropoutStatus = 'Low / Manageable';
    dropoutType = 'success';
    dropoutAction = 'Maintain Programs';
  }

  // Push a recommendation card for the current year's dropout rate
  recs.push({
    id: 'dropout_current',
    type: dropoutType,
    category: 'Retention',
    grade: 'ALL',
    title: `Dropout Rate is ${dropoutStatus}`,
    message: `The dropout/repeater count is ${latest.dropped_repeater} (${ratePercent.toFixed(1)}% of total enrollees). This falls into the '${dropoutStatus}' category.`,
    action: dropoutAction,
    data: {
      dropoutCount: latest.dropped_repeater,
      totalEnrollees: latest.total_enrollees,
      rate: parseFloat(ratePercent.toFixed(1)),
    },
    analysis: buildAnalysis({
      descriptive: `In ${latest.school_year}, the school-wide dropout rate is ${ratePercent.toFixed(1)}% (${latest.dropped_repeater} out of ${latest.total_enrollees} students).`,
      diagnostic: `A rate of ${ratePercent.toFixed(1)}% is considered ${dropoutStatus.toLowerCase()}. Elevated rates (above 3-5%) are commonly linked to socioeconomic factors, lack of academic support, or disengagement.`,
      prescriptive: ratePercent > 2 
        ? `Launch a student tracking and early-warning system. Strengthen conditional cash transfer linkage and school-based feeding programs to target at-risk students.` 
        : `Maintain current retention programs. A rate of 0-2% is low and manageable, but continuous tracking of at-risk students remains essential.`,
      predictive: ratePercent > 5 
        ? `Without targeted intervention, the retention problem is likely to worsen and affect DepEd performance scorecards.` 
        : `Continuing these programs will likely keep the dropout rate within optimal, manageable levels.`,
    }),
  });

  if (enrollments.length >= 3) {
    const recent3 = enrollments.slice(-3);
    const rates   = recent3.map(e =>
      e.total_enrollees > 0 ? (e.dropped_repeater / e.total_enrollees) * 100 : 0
    );

    if (rates[2] > rates[1] && rates[1] > rates[0] && rates[2] > 3) {
      recs.push({
        id: 'dropout_trend',
        type: 'danger',
        category: 'Retention',
        grade: 'ALL',
        title: 'Dropout Rate is Trending Upward',
        message: `The dropout rate has been increasing over the last 3 years: ${rates.map(r => r.toFixed(1) + '%').join(' → ')}. Immediate intervention is recommended.`,
        action: 'Urgent Review',
        data: { rates: rates.map(r => parseFloat(r.toFixed(1))) },
        analysis: buildAnalysis({
          descriptive: `The school's dropout/repeater rate has increased for three consecutive years: ${rates.map((r, i) => `${recent3[i].school_year}: ${r.toFixed(1)}%`).join(', ')}. This is a sustained, multi-year worsening trend.`,
          diagnostic: `A multi-year upward trend rules out one-time anomalies and points to systemic issues — potentially worsening household poverty in the community, deteriorating instructional quality, or inadequate student support mechanisms that have gone unaddressed.`,
          prescriptive: `This requires an urgent school improvement plan. Convene the School Governing Council to review root causes. Prioritize hiring or training guidance counselors, activate community-school partnerships, and submit a formal retention intervention plan to the division office.`,
          predictive: `If the annual increase of ~${(rates[2] - rates[0]).toFixed(1)}% continues, the rate could reach ${(rates[2] + (rates[2] - rates[1])).toFixed(1)}% next year — a level that typically triggers formal DepEd intervention and audit.`,
        }),
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
    const male   = latestEnrollment[`${g.key}_m`] || 0;
    const total  = female + male;

    if (total === 0) return;

    const femalePercent = (female / total) * 100;
    const malePercent   = (male   / total) * 100;

    if (femalePercent < 35 || malePercent < 35) {
      const minority   = femalePercent < malePercent ? 'Female' : 'Male';
      const minPercent = Math.min(femalePercent, malePercent);
      recs.push({
        id: `gender_${g.key}`,
        type: 'info',
        category: 'Demographics',
        grade: g.label,
        title: `Gender Imbalance in ${g.label}`,
        message: `${minority} students represent only ${minPercent.toFixed(1)}% of enrollment in ${g.label} (${female}F / ${male}M). This may warrant attention for inclusivity programs.`,
        action: 'Monitoring',
        data: {
          female,
          male,
          total,
          femalePercent: parseFloat(femalePercent.toFixed(1)),
          malePercent:   parseFloat(malePercent.toFixed(1)),
        },
        analysis: buildAnalysis({
          descriptive: `In ${g.label}, ${female} female and ${male} male students are currently enrolled. ${minority} students make up only ${minPercent.toFixed(1)}% of the grade — below the 35% equity threshold.`,
          diagnostic: `Gender imbalances at the elementary level may reflect cultural preferences directing one gender toward alternative schools or early work, geographic barriers affecting one gender's attendance more than the other, or historical patterns in barangay enrollment.`,
          prescriptive: `Review enrollment data by barangay of origin to detect geographic patterns. Strengthen outreach and scholarship awareness targeting the underrepresented gender. Partner with barangay health and social services to remove access barriers.`,
          predictive: `If uncorrected, the imbalance may entrench over time as community norms reinforce unequal enrollment patterns. Monitoring for two consecutive declining years should trigger a formal equity report to the school division.`,
        }),
      });
    }
  });

  return recs;
};

// ==========================================
// MODULE E: Teacher Load & Seat Utilization
// ==========================================
/**
 * This module mirrors the logic in analyticsController so that insights
 * always reflect the same numbers shown on the Analytics dashboard.
 *
 * teacherCount  = total classrooms  (1 teacher per room, per requirement)
 * seatCapacity  = teacherCount × SEATS_PER_ROOM
 * utilization % = (totalEnrollees / seatCapacity) × 100
 * studentTeacherRatio = totalEnrollees / teacherCount
 */
const analyzeTeacherLoad = (latestEnrollment, classrooms) => {
  const recs = [];

  const totalEnrollees = latestEnrollment.total_enrollees || 0;
  const teacherCount   = classrooms.reduce((acc, c) => acc + (c.num_classrooms || 0), 0);
  const seatCapacity   = teacherCount * SEATS_PER_ROOM;

  if (teacherCount === 0) {
    if (totalEnrollees > 0) {
      recs.push({
        id: 'teacher_no_data',
        type: 'danger',
        category: 'Staffing',
        grade: 'ALL',
        title: 'No Classrooms / Teachers on Record',
        message: `There are ${totalEnrollees} enrolled students but no classroom records exist. Teacher load and seat utilization cannot be calculated.`,
        action: 'Immediate Data Entry Required',
        data: { totalEnrollees, teacherCount: 0, seatCapacity: 0 },
        analysis: buildAnalysis({
          descriptive: `The system recorded ${totalEnrollees} students for the current school year but holds zero classroom entries, making teacher-load and seat-utilization calculations impossible.`,
          diagnostic: `This is almost certainly a data entry gap — classrooms exist physically but have not been entered into the system, or were accidentally deleted.`,
          prescriptive: `Enter all classroom records immediately so that teacher load and seat utilization can be computed. Without this, analytics and recommendation modules will produce incomplete results.`,
          predictive: `Every day without classroom data delays actionable insights. Correcting the records will immediately unlock teacher load scores, seat utilization trends, and staffing recommendations.`,
        }),
      });
    }
    return recs;
  }

  // ── Teacher-load analysis ────────────────────────────────────────────────
  const studentTeacherRatio = totalEnrollees / teacherCount;

  if (studentTeacherRatio > TEACHER_HIGH) {
    recs.push({
      id: 'teacher_overload',
      type: 'danger',
      category: 'Staffing',
      grade: 'ALL',
      title: 'Critical Teacher Overload',
      message: `Each teacher is responsible for an average of ${studentTeacherRatio.toFixed(1)} students — above the ${TEACHER_HIGH}-student danger threshold.`,
      action: 'Urgent Staffing Action',
      data: {
        studentTeacherRatio: parseFloat(studentTeacherRatio.toFixed(1)),
        totalEnrollees,
        teacherCount,
      },
      analysis: buildAnalysis({
        descriptive: `With ${totalEnrollees} students and ${teacherCount} teacher(s), the school averages ${studentTeacherRatio.toFixed(1)} students per teacher — exceeding the ${TEACHER_HIGH}-student danger threshold.`,
        diagnostic: `Teacher overload at this level typically results from rapid enrollment growth without a corresponding increase in hiring, prolonged unfilled vacancies, or budget constraints preventing new appointments.`,
        prescriptive: `Submit an emergency staffing request to the division office. In the interim, explore volunteer teaching aides, re-assign underloaded teachers across grade levels, and consider split-session scheduling to reduce simultaneous class sizes.`,
        predictive: `Sustained overload correlates with higher teacher burnout rates and declining instructional quality. If unaddressed, academic outcomes for ${latestEnrollment.school_year} are at significant risk, and teacher attrition may worsen the problem in the following year.`,
      }),
    });
  } else if (studentTeacherRatio > TEACHER_WARN) {
    recs.push({
      id: 'teacher_warning',
      type: 'warning',
      category: 'Staffing',
      grade: 'ALL',
      title: 'Teacher Load Approaching Limit',
      message: `Each teacher handles an average of ${studentTeacherRatio.toFixed(1)} students — approaching the ${TEACHER_HIGH}-student danger threshold.`,
      action: 'Monitor Staffing',
      data: {
        studentTeacherRatio: parseFloat(studentTeacherRatio.toFixed(1)),
        totalEnrollees,
        teacherCount,
      },
      analysis: buildAnalysis({
        descriptive: `The school's student-to-teacher ratio is ${studentTeacherRatio.toFixed(1)}, slightly below the ${TEACHER_HIGH}-student danger level but above the ${TEACHER_WARN}-student caution marker.`,
        diagnostic: `The load is climbing toward critical levels, likely driven by moderate enrollment growth or the loss of one teacher position without replacement.`,
        prescriptive: `Begin recruitment or deployment planning now so a new teacher can be onboarded before the next enrollment surge. Audit teacher workloads by grade to identify where redistribution could provide immediate relief.`,
        predictive: `Even modest enrollment growth (5–10%) next year could push the ratio past ${TEACHER_HIGH}, triggering the danger threshold. Acting proactively now is significantly less disruptive than emergency hiring later.`,
      }),
    });
  }

  // ── Seat utilization analysis ────────────────────────────────────────────
  const utilization = (totalEnrollees / seatCapacity) * 100;

  if (utilization > UTIL_HIGH) {
    recs.push({
      id: 'seats_overcrowded',
      type: 'danger',
      category: 'Capacity',
      grade: 'ALL',
      title: 'School at Seat Capacity — Overcrowded',
      message: `Seat utilization is ${utilization.toFixed(1)}% (${totalEnrollees} students / ${seatCapacity} seats). The school is operating beyond safe capacity.`,
      action: 'Immediate Infrastructure Action',
      data: {
        utilization:  parseFloat(utilization.toFixed(1)),
        totalEnrollees,
        seatCapacity,
        teacherCount,
      },
      analysis: buildAnalysis({
        descriptive: `Total enrollment of ${totalEnrollees} against a seat capacity of ${seatCapacity} (${teacherCount} rooms × ${SEATS_PER_ROOM} seats) yields a utilization rate of ${utilization.toFixed(1)}% — above the ${UTIL_HIGH}% safe threshold.`,
        diagnostic: `Over-capacity situations arise from enrollment growth that outpaces infrastructure investment, delayed construction projects, or an unexpected influx of students from a neighboring school closure.`,
        prescriptive: `Request emergency room allocation or modular classrooms from the division. Evaluate shift-based scheduling (morning/afternoon) to effectively double capacity within existing structures. Freeze further enrollment increases until space is resolved.`,
        predictive: `Operating above ${UTIL_HIGH}% capacity will likely result in DepEd compliance findings during the next BEIS audit. Physical overcrowding is also correlated with higher student illness rates and lower academic performance metrics.`,
      }),
    });
  } else if (utilization > UTIL_WARN) {
    recs.push({
      id: 'seats_warning',
      type: 'warning',
      category: 'Capacity',
      grade: 'ALL',
      title: 'Seat Utilization Approaching Capacity',
      message: `Seat utilization is ${utilization.toFixed(1)}% (${totalEnrollees}/${seatCapacity} seats). Plan for additional space before the next school year.`,
      action: 'Capacity Planning',
      data: {
        utilization:  parseFloat(utilization.toFixed(1)),
        totalEnrollees,
        seatCapacity,
        teacherCount,
      },
      analysis: buildAnalysis({
        descriptive: `The school is currently using ${utilization.toFixed(1)}% of its ${seatCapacity}-seat capacity across ${teacherCount} classroom(s). This is above the ${UTIL_WARN}% planning trigger.`,
        diagnostic: `Approaching-capacity signals that current enrollment momentum will likely breach the ${UTIL_HIGH}% danger mark within one school year if growth continues even modestly.`,
        prescriptive: `Submit a capacity expansion proposal to the district now. Identify rooms that could be temporarily repurposed and evaluate whether multi-shift scheduling is feasible to extend capacity without new construction.`,
        predictive: `A continuation of current enrollment trends could push utilization to ${Math.min((utilization * 1.1).toFixed(1), 100)}%+ next year — crossing into danger territory. Early planning reduces both cost and disruption.`,
      }),
    });
  } else if (utilization < UTIL_LOW && totalEnrollees > 0) {
    recs.push({
      id: 'seats_underutilized',
      type: 'info',
      category: 'Capacity',
      grade: 'ALL',
      title: 'School Seats Significantly Underutilized',
      message: `Seat utilization is only ${utilization.toFixed(1)}% (${totalEnrollees}/${seatCapacity} seats). Consider repurposing unused space or investigating enrollment decline.`,
      action: 'Resource Review',
      data: {
        utilization:  parseFloat(utilization.toFixed(1)),
        totalEnrollees,
        seatCapacity,
        teacherCount,
      },
      analysis: buildAnalysis({
        descriptive: `Only ${utilization.toFixed(1)}% of the school's ${seatCapacity} available seats are filled, leaving approximately ${seatCapacity - totalEnrollees} seats empty across ${teacherCount} classroom(s).`,
        diagnostic: `Low utilization often reflects community depopulation, competition from nearby schools, a mismatch between grade offerings and local demographics, or historical over-investment in infrastructure relative to the catchment population.`,
        prescriptive: `Repurpose unused rooms for enrichment activities, a library, computer lab, or community education programs. Consider offering the space to the LGU for community use, which can build goodwill and attract families back. Review operational costs tied to maintaining underused rooms.`,
        predictive: `If enrollment continues to decline and no strategic use is found for empty rooms, the school may face budget pressure to reduce maintenance spending. A formal space utilization review submitted to the division within the year is advisable.`,
      }),
    });
  }

  return recs;
};

// ==========================================
// MAIN: Generate all recommendations
// ==========================================
const generateRecommendations = async () => {
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
  const classrooms  = classroomResult.rows;

  if (enrollments.length === 0 && classrooms.length === 0) {
    return [{
      id: 'no_data',
      type: 'info',
      category: 'System',
      grade: 'ALL',
      title: 'No Data Available',
      message: 'There are no enrollment or classroom records in the system. Please add data to generate recommendations.',
      action: 'Data Entry Required',
      data: {},
      analysis: buildAnalysis({
        descriptive: 'No enrollment or classroom records have been entered into the system yet.',
        diagnostic: 'The absence of data prevents any meaningful analysis. This is likely a new setup or data migration issue.',
        prescriptive: 'Begin by entering at least one school year of enrollment data and corresponding classroom allocations to enable automated analysis.',
        predictive: 'Once data is entered, the system will automatically generate insights across all four analysis dimensions for every grade level.',
      }),
    }];
  }

  const latestEnrollment = enrollments[enrollments.length - 1];
  const grades           = extractGradeKeys(latestEnrollment);

  const recommendations = [
    ...analyzeRatios(latestEnrollment, classrooms, grades),       // Module A
    ...analyzeTrends(enrollments, grades),                         // Module B
    ...analyzeDropouts(enrollments),                               // Module C
    ...analyzeGenderBalance(latestEnrollment, grades),             // Module D
    ...analyzeTeacherLoad(latestEnrollment, classrooms),           // Module E ← NEW
  ];

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'stable',
      type: 'success',
      category: 'System',
      grade: 'ALL',
      title: 'All Systems Stable',
      message: 'Student distribution, classroom utilization, teacher load, and seat capacity are all within optimal ranges.',
      action: 'Regular Monitoring',
      data: {},
      analysis: buildAnalysis({
        descriptive: 'All monitored metrics — classroom ratios, enrollment trends, dropout rates, gender balance, teacher load, and seat utilization — are currently within acceptable ranges.',
        diagnostic: 'Stable metrics suggest that current resource allocation, retention programs, and enrollment management practices are functioning effectively.',
        prescriptive: 'Maintain current monitoring cadence and document best practices. Use this stable period to proactively plan for potential shifts in the next 1–2 school years.',
        predictive: 'Continued stability is likely if community demographics and school policies remain unchanged. Begin scenario planning for moderate enrollment growth (±10%) as a precautionary measure.',
      }),
    });
  }

  return recommendations;
};

module.exports = { generateRecommendations };