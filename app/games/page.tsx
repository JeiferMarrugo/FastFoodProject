"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"

export default function GamesPage() {
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
        <h2 className="text-3xl font-bold mb-6">Juegos y Desafíos</h2>
        <p className="text-muted-foreground mb-8">Juega y gana puntos para canjear descuentos</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/games/flappy-bird">
            <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-2xl">Flappy Bird</CardTitle>
                <CardDescription>Navega a través de las tuberías y gana puntos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl mb-4">🐦</div>
                <p className="text-sm text-muted-foreground mb-4">Cada punto en el juego = 5 puntos en tu cuenta</p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Jugar Ahora</Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-border opacity-50">
            <CardHeader>
              <CardTitle className="text-2xl">Próximos Juegos</CardTitle>
              <CardDescription>Más juegos emocionantes están en camino</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl mb-4">🎲</div>
              <p className="text-sm text-muted-foreground">Más opciones de entretenimiento y puntos</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
