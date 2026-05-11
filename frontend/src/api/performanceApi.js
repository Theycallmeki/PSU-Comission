// src/api/performanceApi.js

import { performanceByYear, performanceTrendData, retentionRateByYear } from '../data/performanceData'

const mockDelay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function getAllPerformance() {
  await mockDelay()
  return performanceByYear

  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/performance`)
  // if (!res.ok) throw new Error('Failed to fetch performance data')
  // return res.json()
}

export async function getPerformanceTrend() {
  await mockDelay()
  return performanceTrendData

  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/performance/trend`)
  // if (!res.ok) throw new Error('Failed to fetch performance trend')
  // return res.json()
}

export async function getRetentionRates() {
  await mockDelay()
  return retentionRateByYear

  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/performance/retention`)
  // if (!res.ok) throw new Error('Failed to fetch retention rates')
  // return res.json()
}