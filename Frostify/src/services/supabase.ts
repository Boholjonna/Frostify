import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton Supabase client instance
let supabaseInstance: SupabaseClient | null = null

/**
 * Get or create the singleton Supabase client instance
 * This prevents multiple GoTrueClient instances from being created
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are missing. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }

    // Initialize Supabase client with performance optimizations
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Disable session persistence for faster queries
        autoRefreshToken: false
      },
      global: {
        headers: {
          'cache-control': 'max-age=3600' // Enable caching
        }
      }
    })
  }

  return supabaseInstance
}
