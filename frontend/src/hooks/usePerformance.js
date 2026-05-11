// src/hooks/usePerformance.js
import { useState, useEffect } from 'react'
import { getAllPerformance, getPerformanceTrend, getRetentionRates } from '../api/performanceApi'

export function usePerformance() {
  const [data,      setData]      = useState([])
  const [trend,     setTrend]     = useState([])
  const [retention, setRetention] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [all, trendData, retentionData] = await Promise.all([
          getAllPerformance(),
          getPerformanceTrend(),
          getRetentionRates(),
        ])
        setData(all)
        setTrend(trendData)
        setRetention(retentionData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const current  = data[data.length - 1] ?? null
  const previous = data[data.length - 2] ?? null

  return { data, trend, retention, current, previous, loading, error }
}