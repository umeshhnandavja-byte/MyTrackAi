'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Profile = { name: string; email: string }

const defaultProfile: Profile = { name: 'Jordan Davis', email: 'jordan@example.com' }
const storageKey = 'mytrack-profile'
const profileEvent = 'mytrack-profile-updated'

export function readProfile(): Profile {
  if (typeof window === 'undefined') return defaultProfile
  try {
    const saved = window.localStorage.getItem(storageKey)
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile
  } catch {
    return defaultProfile
  }
}

export async function saveProfile(profile: Profile) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(profile))
    window.dispatchEvent(new Event(profileEvent))
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('Profile')
    .upsert({
      id: user.id,
      name: profile.name,
      email: profile.email,
    })
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)

  useEffect(() => {
    const sync = () => setProfile(readProfile())
    sync()

    // Fetch from Supabase on mount to keep it fresh
    const fetchCloudProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('Profile')
        .select('name, email')
        .eq('id', user.id)
        .single()

      if (data) {
        const cloudProfile = { name: data.name, email: data.email }
        setProfile(cloudProfile)
        window.localStorage.setItem(storageKey, JSON.stringify(cloudProfile))
      }
    }

    fetchCloudProfile()

    window.addEventListener(profileEvent, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(profileEvent, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return profile
}