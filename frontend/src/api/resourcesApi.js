// src/api/resourcesApi.js

import { resourcesByYear, resourceTrendData, currentResources } from '../data/resourcesData'

const mockDelay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function getAllResources() {
  await mockDelay()
  return resourcesByYear

  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resources`)
  // if (!res.ok) throw new Error('Failed to fetch resources data')
  // return res.json()
}

export async function getCurrentResources() {
  await mockDelay()
  return currentResources

  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resources/current`)
  // if (!res.ok) throw new Error('Failed to fetch current resources')
  // return res.json()
}

export async function getResourceTrend() {
  await mockDelay()
  return resourceTrendData

  // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resources/trend`)
  // if (!res.ok) throw new Error('Failed to fetch resource trend')
  // return res.json()
}