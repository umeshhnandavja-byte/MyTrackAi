'use client'

import { useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Category = { 
  id: string; 
  name: string; 
  value: number; 
  image?: string; 
  imageUrl?: string 
}

const STORAGE_KEY = 'mytrack_local_categories'

// 1. Initialize from local storage
let categories: Category[] = typeof window !== 'undefined' 
  ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') 
  : []

const defaultCategoryLogos = ['heart', 'repeat', 'code', 'brain', 'target', 'dumbbell'] as const
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

// Helper to save locally
function saveLocal() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  }
}

// Stable empty array for SSR
const emptyCategories: Category[] = []

export function useCategories() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    () => categories,
    () => emptyCategories 
  )
}

export async function addCategory(name: string) {
  const trimmed = name.trim()
  if (!trimmed || categories.some((category) => category.name.toLowerCase() === trimmed.toLowerCase())) return
  
  const nextLogo = defaultCategoryLogos.find((logo) => !categories.some((category) => category.image === logo)) || defaultCategoryLogos[categories.length % defaultCategoryLogos.length]
  
  // 1. Save locally with a temporary ID (Optimistic & Offline)
  const newId = Date.now().toString()
  const newCategory: Category = { 
    id: newId, 
    name: trimmed, 
    value: 0, 
    image: nextLogo
  }

  categories = [...categories, newCategory]
  saveLocal()
  notify()

  // 2. Save to Supabase (if logged in)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // Stop here if offline

  const { data, error } = await supabase
    .from('Category')
    .insert([{ 
      name: newCategory.name, 
      value: newCategory.value, 
      image: newCategory.image,
      user_id: user.id // <--- CRITICAL: Ties category to this specific user!
    }])
    .select()
    .single()

  if (data && !error) {
    // Swap temporary ID for the real database UUID
    categories = categories.map(c => c.id === newId ? { 
      id: data.id, 
      name: data.name, 
      value: data.value, 
      image: data.image,
      imageUrl: data.imageUrl
    } : c)
    saveLocal()
    notify()
  }
}

export async function updateCategory(id: string, changes: Partial<Pick<Category, 'name' | 'value' | 'image' | 'imageUrl'>>) {
  // Optimistic UI + Local Save
  categories = categories.map((category) => category.id === id ? { ...category, ...changes } : category)
  saveLocal()
  notify()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('Category').update(changes).eq('id', id)
  }
}

export async function removeCategory(id: string) {
  // Optimistic UI + Local Save
  categories = categories.filter((category) => category.id !== id)
  saveLocal()
  notify()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('Category').delete().eq('id', id)
  }
}

export async function loadCategories() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If not logged in, just ensure we show local storage data
    categories = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    notify()
    return
  }

  // --- MIGRATION: Push local categories to the cloud ---
  const localCategories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  
  // Find categories with temporary timestamp IDs (Supabase IDs have hyphens)
  const unsyncedCategories = localCategories.filter(c => !c.id.includes('-'))

  if (unsyncedCategories.length > 0) {
    const toInsert = unsyncedCategories.map(c => ({
      name: c.name,
      value: c.value,
      image: c.image,
      "imageUrl": c.imageUrl,
      user_id: user.id // <--- CRITICAL: Ties offline categories to the user logging in
    }))
    await supabase.from('Category').insert(toInsert)
    localStorage.removeItem(STORAGE_KEY) // Clear migrated local data
  }
  // ---------------------------------------------------

  // Fetch the true cloud data for this specific user
  const { data, error } = await supabase
    .from('Category')
    .select('*')
    .order('created_at', { ascending: true })

  if (data && !error) {
    categories = data.map(dbCat => ({
      id: dbCat.id,
      name: dbCat.name,
      value: dbCat.value,
      image: dbCat.image,
      imageUrl: dbCat.imageUrl
    }))
    saveLocal() // Sync cloud back down to local cache
    notify()
  }
}