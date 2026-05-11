// Mock data — replace with API calls when backend is ready
// src/data/enrollmentData.js

export const enrollmentByYear = [
    {
      schoolYear: '2021-2022',
      total: 342,
      male: 178,
      female: 164,
      byGrade: [
        { grade: 'Kinder',  total: 52, male: 27, female: 25 },
        { grade: 'Grade 1', total: 61, male: 32, female: 29 },
        { grade: 'Grade 2', total: 55, male: 29, female: 26 },
        { grade: 'Grade 3', total: 50, male: 25, female: 25 },
        { grade: 'Grade 4', total: 48, male: 24, female: 24 },
        { grade: 'Grade 5', total: 42, male: 22, female: 20 },
        { grade: 'Grade 6', total: 34, male: 19, female: 15 },
      ],
    },
    {
      schoolYear: '2022-2023',
      total: 358,
      male: 185,
      female: 173,
      byGrade: [
        { grade: 'Kinder',  total: 56, male: 29, female: 27 },
        { grade: 'Grade 1', total: 64, male: 33, female: 31 },
        { grade: 'Grade 2', total: 58, male: 30, female: 28 },
        { grade: 'Grade 3', total: 52, male: 27, female: 25 },
        { grade: 'Grade 4', total: 50, male: 26, female: 24 },
        { grade: 'Grade 5', total: 45, male: 23, female: 22 },
        { grade: 'Grade 6', total: 33, male: 17, female: 16 },
      ],
    },
    {
      schoolYear: '2023-2024',
      total: 371,
      male: 191,
      female: 180,
      byGrade: [
        { grade: 'Kinder',  total: 58, male: 30, female: 28 },
        { grade: 'Grade 1', total: 66, male: 34, female: 32 },
        { grade: 'Grade 2', total: 60, male: 31, female: 29 },
        { grade: 'Grade 3', total: 55, male: 28, female: 27 },
        { grade: 'Grade 4', total: 52, male: 27, female: 25 },
        { grade: 'Grade 5', total: 47, male: 24, female: 23 },
        { grade: 'Grade 6', total: 33, male: 17, female: 16 },
      ],
    },
    {
      schoolYear: '2024-2025',
      total: 389,
      male: 200,
      female: 189,
      byGrade: [
        { grade: 'Kinder',  total: 62, male: 32, female: 30 },
        { grade: 'Grade 1', total: 70, male: 36, female: 34 },
        { grade: 'Grade 2', total: 63, male: 33, female: 30 },
        { grade: 'Grade 3', total: 57, male: 29, female: 28 },
        { grade: 'Grade 4', total: 53, male: 27, female: 26 },
        { grade: 'Grade 5', total: 48, male: 25, female: 23 },
        { grade: 'Grade 6', total: 36, male: 18, female: 18 },
      ],
    },
    {
      schoolYear: '2025-2026',
      total: 401,
      male: 207,
      female: 194,
      byGrade: [
        { grade: 'Kinder',  total: 64, male: 33, female: 31 },
        { grade: 'Grade 1', total: 72, male: 37, female: 35 },
        { grade: 'Grade 2', total: 65, male: 34, female: 31 },
        { grade: 'Grade 3', total: 59, male: 30, female: 29 },
        { grade: 'Grade 4', total: 55, male: 28, female: 27 },
        { grade: 'Grade 5', total: 50, male: 26, female: 24 },
        { grade: 'Grade 6', total: 36, male: 19, female: 17 },
      ],
    },
  ]
  
  export const enrollmentTrendData = enrollmentByYear.map((d) => ({
    sy:     d.schoolYear.replace('20', "'").replace('-20', '-'+'\''),
    total:  d.total,
    male:   d.male,
    female: d.female,
  }))