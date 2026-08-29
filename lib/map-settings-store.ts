'use client'

import { useSyncExternalStore } from 'react'

let mapProgressDelayDays = 0
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

export function useMapProgressDelayDays() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener) }, () => mapProgressDelayDays, () => 0)
}

export function setMapProgressDelayDays(value: number) {
  mapProgressDelayDays = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0))
  notify()
}
