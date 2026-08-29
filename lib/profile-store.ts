'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Profile = { 
  name: string
  email: string
  github?: string
  leetcode?: string
  codeforces?: string
  codechef?: string
}

const defaultProfile: Profile = { 
  name: 'Jordan Davis', 
  email: 'jordan@example.com',
  github: '',
  leetcode: '',
  codeforces: '',
  codechef: ''
}

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
    // Keep individual handle keys in sync for backward compatibility
    if (profile.github) window.localStorage.setItem('mytrack_github_handle', profile.github)
    if (profile.leetcode) window.localStorage.setItem('mytrack_leetcode_handle', profile.leetcode)
    if (profile.codeforces) window.localStorage.setItem('mytrack_codeforces_handle', profile.codeforces)
    if (profile.codechef) window.localStorage.setItem('mytrack_codechef_handle', profile.codechef)

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
      github: profile.github,
      leetcode: profile.leetcode,
      codeforces: profile.codeforces,
      codechef: profile.codechef,
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
        .select('name, email, github, leetcode, codeforces, codechef')
        .eq('id', user.id)
        .single()

      if (data) {
        const cloudProfile = { 
          name: data.name, 
          email: data.email,
          github: data.github || '',
          leetcode: data.leetcode || '',
          codeforces: data.codeforces || '',
          codechef: data.codechef || ''
        }
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