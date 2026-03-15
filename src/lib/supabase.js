import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mode demo si pas de configuration Supabase
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co'

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)
