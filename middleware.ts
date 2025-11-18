// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Crear cliente Supabase vinculado a las cookies del request y response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Intentamos obtener el usuario autenticado
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.warn("⚠️ Middleware -> Error de sesión:", error.message)
  } else {
    console.log("🔐 Middleware -> Usuario autenticado:", user?.email || "Ninguno")
  }

  // Si el usuario NO está autenticado y trata de entrar a rutas protegidas, redirigimos al login
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")
  if (!user && !isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// 🔧 El matcher define en qué rutas corre el middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
