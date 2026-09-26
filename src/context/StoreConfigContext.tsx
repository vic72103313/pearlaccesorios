import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { SocialLink, StoreSettings } from '../types'

interface StoreConfigValue {
  settings: StoreSettings | null
  socialLinks: SocialLink[]
  loading: boolean
  refresh: () => Promise<void>
}

const StoreConfigContext = createContext<StoreConfigValue | undefined>(undefined)

export function StoreConfigProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const [{ data: settingsData }, { data: linksData }] = await Promise.all([
      supabase.from('store_settings').select('*').single(),
      supabase.from('social_links').select('*').eq('active', true),
    ])
    setSettings((settingsData as StoreSettings) ?? null)
    setSocialLinks((linksData as SocialLink[]) ?? [])
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  return (
    <StoreConfigContext.Provider value={{ settings, socialLinks, loading, refresh }}>
      {children}
    </StoreConfigContext.Provider>
  )
}

export function useStoreConfig() {
  const ctx = useContext(StoreConfigContext)
  if (!ctx) throw new Error('useStoreConfig debe usarse dentro de <StoreConfigProvider>')
  return ctx
}
