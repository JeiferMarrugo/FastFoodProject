import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) return supabaseClient

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        lifetime: 60 * 60 * 24 * 7, // 7 días
        sameSite: "lax",
      },
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  )

  return supabaseClient
}
