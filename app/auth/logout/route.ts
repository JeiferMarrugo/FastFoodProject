import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function GET() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
