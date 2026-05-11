// src/utils/calculations.js

/**
 * Compute overall enrollment growth from first to last year
 */
export function totalGrowth(data) {
    if (!data || data.length < 2) return null
    const first = data[0].total
    const last  = data[data.length - 1].total
    return {
      absolute: last - first,
      percent: parseFloat((((last - first) / first) * 100).toFixed(1)),
    }
  }
  
  /**
   * YoY change between last two years
   */
  export function yoyChange(data) {
    if (!data || data.length < 2) return null
    const prev = data[data.length - 2].total
    const curr = data[data.length - 1].total
    return {
      absolute: curr - prev,
      percent: parseFloat((((curr - prev) / prev) * 100).toFixed(1)),
    }
  }
  
  /**
   * Seat utilization percentage
   */
  export function seatUtilization(students, seats) {
    if (!seats) return null
    return parseFloat(((students / seats) * 100).toFixed(1))
  }
  
  /**
   * Dropout rate as percentage of enrolled
   */
  export function dropoutRate(dropouts, enrolled) {
    if (!enrolled) return null
    return parseFloat(((dropouts / enrolled) * 100).toFixed(2))
  }
  
  /**
   * Repeater rate as percentage of enrolled
   */
  export function repeaterRate(repeaters, enrolled) {
    if (!enrolled) return null
    return parseFloat(((repeaters / enrolled) * 100).toFixed(2))
  }
  
  /**
   * Promotion / retention rate
   */
  export function retentionRate(promoted, enrolled) {
    if (!promoted || !enrolled) return null
    return parseFloat(((promoted / enrolled) * 100).toFixed(1))
  }
  
  /**
   * Gender ratio percentage (female share)
   */
  export function femaleShare(female, total) {
    if (!total) return null
    return parseFloat(((female / total) * 100).toFixed(1))
  }