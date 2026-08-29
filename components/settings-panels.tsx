'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Download, Plug, Shield, UserRound, Tag, Plus, Trash2, Heart, Repeat2, Code2, Brain, Target, Dumbbell, ImagePlus, Monitor, GitCommit, Flame, BarChart3, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { addCategory, removeCategory, updateCategory, useCategories } from '@/lib/category-store'
import { saveProfile, useProfile } from '@/lib/profile-store'
import { setMapProgressDelayDays, useMapProgressDelayDays } from '@/lib/map-settings-store'

const tabs = [['Profile', UserRound], ['Platform Integrations', Plug], ['Data Management', Shield], ['Categories', Tag]] as const

export function SettingsPanels() {
  const [tab, setTab] = useState('Profile')
  
  // Profile State
  const profile = useProfile()
  const [profileDraft, setProfileDraft] = useState(profile)
  const [profileSaved, setProfileSaved] = useState(false)
  
  // Category State
  const [draftCategory, setDraftCategory] = useState('')
  const categories = useCategories()
  const [uploading, setUploading] = useState<string | null>(null)
  const baseImages = [{ name: 'heart', Icon: Heart }, { name: 'repeat', Icon: Repeat2 }, { name: 'code', Icon: Code2 }, { name: 'brain', Icon: Brain }, { name: 'target', Icon: Target }, { name: 'dumbbell', Icon: Dumbbell }]
  
  // Data Management State
  const mapDelayDays = useMapProgressDelayDays()

  // --- PLATFORM INTEGRATIONS STATE ---
  const [handles, setHandles] = useState({ github: '', leetcode: '', codeforces: '', codechef: '' })
  const [handlesSaved, setHandlesSaved] = useState(false)

  // Load platform handles on mount
  useEffect(() => {
    setHandles({
      github: localStorage.getItem('mytrack_github_handle') || '',
      leetcode: localStorage.getItem('mytrack_leetcode_handle') || '',
      codeforces: localStorage.getItem('mytrack_codeforces_handle') || '',
      codechef: localStorage.getItem('mytrack_codechef_handle') || ''
    })
  }, [])

  const handleSaveIntegrations = () => {
    localStorage.setItem('mytrack_github_handle', handles.github)
    localStorage.setItem('mytrack_leetcode_handle', handles.leetcode)
    localStorage.setItem('mytrack_codeforces_handle', handles.codeforces)
    localStorage.setItem('mytrack_codechef_handle', handles.codechef)

    // Fire the global event so the Analytics view updates instantly!
    window.dispatchEvent(new Event('handles_updated'))

    setHandlesSaved(true)
    setTimeout(() => setHandlesSaved(false), 2000)
  }

  const uploadImage = async (categoryId: string, file: File) => { 
    setUploading(categoryId)
    const body = new FormData()
    body.append('file', file)
    const response = await fetch('/api/category-image', { method: 'POST', body })
    const result = await response.json()
    if (response.ok) updateCategory(categoryId, { imageUrl: `/api/category-image?pathname=${encodeURIComponent(result.pathname)}` })
    setUploading(null) 
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        {/* Sidebar Navigation */}
        <nav className="flex gap-1 overflow-auto lg:flex-col">
          {tabs.map(([label, Icon]) => (
            <button 
              key={label} 
              onClick={() => setTab(label)} 
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground whitespace-nowrap lg:whitespace-normal', tab === label && 'bg-accent text-foreground')}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <section className="max-w-2xl rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="font-semibold">{tab}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'Profile' ? 'Manage your personal workspace identity.' : 
             tab === 'Platform Integrations' ? 'Connect the tools that power your tracked tasks.' : 
             tab === 'Categories' ? 'Manage your focus areas and display visuals.' :
             'Export or restore your mytrack workspace safely.'}
          </p>
          
          <div className="mt-6 flex flex-col gap-6">
            
            {/* PROFILE TAB */}
            {tab === 'Profile' && (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Full name
                  <input 
                    aria-label="Profile name" 
                    value={profileDraft.name} 
                    onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} 
                    className="h-10 rounded-lg border border-input bg-background px-3 font-normal" 
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Email address
                  <input 
                    aria-label="Profile email" 
                    type="email" 
                    value={profileDraft.email} 
                    onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })} 
                    className="h-10 rounded-lg border border-input bg-background px-3 font-normal" 
                  />
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <Button onClick={() => { saveProfile(profileDraft); setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000) }}>
                    Save profile
                  </Button>
                  {profileSaved && <span className="text-sm font-medium text-emerald-500">Profile saved!</span>}
                </div>
              </div>
            )}

            {/* PLATFORM INTEGRATIONS TAB */}
            {tab === 'Platform Integrations' && (
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* GitHub */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <GitCommit className="size-4" /> GitHub Username
                    </label>
                    <input 
                      value={handles.github}
                      onChange={(e) => setHandles({ ...handles, github: e.target.value })}
                      placeholder="e.g. torvalds"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>

                  {/* LeetCode */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Flame className="size-4" /> LeetCode Handle
                    </label>
                    <input 
                      value={handles.leetcode}
                      onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                      placeholder="e.g. striver_79"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>

                  {/* Codeforces */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Target className="size-4" /> Codeforces Handle
                    </label>
                    <input 
                      value={handles.codeforces}
                      onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
                      placeholder="e.g. tourist"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>

                  {/* CodeChef */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <BarChart3 className="size-4" /> CodeChef Handle
                    </label>
                    <input 
                      value={handles.codechef}
                      onChange={(e) => setHandles({ ...handles, codechef: e.target.value })}
                      placeholder="e.g. gennady.korotkevich"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-start border-t border-border/50 pt-5">
                  <Button onClick={handleSaveIntegrations} className="gap-2 transition-all">
                    {handlesSaved ? <><CheckCircle2 className="size-4" /> Saved Successfully</> : <><Save className="size-4" /> Save Integrations</>}
                  </Button>
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {tab === 'Categories' && (
              <>
                <div className="flex gap-2">
                  <input 
                    aria-label="New category" 
                    value={draftCategory} 
                    onChange={(event) => setDraftCategory(event.target.value)} 
                    placeholder="Add a category" 
                    className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm" 
                  />
                  <Button onClick={() => { addCategory(draftCategory); setDraftCategory('') }}>
                    <Plus data-icon="inline-start" />Add
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{category.name}</span>
                          <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            {/* Hidden manual update for value if needed, preserved from your code */}
                            <input 
                              aria-hidden="true" 
                              tabIndex={-1} 
                              className="hidden" 
                              type="hidden" 
                              min="0" 
                              max="100" 
                              value={category.value} 
                              onChange={(event) => updateCategory(category.id, { value: Math.max(0, Math.min(100, Number(event.target.value))) })} 
                            />
                          </label>
                        </div>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={() => removeCategory(category.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {baseImages.map(({ name, Icon }) => (
                          <button 
                            key={name} 
                            type="button" 
                            aria-label={`Use ${name} image`} 
                            onClick={() => updateCategory(category.id, { image: name, imageUrl: undefined })} 
                            className={cn('flex size-9 items-center justify-center rounded-lg border border-border', category.image === name && 'border-foreground bg-accent')}
                          >
                            <Icon className="size-4" />
                          </button>
                        ))}
                        <label className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border hover:bg-accent/50 transition-colors" title="Import image">
                          <ImagePlus className="size-4 text-muted-foreground" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="sr-only" 
                            onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(category.id, file) }} 
                          />
                        </label>
                        {uploading === category.id && <span className="self-center text-xs text-muted-foreground animate-pulse">Uploading…</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* DATA MANAGEMENT TAB */}
            {tab === 'Data Management' && (
              <>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/30 p-4 text-sm">
                  <span>
                    <span className="block font-medium">Days before map progress counts</span>
                    <span className="text-xs text-muted-foreground">Default is 0 days. Progress stays at 0 until this time passes.</span>
                  </span>
                  <input 
                    aria-label="Days before map progress counts" 
                    type="number" 
                    min="0" 
                    value={mapDelayDays} 
                    onChange={(event) => setMapProgressDelayDays(Number(event.target.value))} 
                    className="w-16 rounded border border-input bg-background px-2 py-1" 
                  />
                </label>
                
                <div className="rounded-xl border border-border bg-background/40 p-5 mt-2">
                  <h4 className="font-medium">Export your data</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Download tasks, canvas nodes, and streaks as a JSON backup.</p>
                  <Button className="mt-5"><Download className="mr-2 size-4" />Download JSON Backup</Button>
                </div>
                
                <div className="rounded-xl border border-dashed border-border bg-background/20 p-8 text-center">
                  <p className="text-sm">Drop your mytrack backup .json file here</p>
                  <Button variant="outline" className="mt-4">Upload &amp; Restore</Button>
                  <p className="mt-3 text-xs text-muted-foreground">Warning: This will overwrite your current local data.</p>
                </div>
              </>
            )}

          </div>
        </section>
      </div>
    </main>
  )
}