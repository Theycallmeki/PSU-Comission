const PDFDocument = require('pdfkit');
const Classroom  = require('../models/classroomModel');
const Enrollment = require('../models/enrollmentModel');

// ─── Palette ────────────────────────────────────────────────────────────────
const MAROON  = '#800000';
const DARK    = '#2c3e50';
const MUTED   = '#64748b';
const LIGHT   = '#f8fafc';
const BORDER  = '#e2e8f0';
const WHITE   = '#ffffff';
const SUCCESS = '#27ae60';
const DANGER  = '#e74c3c';

// ─── Helpers ────────────────────────────────────────────────────────────────
const numFmt = (n) => Number(n || 0).toLocaleString('en-PH');

/** Draw a filled rounded-ish rectangle (PDFKit has no native borderRadius, simulate with rect) */
const fillRect = (doc, x, y, w, h, color) => {
  doc.save().rect(x, y, w, h).fill(color).restore();
};

/** Draw a horizontal rule */
const hRule = (doc, y, color = BORDER) => {
  doc.save().moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(color).lineWidth(0.5).stroke().restore();
};

/** Section title */
const sectionTitle = (doc, text, y) => {
  doc.save()
    .rect(50, y, doc.page.width - 100, 22)
    .fill(MAROON);
  doc.fillColor(WHITE)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(text, 58, y + 6, { width: doc.page.width - 116 });
  doc.restore();
  return y + 28;
};

/**
 * Like sectionTitle but forces a new page first if there isn't enough room
 * for the header banner PLUS at least two data rows (≈28 + 18*2 = 64 px).
 */
const sectionBreak = (doc, text, y, minRowsBelow = 2) => {
  const rowH    = 18;
  const needed  = 28 + rowH * minRowsBelow; // header + N rows
  const margin  = 60; // bottom safe-zone
  if (y + needed > doc.page.height - margin) {
    doc.addPage();
    y = 60;
  }
  return sectionTitle(doc, text, y);
};

/** KPI card row — renders N cards in a row */
const kpiRow = (doc, cards, y) => {
  const margin = 50;
  const gap    = 8;
  const count  = cards.length;
  const totalW = doc.page.width - margin * 2;
  const cardW  = (totalW - gap * (count - 1)) / count;
  const cardH  = 52;

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + gap);
    // card background
    fillRect(doc, x, y, cardW, cardH, LIGHT);
    doc.save().rect(x, y, cardW, cardH).strokeColor(BORDER).lineWidth(0.5).stroke().restore();
    // left accent bar
    fillRect(doc, x, y, 4, cardH, MAROON);

    doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
      .text(card.label, x + 10, y + 8, { width: cardW - 14, ellipsis: true });
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(13)
      .text(card.value, x + 10, y + 20, { width: cardW - 14 });
    if (card.sub) {
      doc.fillColor(card.subColor || MUTED).font('Helvetica').fontSize(7)
        .text(card.sub, x + 10, y + 38, { width: cardW - 14, ellipsis: true });
    }
  });
  return y + cardH + 12;
};

/** Generic data table */
const dataTable = (doc, headers, rows, y, { colWidths, headerBg = MAROON } = {}) => {
  const margin  = 50;
  const totalW  = doc.page.width - margin * 2;
  const widths  = colWidths || headers.map(() => totalW / headers.length);
  const rowH    = 18;

  // Header row
  let x = margin;
  headers.forEach((h, i) => {
    fillRect(doc, x, y, widths[i], rowH, headerBg);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8)
      .text(h, x + 4, y + 5, { width: widths[i] - 8, ellipsis: true });
    x += widths[i];
  });
  y += rowH;

  // Data rows
  rows.forEach((row, ri) => {
    // check page overflow
    if (y + rowH > doc.page.height - 60) {
      doc.addPage();
      y = 60;
    }
    const bg = ri % 2 === 0 ? WHITE : LIGHT;
    x = margin;
    row.forEach((cell, ci) => {
      fillRect(doc, x, y, widths[ci], rowH, bg);
      doc.save().rect(x, y, widths[ci], rowH).strokeColor(BORDER).lineWidth(0.3).stroke().restore();
      doc.fillColor(DARK).font('Helvetica').fontSize(8)
        .text(String(cell ?? '—'), x + 4, y + 5, { width: widths[ci] - 8, ellipsis: true });
      x += widths[ci];
    });
    y += rowH;
  });

  return y + 10;
};

