// Mock data — replace with API calls when backend is ready
// src/data/performanceData.js

export const performanceByYear = [
    {
      schoolYear: '2021-2022',
      enrolled:  342,
      promoted:  318,
      repeaters: 14,
      dropouts:  10,
      graduated: 34,
    },
    {
      schoolYear: '2022-2023',
      enrolled:  358,
      promoted:  336,
      repeaters: 12,
      dropouts:  10,
      graduated: 33,
    },
    {
      schoolYear: '2023-2024',
      enrolled:  371,
      promoted:  351,
      repeaters: 11,
      dropouts:   9,
      graduated: 33,
    },
    {
      schoolYear: '2024-2025',
      enrolled:  389,
      promoted:  370,
      repeaters:  9,
      dropouts:  10,
      graduated: 36,
    },
    {
      schoolYear: '2025-2026',
      enrolled:  401,
      promoted:  null, // current year — not yet complete
      repeaters:  8,
      dropouts:   5,
      graduated: null,
    },
  ]
  
  export const performanceTrendData = performanceByYear.map((d) => ({
    sy:        d.schoolYear.replace('20', "'").replace('-20', "-'"),
    repeaters: d.repeaters,
    dropouts:  d.dropouts,
    promoted:  d.promoted,
  }))
  
  export const retentionRateByYear = performanceByYear.map((d) => ({
    sy:   d.schoolYear.replace('20', "'").replace('-20', "-'"),
    rate: d.promoted !== null
      ? parseFloat(((d.promoted / d.enrolled) * 100).toFixed(1))
      : null,
  }))