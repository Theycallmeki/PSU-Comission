// Mock data — replace with API calls when backend is ready
// src/data/resourcesData.js

export const resourcesByYear = [
    {
      schoolYear: '2021-2022',
      students:   342,
      classrooms:   8,
      seats:       380,
      teachers:     9,
      ratio:       38,   // students per teacher
    },
    {
      schoolYear: '2022-2023',
      students:   358,
      classrooms:   8,
      seats:       380,
      teachers:     9,
      ratio:       40,
    },
    {
      schoolYear: '2023-2024',
      students:   371,
      classrooms:   9,
      seats:       405,
      teachers:    10,
      ratio:       37,
    },
    {
      schoolYear: '2024-2025',
      students:   389,
      classrooms:   9,
      seats:       405,
      teachers:    10,
      ratio:       39,
    },
    {
      schoolYear: '2025-2026',
      students:   401,
      classrooms:  10,
      seats:       450,
      teachers:    11,
      ratio:       36,
    },
  ]
  
  export const currentResources = resourcesByYear[resourcesByYear.length - 1]
  
  export const resourceTrendData = resourcesByYear.map((d) => ({
    sy:         d.schoolYear.replace('20', "'").replace('-20', "-'"),
    students:   d.students,
    seats:      d.seats,
    teachers:   d.teachers,
    ratio:      d.ratio,
    classrooms: d.classrooms,
  }))
  
  // DepEd standard: max 40 students per teacher for Grades 1-6, 25 for Kinder
  export const DEPED_RATIO_STANDARD = 40
  export const SEAT_UTILIZATION_THRESHOLD = 95 // % — above this is overcrowded