// ─── Main controller ─────────────────────────────────────────────────────────
const generateMetricsPDF = async (req, res) => {
  try {
    /* ── 1. Fetch data ───────────────────────────────────────────────── */
    const [classrooms, enrollments] = await Promise.all([
      Classroom.getAll(),
      Enrollment.getAll(),
    ]);

    const sortedEnrollments = [...enrollments].sort((a, b) =>
      a.school_year.localeCompare(b.school_year)
    );

    // ── Quick stats (same logic as analyticsController) ──
    const totalClassrooms = classrooms.reduce((acc, c) => acc + (c.num_classrooms || 0), 0);
    const teacherCount    = totalClassrooms;

    const statsHistory = sortedEnrollments.map(enrollment => {
      const totalEnrollees        = enrollment.total_enrollees || 0;
      const studentTeacherRatio   = teacherCount > 0
        ? parseFloat((totalEnrollees / teacherCount).toFixed(2)) : 0;
      const seatCount             = totalEnrollees;
      const utilization           = totalEnrollees > 0 ? 100 : 0;
      const utilizationRatio      = totalEnrollees > 0 ? '1:1' : '0:0';
      return {
        school_year: enrollment.school_year,
        total_enrollees: totalEnrollees,
        teacher_count: teacherCount,
        student_teacher_ratio: studentTeacherRatio,
        seat_count: seatCount,
        utilization,
        utilization_ratio: utilizationRatio,
      };
    });

    /* ── 2. Determine selected year ─────────────────────────────────── */
    const requestedYear = req.query.year;
    const latestYear    = sortedEnrollments.length
      ? sortedEnrollments[sortedEnrollments.length - 1].school_year : null;
    const selectedYear  = requestedYear || latestYear;

    const selectedEnrollment = sortedEnrollments.find(e => e.school_year === selectedYear)
      || sortedEnrollments[sortedEnrollments.length - 1]
      || null;

    const prevIdx        = sortedEnrollments.findIndex(e => e.school_year === selectedYear);
    const prevEnrollment = prevIdx > 0 ? sortedEnrollments[prevIdx - 1] : null;

    const selectedStats = statsHistory.find(r => r.school_year === selectedYear)
      || statsHistory[statsHistory.length - 1]
      || null;

    /* ── 3. Derived values ──────────────────────────────────────────── */
    const totalCurrent  = Number(selectedEnrollment?.total_enrollees || 0);
    const totalPrev     = prevEnrollment ? Number(prevEnrollment.total_enrollees) : totalCurrent;
    const growth        = totalPrev > 0
      ? parseFloat((((totalCurrent - totalPrev) / totalPrev) * 100).toFixed(1)) : 0;

    const GRADES = ['kinder', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'];
    let maleTotal = 0, femaleTotal = 0;
    GRADES.forEach(g => {
      maleTotal   += Number(selectedEnrollment?.[`${g}_m`]  || 0);
      femaleTotal += Number(selectedEnrollment?.[`${g}_f`]  || 0);
    });

    const gradeRows = [
      ['Kinder', selectedEnrollment?.kinder_m||0, selectedEnrollment?.kinder_f||0, selectedEnrollment?.kinder_total||0],
      ['Grade 1', selectedEnrollment?.grade1_m||0, selectedEnrollment?.grade1_f||0, selectedEnrollment?.grade1_total||0],
      ['Grade 2', selectedEnrollment?.grade2_m||0, selectedEnrollment?.grade2_f||0, selectedEnrollment?.grade2_total||0],
      ['Grade 3', selectedEnrollment?.grade3_m||0, selectedEnrollment?.grade3_f||0, selectedEnrollment?.grade3_total||0],
      ['Grade 4', selectedEnrollment?.grade4_m||0, selectedEnrollment?.grade4_f||0, selectedEnrollment?.grade4_total||0],
      ['Grade 5', selectedEnrollment?.grade5_m||0, selectedEnrollment?.grade5_f||0, selectedEnrollment?.grade5_total||0],
      ['Grade 6', selectedEnrollment?.grade6_m||0, selectedEnrollment?.grade6_f||0, selectedEnrollment?.grade6_total||0],
    ].map(r => [r[0], numFmt(r[1]), numFmt(r[2]), numFmt(r[3])]);

    const classroomRows = classrooms.map(c => [
      c.grade_level, numFmt(c.num_classrooms),
    ]);

    const trendRows = sortedEnrollments
      .filter(e => e.school_year <= selectedYear)
      .map(e => [
        e.school_year,
        numFmt(e.total_enrollees),
        numFmt(e.dropped_repeater || 0),
      ]);

    const ratioRows = statsHistory
      .filter(r => r.school_year <= selectedYear)
      .map(r => [
        r.school_year,
        numFmt(r.teacher_count),
        numFmt(r.seat_count),
        numFmt(r.total_enrollees),
        `${r.student_teacher_ratio}:1`,
        `${r.utilization}%`,
        r.utilization_ratio,
      ]);

    /* ── 4. Build PDF ───────────────────────────────────────────────── */
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      compress: true,
      bufferPages: true,   // required for switchToPage()
    });

    // Stream to response
    const type = req.query.type || 'metrics';
    let docTitle = 'PSU Metrics Insights';
    let docSubtitle = 'Comprehensive Analytical Overview';
    let filename = `PSU_Metrics_${selectedYear || 'report'}.pdf`;

    if (type === 'classrooms') {
      docTitle = 'PSU Classroom Details';
      docSubtitle = 'Classroom Allocation & Grade Level Infrastructure';
      filename = `PSU_Classrooms_${selectedYear || 'report'}.pdf`;
    } else if (type === 'enrollments') {
      docTitle = 'PSU Enrollment Details';
      docSubtitle = 'Student Enrollment & Gender Breakdown Analysis';
      filename = `PSU_Enrollments_${selectedYear || 'report'}.pdf`;
    } else if (type === 'teachers-seats') {
      docTitle = 'PSU Teachers & Seats Details';
      docSubtitle = 'Teacher Allocations & Seat Utilization History';
      filename = `PSU_TeachersSeats_${selectedYear || 'report'}.pdf`;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    doc.pipe(res);

    /* ── Cover / header banner ─────────────────────────────────────── */
    fillRect(doc, 0, 0, doc.page.width, 90, MAROON);

    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(20)
      .text(docTitle, 50, 22, { align: 'left' });
    doc.fillColor('rgba(255,255,255,0.75)').font('Helvetica').fontSize(10)
      .text(`${docSubtitle}  •  SY ${selectedYear || 'N/A'}`, 50, 48);

    // Print date stamp
    const printedOn = new Date().toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.fillColor('rgba(255,255,255,0.6)').font('Helvetica').fontSize(8)
      .text(`Generated: ${printedOn}`, 50, 66, { align: 'right', width: doc.page.width - 100 });

    let y = 108;

    /* ── SECTION 1: Enrollment KPIs ────────────────────────────────── */
    if (type === 'metrics' || type === 'enrollments') {
      y = sectionBreak(doc, 'ENROLLMENT OVERVIEW', y, 4);
      y = kpiRow(doc, [
        {
          label: 'Total Enrollment',
          value: numFmt(totalCurrent),
          sub: `${growth >= 0 ? '(+)' : '(-)'} ${Math.abs(growth)}% from last year`,
          subColor: growth >= 0 ? SUCCESS : DANGER,
        },
        {
          label: 'Dropped / Repeaters',
          value: numFmt(selectedEnrollment?.dropped_repeater || 0),
          sub: `SY ${selectedYear}`,
        },
        {
          label: 'Total Classrooms',
          value: numFmt(totalClassrooms),
          sub: 'Across all grade levels',
        },
      ], y);
    }

    /* ── SECTION 1B: Classroom KPIs (only for classrooms) ─────────── */
    if (type === 'classrooms') {
      const avgClassrooms = classrooms.length ? (totalClassrooms / classrooms.length).toFixed(1) : '0';
      y = sectionBreak(doc, 'CLASSROOM OVERVIEW', y, 4);
      y = kpiRow(doc, [
        {
          label: 'Total Grade Levels',
          value: numFmt(classrooms.length),
          sub: 'Registered grade groups',
        },
        {
          label: 'Total Classrooms',
          value: numFmt(totalClassrooms),
          sub: 'Across all grade levels',
        },
        {
          label: 'Avg per Level',
          value: avgClassrooms,
          sub: 'Classrooms per grade',
        },
      ], y);
    }

    /* ── SECTION 2: Teachers & Seats KPIs ─────────────────────────── */
    if (type === 'metrics' || type === 'teachers-seats') {
      y = sectionBreak(doc, `TEACHERS & SEATS - SY ${selectedYear}`, y, 4);
      y = kpiRow(doc, [
        {
          label: 'Teachers',
          value: selectedStats ? numFmt(selectedStats.teacher_count) : '—',
          sub: '= No. of classrooms',
        },
        {
          label: 'Seat Count',
          value: selectedStats ? numFmt(selectedStats.seat_count) : '—',
          sub: '= Total enrollees',
        },
        {
          label: 'Student : Teacher Ratio',
          value: selectedStats ? `${selectedStats.student_teacher_ratio}:1` : '—',
          sub: 'Per classroom',
        },
        {
          label: 'Seat Utilization',
          value: selectedStats ? `${selectedStats.utilization}%` : '—',
          sub: `Ratio: ${selectedStats?.utilization_ratio ?? '—'}`,
        },
      ], y);
    }

    /* ── SECTION 3: Enrollment Trend Table ─────────────────────────── */
    if (type === 'metrics' || type === 'enrollments') {
      y = sectionBreak(doc, 'ENROLLMENT & DROPOUT TRENDS', y);
      y = dataTable(
        doc,
        ['School Year', 'Total Enrollees', 'Dropped / Repeaters'],
        trendRows,
        y,
        { colWidths: [170, 170, 170] }
      );
    }

    /* ── SECTION 4: Gender Distribution ───────────────────────────── */
    if (type === 'metrics' || type === 'enrollments') {
      y = sectionBreak(doc, `GENDER DISTRIBUTION - SY ${selectedYear}`, y);
      y = dataTable(
        doc,
        ['Category', 'Count', '% of Total'],
        [
          ['Male',   numFmt(maleTotal),   `${totalCurrent > 0 ? ((maleTotal / totalCurrent) * 100).toFixed(1) : 0}%`],
          ['Female', numFmt(femaleTotal), `${totalCurrent > 0 ? ((femaleTotal / totalCurrent) * 100).toFixed(1) : 0}%`],
          ['Total',  numFmt(totalCurrent), '100%'],
        ],
        y,
        { colWidths: [170, 170, 170] }
      );
    }

    /* ── SECTION 5: Grade-Level Breakdown ─────────────────────────── */
    if (type === 'metrics' || type === 'enrollments') {
      y = sectionBreak(doc, `ENROLLMENT BY GRADE LEVEL - SY ${selectedYear}`, y);
      y = dataTable(
        doc,
        ['Grade Level', 'Male', 'Female', 'Total'],
        gradeRows,
        y,
        { colWidths: [127, 127, 127, 129] }
      );
    }

    /* ── SECTION 6: Classrooms per Grade ──────────────────────────── */
    if (type === 'metrics' || type === 'classrooms') {
      y = sectionBreak(doc, 'CLASSROOMS PER GRADE LEVEL', y);
      y = dataTable(
        doc,
        ['Grade Level', 'No. of Classrooms'],
        classroomRows,
        y,
        { colWidths: [255, 255] }
      );
    }

    /* ── SECTION 7: Teachers, Seats & Ratios History ─────────────── */
    if (type === 'metrics' || type === 'teachers-seats') {
      y = sectionBreak(doc, 'TEACHERS, SEATS & RATIO HISTORY', y);
      y = dataTable(
        doc,
        ['School Year', 'Teachers', 'Seat Count', 'Total Enrollees', 'Student:Teacher', 'Utilization', 'Ratio'],
        ratioRows,
        y,
        { colWidths: [76, 62, 66, 80, 80, 62, 84] }
      );
    }

    /* ── Footer on every page ──────────────────────────────────────── */
    const range = doc.bufferedPageRange(); // { start: 0, count: N }
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      hRule(doc, doc.page.height - 45);
      doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
        .text(
          `PSU School Analytics  |  SY ${selectedYear}  |  Page ${i + 1} of ${range.count}`,
          50,
          doc.page.height - 38,
          { align: 'center', width: doc.page.width - 100 }
        );
    }

    doc.flushPages(); // flush all buffered pages to the stream
    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, msg: 'Failed to generate PDF', error: err.message });
    }
  }
};


