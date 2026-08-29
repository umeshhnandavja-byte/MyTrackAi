'use client'

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'mytrack_map_delay'

// 1. Initialize from localStorage so it remembers the user's setting
let mapProgressDelayDays = typeof window !== 'undefined' 
  ? Number(localStorage.getItem(STORAGE_KEY)) || 0 
  : 0

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

export function useMapProgressDelayDays() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) }, 
    () => mapProgressDelayDays, 
    () => 0
  )
}

export function setMapProgressDelayDays(value: number) {
  mapProgressDelayDays = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0))
  
  // 2. Save back to localStorage whenever it changes
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, String(mapProgressDelayDays))
  }
  
  notify()
}