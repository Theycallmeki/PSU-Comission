// src/utils/formatters.js

/**
 * Format a number with commas (e.g. 1000 → "1,000")
 */
export function formatNumber(n) {
    if (n === null || n === undefined) return '—'
    return n.toLocaleString()
  }
  
  /**
   * Format a percentage (e.g. 97.2 → "97.2%")
   */
  export function formatPercent(n, decimals = 1) {
    if (n === null || n === undefined) return '—'
    return `${parseFloat(n).toFixed(decimals)}%`
  }
  
  /**
   * Format a school year for display (e.g. "2025-2026" → "SY 2025–2026")
   */
  export function formatSY(sy) {
    return `SY ${sy.replace('-', '–')}`
  }
  
  /**
   * Short school year label (e.g. "2025-2026" → "'25–'26")
   */
  export function shortSY(sy) {
    const [start, end] = sy.split('-')
    return `'${start.slice(2)}–'${end.slice(2)}`
  }
  
  /**
   * Calculate growth rate between two numbers
   */
  export function growthRate(current, previous) {
    if (!previous) return null
    return parseFloat((((current - previous) / previous) * 100).toFixed(1))
  }
  
  /**
   * Returns "up", "down", or "neutral" for a delta value
   */
  export function trendDirection(delta) {
    if (delta > 0) return 'up'
    if (delta < 0) return 'down'
    return 'neutral'
  }
  
  /**
   * Format ratio as "X : 1"
   */
  export function formatRatio(students, teachers) {
    if (!teachers) return '—'
    return `${Math.round(students / teachers)} : 1`
  }