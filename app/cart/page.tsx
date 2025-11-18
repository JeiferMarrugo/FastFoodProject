"use client"

import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { AlertCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/loading-screen"
import { MainHeader } from "@/components/main-header"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, isLoaded } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Ingresa un código de cupón")
      toast({
        title: "Error",
        description: "Por favor ingresa un código de cupón",
        variant: "destructive",
      })
      return
    }

    setApplyingCoupon(true)
    setCouponError("")

    try {
      const { data: coupons, error } = await supabase
        .from("redeemed_coupons")
        .select("*")
        .eq("user_id", user.id)
        .is("used_at", null)

      if (error) throw error

      const coupon = coupons.find((c) => c.id.slice(0, 12).toUpperCase() === couponCode.toUpperCase())

      if (!coupon) {
        setCouponError("Código de cupón no válido o ya fue usado")
        toast({
          title: "Cupón no válido",
          description: "El código de cupón no existe o ya fue utilizado",
          variant: "destructive",
        })
        return
      }

      setAppliedCoupon(coupon)
      setCouponCode("")
      toast({
        title: "Cupón aplicado",
        description: `Descuento de ${coupon.discount_percentage}% aplicado exitosamente`,
      })
    } catch (err) {
      console.error("Error validando cupón:", err)
      setCouponError("Error al validar el cupón")
      toast({
        title: "Error",
        description: "Ocurrió un error al validar el cupón",
        variant: "destructive",
      })
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    toast({
      title: "Cupón removido",
      description: "El cupón ha sido removido del carrito",
    })
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Sesión requerida",
        description: "Debes iniciar sesión para hacer un pedido",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (cart.items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega productos antes de proceder al pago",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      let totalPrice = cart.total * 1.08

      if (appliedCoupon) {
        const discount = totalPrice * (appliedCoupon.discount_percentage / 100)
        totalPrice -= discount
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            total_price: totalPrice,
            status: "pending",
          },
        ])
        .select()

      if (orderError) throw orderError

      const orderId = order[0].id

      const orderItems = cart.items.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      if (appliedCoupon) {
        await supabase.from("redeemed_coupons").update({ used_at: new Date().toISOString() }).eq("id", appliedCoupon.id)
      }

      const points = Math.floor(totalPrice * 1)
      const { data: userPoints, error: pointsError } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", user.id)
        .single()

      if (pointsError && pointsError.code !== "PGRST116") throw pointsError

      if (userPoints) {
        await supabase
          .from("user_points")
          .update({ points: (userPoints.points || 0) + points })
          .eq("user_id", user.id)
      }

      clearCart()
      toast({
        title: "Pedido realizado",
        description: `Pedido completado exitosamente. Has ganado ${points} puntos`,
      })
      setTimeout(() => router.push("/orders"), 1500)
    } catch (error) {
      console.error("Error al crear pedido:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el pedido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return <LoadingScreen isVisible={true} message="Cargando carrito..." />
  }

  const subtotal = cart.total
  const taxes = subtotal * 0.08
  let total = subtotal + taxes
  let discount = 0

  if (appliedCoupon) {
    discount = total * (appliedCoupon.discount_percentage / 100)
    total -= discount
  }

  const navigationLinks = [
    { label: "Catálogo", href: "/products" },
    { label: "Pedidos", href: "/orders" },
    { label: "Cupones", href: "/dashboard" },
  ]

  return (
    <>
      <LoadingScreen isVisible={loading} message="Procesando pedido..." />
      <div className="min-h-screen bg-background">
        <MainHeader links={navigationLinks} showCart={false} />

        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Mi Carrito</h1>

          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-6">Tu carrito está vacío</p>
              <Link href="/products">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Continuar Comprando</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <Card key={item.product_id} className="border-border">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <div className="text-right min-w-24">
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.product_id)}>
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Card className="border-border sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 pb-4 border-b border-border">
                      <label className="text-sm font-medium">Aplicar Cupón</label>
                      {appliedCoupon ? (
                        <div className="bg-green-50 border border-green-300 rounded p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-mono font-bold">{appliedCoupon.id.slice(0, 12).toUpperCase()}</p>
                            <p className="text-xs text-green-700 font-semibold mt-1">
                              {appliedCoupon.discount_percentage}% de descuento
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleRemoveCoupon}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ingresa código de cupón"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase())
                              setCouponError("")
                            }}
                            className="flex-1 px-3 py-2 border border-border rounded text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {applyingCoupon ? "..." : "Aplicar"}
                          </Button>
                        </div>
                      )}
                      {couponError && (
                        <div className="flex gap-2 items-center text-red-600 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          {couponError}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Impuestos (8%):</span>
                        <span>${taxes.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Descuento:</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      disabled={loading || cart.items.length === 0}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {loading ? "Procesando..." : "Proceder al Pago"}
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/products")} className="w-full">
                      Continuar Comprando
                    </Button>
                    <Button variant="ghost" onClick={clearCart} className="w-full text-destructive">
                      Limpiar Carrito
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
