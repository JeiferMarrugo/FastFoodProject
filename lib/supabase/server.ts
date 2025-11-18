// /lib/supabase/server.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // 1. Obtiene la tienda de cookies de Next.js
  const cookieStore = cookies()

  // Nota: La línea console.log("🍪 Cookies detectadas...") es buena para depuración, 
  // pero el método 'getAll' dentro del createServerClient es el que debe cambiar.

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 2. CORRECCIÓN: Usar el método 'get(name)' para que Supabase pueda 
        // buscar específicamente las cookies de sesión (ej: 'sb-access-token').
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // 3. (Opcional pero recomendable) Implementar 'set' para renovaciones de tokens.
        // Se envuelve en try/catch porque la escritura de cookies en Server Components
        // no siempre es posible si la respuesta ya comenzó a transmitirse.
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // No hacer nada, no hay cookies escribibles en un Server Component.
          }
        },
        // 4. (Opcional) Implementar 'remove'.
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // No hacer nada, no hay cookies escribibles en un Server Component.
          }
        },
      },
    }
  )
}
