import { createClient as createBrowserClient } from './client'
import { createClient as createServerClient } from './server'

// Re-export both clients
export { createBrowserClient, createServerClient }

// Create a singleton browser client for client-side use
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const getBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be called in browser environment')
  }
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

// For backward compatibility
export const supabase = typeof window === 'undefined' ? null : getBrowserClient()