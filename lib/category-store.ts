'use client'

import { useSyncExternalStore } from 'react'

export type Category = { id: string; name: string; value: number; image?: string; imageUrl?: string }

const initialCategories: Category[] = [
  { id: 'health', name: 'Health', value: 78, image: 'heart' },
  { id: 'habits', name: 'Habits', value: 92, image: 'repeat' },
  { id: 'coding', name: 'Coding', value: 68, image: 'code' },
  { id: 'logic', name: 'Logic', value: 84, image: 'brain' },
  { id: 'planning', name: 'Planning', value: 73, image: 'target' },
]

let categories = initialCategories
const defaultCategoryLogos = ['heart', 'repeat', 'code', 'brain', 'target', 'dumbbell'] as const
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

export function useCategories() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    () => categories,
    () => initialCategories,
  )
}

export function addCategory(name: string) {
  const trimmed = name.trim()
  if (!trimmed || categories.some((category) => category.name.toLowerCase() === trimmed.toLowerCase())) return
  const nextLogo = defaultCategoryLogos.find((logo) => !categories.some((category) => category.image === logo)) || defaultCategoryLogos[categories.length % defaultCategoryLogos.length]
  categories = [...categories, { id: `${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`, name: trimmed, value: 0, image: nextLogo }]
  notify()
}

export function removeCategory(id: string) {
  categories = categories.filter((category) => category.id !== id)
  notify()
}

export function updateCategory(id: string, changes: Partial<Pick<Category, 'name' | 'value' | 'image' | 'imageUrl'>>) {
  categories = categories.map((category) => category.id === id ? { ...category, ...changes } : category)
  notify()
}
