"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { AlertCircle, Gift, TrendingUp, Trash2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/loading-screen"
import { MainHeader } from "@/components/main-header"

interface Reward {
  id: string
  discount_percentage: number
  points_required: number
  description: string
}

interface Coupon {
  id: string
  discount_percentage: number
  created_at: string
  used_at: string | null
}

export default function RewardsPage() {
  const [userPoints, setUserPoints] = useState(0)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redeemedCoupons, setRedeemedCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const navigationLinks = [
    { label: "Catálogo", href: "/products" },
    { label: "Pedidos", href: "/orders" },
    { label: "Juegos", href: "/games" },
    { label: "Admin", href: "/admin/rewards" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: pointsData } = await supabase.from("user_points").select("points").eq("user_id", user.id).single()
      setUserPoints(pointsData?.points || 0)

      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .order("points_required", { ascending: true })
      setRewards(rewardsData || [])

      const { data: couponsData } = await supabase
        .from("redeemed_coupons")
        .select("id, discount_percentage, created_at, used_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setRedeemedCoupons(couponsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los cupones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const redeemReward = async (reward: Reward) => {
    setIsRedeeming(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (userPoints < reward.points_required) {
        toast({
          title: "Puntos insuficientes",
          description: `Necesitas ${reward.points_required} puntos, tienes ${userPoints}`,
          variant: "destructive",
        })
        setIsRedeeming(false)
        return
      }

      const newPoints = userPoints - reward.points_required
      await supabase.from("user_points").update({ points: newPoints }).eq("user_id", user.id)

      const { error } = await supabase.from("redeemed_coupons").insert({
        user_id: user.id,
        discount_percentage: reward.discount_percentage,
      })

      if (error) throw error

      setUserPoints(newPoints)
      fetchData()
      toast({
        title: "Cupón canjeado",
        description: `¡Has ganado un cupón de ${reward.discount_percentage}% de descuento!`,
      })
    } catch (error) {
      console.error("Error redeeming reward:", error)
      toast({
        title: "Error",
        description: "No se pudo canjear el cupón",
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  const copyCouponCode = (id: string) => {
    const code = id.slice(0, 12).toUpperCase()
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast({
      title: "Copiado",
      description: "Código de cupón copiado al portapapeles",
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const deleteCoupon = async (couponId: string) => {
    try {
      await supabase.from("redeemed_coupons").delete().eq("id", couponId)
      fetchData()
      toast({
        title: "Cupón eliminado",
        description: "El cupón ha sido eliminado",
      })
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cupón",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <LoadingScreen isVisible={isRedeeming} message="Canjeando cupón..." />
      <div className="min-h-screen bg-background">
        <MainHeader links={navigationLinks} showCart={true} showProfile={true} />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Mis Cupones y Recompensas</h2>
            <p className="text-muted-foreground">Canjea tus puntos por descuentos en tu próxima compra</p>
          </div>

          <Card className="border-2 border-primary mb-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Puntos Disponibles</p>
                  <p className="text-5xl font-bold mt-1">{userPoints}</p>
                </div>
                <div className="text-right">
                  <TrendingUp className="w-16 h-16 opacity-30 mb-2" />
                  <p className="text-sm opacity-90">Juega para ganar más puntos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Recompensas Disponibles
            </h3>

            {loading ? (
              <p className="text-center text-muted-foreground py-8">Cargando recompensas...</p>
            ) : rewards.length === 0 ? (
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay recompensas disponibles</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => {
                  const canRedeem = userPoints >= reward.points_required
                  return (
                    <Card
                      key={reward.id}
                      className={`border-2 transition-all ${
                        canRedeem ? "border-primary hover:shadow-lg hover:scale-105" : "border-gray-300 opacity-60"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-4xl text-primary font-bold">
                            {reward.discount_percentage}%
                          </CardTitle>
                          <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
                            DESCUENTO
                          </span>
                        </div>
                        <CardDescription className="mt-2">{reward.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-background p-3 rounded-lg border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Puntos requeridos</p>
                            <p className={`text-2xl font-bold ${canRedeem ? "text-green-600" : "text-red-600"}`}>
                              {reward.points_required}
                            </p>
                          </div>
                          <Button
                            onClick={() => redeemReward(reward)}
                            disabled={!canRedeem || isRedeeming}
                            className={`w-full font-semibold ${
                              canRedeem
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            {isRedeeming ? "Canjeando..." : canRedeem ? "Canjear Ahora" : "Puntos Insuficientes"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Mis Cupones Activos
            </h3>

            {redeemedCoupons.length === 0 ? (
              <Card className="border-border border-2 bg-primary/5">
                <CardContent className="pt-8 text-center pb-8">
                  <Gift className="w-12 h-12 mx-auto mb-3 text-primary opacity-50" />
                  <p className="text-muted-foreground text-lg">No has canjeado cupones aún</p>
                  <p className="text-sm text-muted-foreground mt-2">Juega en nuestro Flappy Bird para ganar puntos</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {redeemedCoupons.map((coupon) => (
                  <Card
                    key={coupon.id}
                    className={`border-2 transition-all ${
                      coupon.used_at
                        ? "border-gray-300 bg-gray-50 opacity-60"
                        : "border-primary bg-primary/5 hover:shadow-lg"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 font-medium">Código de Descuento</p>
                          <p className="text-5xl font-bold text-primary">{coupon.discount_percentage}%</p>
                        </div>

                        <div className="bg-background p-4 rounded-lg border-2 border-dashed border-primary">
                          <p className="text-sm font-mono font-bold tracking-widest uppercase break-words">
                            {coupon.id.slice(0, 12).toUpperCase()}
                          </p>
                        </div>

                        {coupon.used_at && (
                          <div className="bg-green-50 border border-green-300 rounded px-3 py-2">
                            <p className="text-xs font-semibold text-green-700">CUPÓN UTILIZADO</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => copyCouponCode(coupon.id)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            disabled={coupon.used_at !== null}
                          >
                            {copiedId === coupon.id ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-1" />
                                Copiar
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => deleteCoupon(coupon.id)}
                            size="sm"
                            variant="destructive"
                            className="px-3"
                            disabled={coupon.used_at !== null}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {coupon.used_at ? (
                            <span className="font-semibold">
                              Usado el {new Date(coupon.used_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span>Creado el {new Date(coupon.created_at).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
