import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MainHeader } from "@/components/main-header"
import { ProductCarousel } from "@/components/product-carousel"


export default async function Home() {
  const supabase = createServerClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  console.log(user);

  console.log("🧠 Supabase user:", user)
  console.log("🚨 Supabase error:", error)

  if (!user) {
    redirect("/auth/login")
  }

  const { data: sugeridos, error: errorSugeridos } = await supabase
  .from("products")
  .select("*")
  .limit(4)

  const navigationLinks = [
    { label: "Catálogo", href: "/products" },
    { label: "Pedidos", href: "/orders" },
    { label: "Cupones", href: "/dashboard" },
    { label: "Juegos", href: "/games" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <MainHeader links={navigationLinks} showCart={false} showProfile={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Bienvenido, {user?.user_metadata.full_name}</h2>
            <div className="grid justify-self-center justify-center min-h-10 w-30 bg-backgroundr">
              <img 
                src={`/logo.jpg`}
                alt="Mi imagen"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          <p className="text-muted-foreground mb-8">¿Qué deseas hacer hoy?</p>
        </div>
        {Array.isArray(sugeridos) && sugeridos.length > 0 && (
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-4 text-center">Sugerencias para ti</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {sugeridos.map((producto) => (
                <Link
                  key={producto.id}
                  href={`/products`}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <img
                      src={`/products/${producto.id}.jpg`}
                      alt={producto.name}
                      className="w-full h-32 object-cover rounded-md mb-4"
                    />

                    <h4 className="text-lg font-semibold">{producto.name}</h4>
                    <p className="text-muted-foreground text-sm mb-2">{producto.description}</p>

                    <p className="font-bold text-primary">${producto.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/products" className="group">
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🍔</div>
              <h3 className="text-xl font-bold mb-2">Ver Catálogo</h3>
              <p className="text-muted-foreground">Descubre nuestros deliciosos productos</p>
            </div>
          </Link>

          <Link href="/orders" className="group">
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-2">Mis Pedidos</h3>
              <p className="text-muted-foreground">Realiza y gestiona tus pedidos</p>
            </div>
          </Link>

          <Link href="/games" className="group">
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-2">Juega y Gana Puntos</h3>
              <p className="text-muted-foreground">Juega y obtén descuentos</p>
            </div>
          </Link>

          <Link href="/dashboard" className="group">
            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Mis Puntos</h3>
              <p className="text-muted-foreground">Canjea tus puntos por descuentos</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
