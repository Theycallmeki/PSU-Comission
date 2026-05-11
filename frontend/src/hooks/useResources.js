// src/hooks/useResources.js
import { useState, useEffect } from 'react'
import { getAllResources, getResourceTrend } from '../api/resourcesApi'

export function useResources() {
  const [data,    setData]    = useState([])
  const [trend,   setTrend]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [all, trendData] = await Promise.all([
          getAllResources(),
          getResourceTrend(),
        ])
        setData(all)
        setTrend(trendData)
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

  return { data, trend, current, previous, loading, error }
}