"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MainHeader } from "@/components/main-header"


interface Order {
  id: string
  total_price: number
  status: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-3xl font-bold mb-6">Mis Pedidos</h2>

        {loading ? (
          <p className="text-center text-muted-foreground">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No tienes pedidos aún</p>
            <Link href="/products">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Ver Catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-border">
                <CardHeader>
                  <CardTitle>Pedido #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                  <CardDescription>{new Date(order.created_at).toLocaleDateString("es-ES")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total: ${order.total_price?.toFixed(2) || "0.00"}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Completado"
                          : order.status === "pending"
                            ? "Pendiente"
                            : "Cancelado"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
