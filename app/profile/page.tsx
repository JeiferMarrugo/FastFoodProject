// app/profile/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileClient from "./profile-client"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const userId = user.id

  const { data: puntosData } = await supabase
    .from("user_points")
    .select("points")
    .eq("user_id", userId)
    .single()

  const { count: pedidosCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  const { count: cuponesCount } = await supabase
    .from("redeemed_coupons")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  const orders = await supabase.from("orders").select("*").eq("user_id", userId)

  return (
    <ProfileClient
      user={user}
      puntos={puntosData?.points ?? 0}
      pedidos={orders.data || []}
      pedidosCount={pedidosCount ?? 0}
      cuponesCount={cuponesCount ?? 0}
    />
  )
}