// ─── Charts + Tables PDF ─────────────────────────────────────────────────────
/**
 * POST /api/pdf/metrics-charts
 * Body: { year: string, charts: [ { label: string, dataUrl: string } ] }
 *
 * Generates a PDF that includes:
 *   - the same KPI cards & data tables as generateMetricsPDF
 *   - embedded chart images captured by the frontend via html2canvas
 */
const generateMetricsChartsPDF = async (req, res) => {
  try {
    const { year: requestedYear, charts = [], type = 'metrics' } = req.body;

    /* ── 1. Fetch data (same as generateMetricsPDF) ─────────────────── */
    const [classrooms, enrollments] = await Promise.all([
      Classroom.getAll(),
      Enrollment.getAll(),
    ]);

    const sortedEnrollments = [...enrollments].sort((a, b) =>
      a.school_year.localeCompare(b.school_year)
    );

    const totalClassrooms = classrooms.reduce((acc, c) => acc + (c.num_classrooms || 0), 0);
    const teacherCount    = totalClassrooms;

    const statsHistory = sortedEnrollments.map(enrollment => {
      const totalEnrollees      = enrollment.total_enrollees || 0;
      const studentTeacherRatio = teacherCount > 0
        ? parseFloat((totalEnrollees / teacherCount).toFixed(2)) : 0;
      return {
        school_year: enrollment.school_year,
        total_enrollees: totalEnrollees,
        teacher_count: teacherCount,
        student_teacher_ratio: studentTeacherRatio,
        seat_count: totalEnrollees,
        utilization: totalEnrollees > 0 ? 100 : 0,
        utilization_ratio: totalEnrollees > 0 ? '1:1' : '0:0',
      };
    });

    const latestYear   = sortedEnrollments.length
      ? sortedEnrollments[sortedEnrollments.length - 1].school_year : null;
    const selectedYear = requestedYear || latestYear;

    const selectedEnrollment = sortedEnrollments.find(e => e.school_year === selectedYear)
      || sortedEnrollments[sortedEnrollments.length - 1] || null;

    const prevIdx        = sortedEnrollments.findIndex(e => e.school_year === selectedYear);
    const prevEnrollment = prevIdx > 0 ? sortedEnrollments[prevIdx - 1] : null;
    const selectedStats  = statsHistory.find(r => r.school_year === selectedYear)
      || statsHistory[statsHistory.length - 1] || null;

    const totalCurrent = Number(selectedEnrollment?.total_enrollees || 0);
    const totalPrev    = prevEnrollment ? Number(prevEnrollment.total_enrollees) : totalCurrent;
    const growth       = totalPrev > 0
      ? parseFloat((((totalCurrent - totalPrev) / totalPrev) * 100).toFixed(1)) : 0;

    const GRADES = ['kinder', 'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6'];
    let maleTotal = 0, femaleTotal = 0;
    GRADES.forEach(g => {
      maleTotal   += Number(selectedEnrollment?.[`${g}_m`]  || 0);
      femaleTotal += Number(selectedEnrollment?.[`${g}_f`]  || 0);
    });

    const gradeRows = [
      ['Kinder', selectedEnrollment?.kinder_m||0, selectedEnrollment?.kinder_f||0, selectedEnrollment?.kinder_total||0],
      ['Grade 1', selectedEnrollment?.grade1_m||0, selectedEnrollment?.grade1_f||0, selectedEnrollment?.grade1_total||0],
      ['Grade 2', selectedEnrollment?.grade2_m||0, selectedEnrollment?.grade2_f||0, selectedEnrollment?.grade2_total||0],
      ['Grade 3', selectedEnrollment?.grade3_m||0, selectedEnrollment?.grade3_f||0, selectedEnrollment?.grade3_total||0],
      ['Grade 4', selectedEnrollment?.grade4_m||0, selectedEnrollment?.grade4_f||0, selectedEnrollment?.grade4_total||0],
      ['Grade 5', selectedEnrollment?.grade5_m||0, selectedEnrollment?.grade5_f||0, selectedEnrollment?.grade5_total||0],
      ['Grade 6', selectedEnrollment?.grade6_m||0, selectedEnrollment?.grade6_f||0, selectedEnrollment?.grade6_total||0],
    ].map(r => [r[0], numFmt(r[1]), numFmt(r[2]), numFmt(r[3])]);

    const classroomRows = classrooms.map(c => [c.grade_level, numFmt(c.num_classrooms)]);

    const trendRows = sortedEnrollments
      .filter(e => e.school_year <= selectedYear)
      .map(e => [e.school_year, numFmt(e.total_enrollees), numFmt(e.dropped_repeater || 0)]);

    const ratioRows = statsHistory
      .filter(r => r.school_year <= selectedYear)
      .map(r => [
        r.school_year, numFmt(r.teacher_count), numFmt(r.seat_count),
        numFmt(r.total_enrollees), `${r.student_teacher_ratio}:1`,
        `${r.utilization}%`, r.utilization_ratio,
      ]);

    /* ── 2. Build PDF ───────────────────────────────────────────────── */
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      compress: true,
      bufferPages: true,
    });

    let docTitle = 'PSU Metrics Insights';
    let docSubtitle = 'Comprehensive Analytical Overview';
    let filename = `PSU_Metrics_Charts_${selectedYear || 'report'}.pdf`;

    if (type === 'classrooms') {
      docTitle = 'PSU Classroom Details';
      docSubtitle = 'Classroom Allocation & Grade Level Infrastructure';
      filename = `PSU_Classrooms_Charts_${selectedYear || 'report'}.pdf`;
    } else if (type === 'enrollments') {
      docTitle = 'PSU Enrollment Details';
      docSubtitle = 'Student Enrollment & Gender Breakdown Analysis';
      filename = `PSU_Enrollments_Charts_${selectedYear || 'report'}.pdf`;
    } else if (type === 'teachers-seats') {
      docTitle = 'PSU Teachers & Seats Details';
      docSubtitle = 'Teacher Allocations & Seat Utilization History';
      filename = `PSU_TeachersSeats_Charts_${selectedYear || 'report'}.pdf`;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );
    doc.pipe(res);

    /* ── Header banner ─────────────────────────────────────────────── */
    fillRect(doc, 0, 0, doc.page.width, 90, MAROON);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(20)
      .text(docTitle, 50, 22);
    doc.fillColor(WHITE).font('Helvetica').fontSize(10)
      .text(`${docSubtitle}  |  SY ${selectedYear || 'N/A'}`, 50, 48);
    const printedOn = new Date().toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.fillColor(WHITE).font('Helvetica').fontSize(8)
      .text(`Generated: ${printedOn}`, 50, 66, { align: 'right', width: doc.page.width - 100 });

    let y = 108;

    /* ── KPI sections ──────────────────────────────────────────────── */
    if (type === 'metrics' || type === 'enrollments') {
      y = sectionBreak(doc, 'ENROLLMENT OVERVIEW', y, 4);
      y = kpiRow(doc, [
        { label: 'Total Enrollment', value: numFmt(totalCurrent),
          sub: `${growth >= 0 ? '(+)' : '(-)'} ${Math.abs(growth)}% from last year`,
          subColor: growth >= 0 ? SUCCESS : DANGER },
        { label: 'Dropped / Repeaters', value: numFmt(selectedEnrollment?.dropped_repeater || 0), sub: `SY ${selectedYear}` },
        { label: 'Total Classrooms', value: numFmt(totalClassrooms), sub: 'Across all grade levels' },
      ], y);
    }

    if (type === 'classrooms') {
      const avgClassrooms = classrooms.length ? (totalClassrooms / classrooms.length).toFixed(1) : '0';
      y = sectionBreak(doc, 'CLASSROOM OVERVIEW', y, 4);
      y = kpiRow(doc, [
        { label: 'Total Grade Levels', value: numFmt(classrooms.length), sub: 'Registered grade groups' },
        { label: 'Total Classrooms', value: numFmt(totalClassrooms), sub: 'Across all grade levels' },
        { label: 'Avg per Level', value: avgClassrooms, sub: 'Classrooms per grade' },
      ], y);
    }

    if (type === 'metrics' || type === 'teachers-seats') {
      y = sectionBreak(doc, `TEACHERS & SEATS - SY ${selectedYear}`, y, 4);
      y = kpiRow(doc, [
        { label: 'Teachers', value: selectedStats ? numFmt(selectedStats.teacher_count) : '-', sub: '= No. of classrooms' },
        { label: 'Seat Count', value: selectedStats ? numFmt(selectedStats.seat_count) : '-', sub: '= Total enrollees' },
        { label: 'Student : Teacher Ratio', value: selectedStats ? `${selectedStats.student_teacher_ratio}:1` : '-', sub: 'Per classroom' },
        { label: 'Seat Utilization', value: selectedStats ? `${selectedStats.utilization}%` : '-', sub: `Ratio: ${selectedStats?.utilization_ratio ?? '-'}` },
      ], y);
    }

    /* ── Helper: embed a chart image ───────────────────────────────── */
    const embedChart = (label, dataUrl, currentY) => {
      const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
      const imgBuf = Buffer.from(base64, 'base64');

      const imgW   = doc.page.width - 100;
      const imgH   = 220;
      const needed = 28 + imgH + 12;

      if (currentY + needed > doc.page.height - 60) {
        doc.addPage();
        currentY = 60;
      }

      fillRect(doc, 50, currentY, imgW, 20, '#f1f5f9');
      doc.save().rect(50, currentY, imgW, 20).strokeColor(BORDER).lineWidth(0.4).stroke().restore();
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8.5)
        .text(label, 58, currentY + 6, { width: imgW - 16 });
      currentY += 24;

      doc.image(imgBuf, 50, currentY, { width: imgW, height: imgH });
      currentY += imgH + 12;

      return currentY;
    };

    /* ── CHART IMAGES SECTION ──────────────────────────────────────── */
    if (charts.length > 0) {
      y = sectionBreak(doc, 'CHARTS & VISUALIZATIONS', y, 4);
      for (const chart of charts) {
        try {
          y = embedChart(chart.label, chart.dataUrl, y);
        } catch (imgErr) {
          console.warn(`Skipping chart "${chart.label}":`, imgErr.message);
        }
      }
    }

    /* ── DATA TABLES ───────────────────────────────────────────────── */
    if (type === 'metrics' || type === 'enrollments') {
      y = sectionBreak(doc, 'ENROLLMENT & DROPOUT TRENDS', y);
      y = dataTable(doc, ['School Year', 'Total Enrollees', 'Dropped / Repeaters'], trendRows, y,
        { colWidths: [170, 170, 170] });

      y = sectionBreak(doc, `GENDER DISTRIBUTION - SY ${selectedYear}`, y);
      y = dataTable(doc, ['Category', 'Count', '% of Total'], [
        ['Male',   numFmt(maleTotal),   `${totalCurrent > 0 ? ((maleTotal / totalCurrent) * 100).toFixed(1) : 0}%`],
        ['Female', numFmt(femaleTotal), `${totalCurrent > 0 ? ((femaleTotal / totalCurrent) * 100).toFixed(1) : 0}%`],
        ['Total',  numFmt(totalCurrent), '100%'],
      ], y, { colWidths: [170, 170, 170] });

      y = sectionBreak(doc, `ENROLLMENT BY GRADE LEVEL - SY ${selectedYear}`, y);
      y = dataTable(doc, ['Grade Level', 'Male', 'Female', 'Total'], gradeRows, y,
        { colWidths: [127, 127, 127, 129] });
    }

    if (type === 'metrics' || type === 'classrooms') {
      y = sectionBreak(doc, 'CLASSROOMS PER GRADE LEVEL', y);
      y = dataTable(doc, ['Grade Level', 'No. of Classrooms'], classroomRows, y,
        { colWidths: [255, 255] });
    }

    if (type === 'metrics' || type === 'teachers-seats') {
      y = sectionBreak(doc, 'TEACHERS, SEATS & RATIO HISTORY', y);
      y = dataTable(doc,
        ['School Year', 'Teachers', 'Seat Count', 'Total Enrollees', 'Student:Teacher', 'Utilization', 'Ratio'],
        ratioRows, y, { colWidths: [76, 62, 66, 80, 80, 62, 84] });
    }

    /* ── Footer on every page ──────────────────────────────────────── */
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      hRule(doc, doc.page.height - 45);
      doc.fillColor(MUTED).font('Helvetica').fontSize(7.5)
        .text(
          `PSU School Analytics  |  SY ${selectedYear}  |  Page ${i + 1} of ${range.count}`,
          50, doc.page.height - 38,
          { align: 'center', width: doc.page.width - 100 }
        );
    }

    doc.flushPages();
    doc.end();
  } catch (err) {
    console.error('Charts PDF generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, msg: 'Failed to generate charts PDF', error: err.message });
    }
  }
};

module.exports = { generateMetricsPDF, generateMetricsChartsPDF };
