// src/api/enrollmentApi.js
// ─────────────────────────────────────────────────────────────
// All enrollment-related API calls live here.
// Currently returns mock data. When the backend is ready:
//   1. Set VITE_API_BASE_URL in your .env file
//   2. Replace each function body with a real fetch() call
//   3. No other file needs to change — hooks consume this layer
// ─────────────────────────────────────────────────────────────

import { enrollmentByYear, enrollmentTrendData } from '../data/enrollmentData'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Simulate async network latency in dev
const mockDelay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

/**
 * Fetch all enrollment records across all school years.
 * @returns {Promise<Array>}
 */
export async function getAllEnrollment() {
  await mockDelay()
  return enrollmentByYear

  // --- REAL API (uncomment when backend ready) ---
  // const res = await fetch(`${BASE_URL}/enrollment`)
  // if (!res.ok) throw new Error('Failed to fetch enrollment data')
  // return res.json()
}

/**
 * Fetch enrollment data for a specific school year.
 * @param {string} schoolYear  e.g. '2025-2026'
 * @returns {Promise<Object>}
 */
export async function getEnrollmentBySY(schoolYear) {
  await mockDelay()
  const record = enrollmentByYear.find((d) => d.schoolYear === schoolYear)
  if (!record) throw new Error(`No enrollment data for ${schoolYear}`)
  return record

  // --- REAL API ---
  // const res = await fetch(`${BASE_URL}/enrollment/${schoolYear}`)
  // if (!res.ok) throw new Error('Failed to fetch enrollment data')
  // return res.json()
}

/**
 * Fetch flattened trend data (for charts).
 * @returns {Promise<Array>}
 */
export async function getEnrollmentTrend() {
  await mockDelay()
  return enrollmentTrendData

  // --- REAL API ---
  // const res = await fetch(`${BASE_URL}/enrollment/trend`)
  // if (!res.ok) throw new Error('Failed to fetch trend data')
  // return res.json()
}