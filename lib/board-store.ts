'use client'

import { useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'

export type BoardNote = {
  id: number
  title: string
  text: string
  tone: string
  x: number
  y: number
  imageUrl?: string
}

type BoardStateData = {
  notes: BoardNote[]
  positions: Record<number, { x: number; y: number }>
  sizes: Record<number, { x: number; y: number }>
  connections: [number, number][]
  customColors: Record<number, string>
  customFontColors: Record<number, string>
}

const STORAGE_KEY = 'mytrack_local_board'

const defaultState: BoardStateData = {
  notes: [
    { id: 1, title: 'The morning routine', text: 'Start with the smallest move. Momentum compounds.', tone: 'yellow', x: 1050, y: 1048 },
    { id: 2, title: 'Focus window', text: '09:00 — 11:30\nNo meetings. Deep work only.', tone: 'paper', x: 1310, y: 1038 },
    { id: 3, title: 'Ship something', text: 'Small releases > perfect plans', tone: 'yellow', x: 1650, y: 1090 },
    { id: 4, title: 'Bug: missing deadline', text: 'To-do deadlines are not appearing after save. Reproduce in the To-Do popup.', tone: 'paper', x: 1170, y: 1330 },
    { id: 5, title: 'Note 4 reference', text: 'Bug evidence', tone: 'paper', x: 1560, y: 1318, imageUrl: '/bug-reference.png' },
  ],
  positions: {},
  sizes: {},
  connections: [[1, 3]],
  customColors: {},
  customFontColors: {}
}

// Initialize from local storage first (Offline-ready)
let boardState: BoardStateData = typeof window !== 'undefined'
  ? JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultState))
  : defaultState

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

function saveLocal() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boardState))
  }
}

const emptyState: BoardStateData = defaultState

export function useBoardState() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    () => boardState,
    () => emptyState
  )
}

export async function updateBoardState(newState: Partial<BoardStateData>) {
  // 1. Save locally FIRST (Instant UI feedback & offline persistence)
  boardState = { ...boardState, ...newState }
  saveLocal()
  notify()

  // 2. Sync to Supabase if logged in
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('PlanningBoard').upsert({
    user_id: user.id,
    notes: boardState.notes,
    positions: boardState.positions,
    sizes: boardState.sizes,
    connections: boardState.connections,
    custom_colors: boardState.customColors,
    custom_font_colors: boardState.customFontColors,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
}

export async function loadBoard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If guest, ensure local storage state is loaded
    boardState = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultState))
    notify()
    return
  }

  // --- MIGRATION: Check if cloud has data, if not, push local guest work up! ---
  const localData: BoardStateData = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultState))

  const { data, error } = await supabase
    .from('PlanningBoard')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!data || error) {
    // New account with no cloud board yet -> Migrate local state to cloud!
    await supabase.from('PlanningBoard').upsert({
      user_id: user.id,
      notes: localData.notes,
      positions: localData.positions,
      sizes: localData.sizes,
      connections: localData.connections,
      custom_colors: localData.customColors,
      custom_font_colors: localData.customFontColors
    }, { onConflict: 'user_id' })
    
    boardState = localData
    notify()
  } else {
    // Cloud has data -> Pull it down and update local cache
    boardState = {
      notes: data.notes || defaultState.notes,
      positions: data.positions || {},
      sizes: data.sizes || {},
      connections: data.connections || defaultState.connections,
      customColors: data.custom_colors || {},
      customFontColors: data.custom_font_colors || {}
    }
    saveLocal()
    notify()
  }
}