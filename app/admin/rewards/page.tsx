"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Reward {
  id: string
  discount_percentage: number
  points_required: number
  description: string
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    discount_percentage: "",
    points_required: "",
    description: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const { data } = await supabase.from("rewards").select("*").order("points_required", { ascending: true })
      setRewards(data || [])
    } catch (error) {
      console.error("Error fetching rewards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.discount_percentage || !formData.points_required || !formData.description) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      const { error } = await supabase.from("rewards").insert({
        discount_percentage: Number.parseInt(formData.discount_percentage),
        points_required: Number.parseInt(formData.points_required),
        description: formData.description,
      })

      if (error) throw error

      setFormData({ discount_percentage: "", points_required: "", description: "" })
      fetchRewards()
      alert("Recompensa creada exitosamente")
    } catch (error) {
      console.error("Error creating reward:", error)
      alert("Error al crear la recompensa")
    }
  }

  const deleteReward = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta recompensa?")) return

    try {
      await supabase.from("rewards").delete().eq("id", id)
      fetchRewards()
    } catch (error) {
      console.error("Error deleting reward:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary-foreground cursor-pointer">Rapid Food G.A Admin</h1>
          </Link>
          <nav className="flex gap-2 md:gap-4">
            <Link href="/rewards">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary/90">
                Mis Cupones
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Administrar Recompensas</h2>

        {/* Create Reward Form */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle>Crear Nueva Recompensa</CardTitle>
            <CardDescription>Agrega un nuevo nivel de recompensa para los usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Descuento (%)</label>
                  <Input
                    type="number"
                    placeholder="Ej: 5, 10, 15"
                    min="1"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    className="border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Puntos Requeridos</label>
                  <Input
                    type="number"
                    placeholder="Ej: 100, 200, 500"
                    min="10"
                    value={formData.points_required}
                    onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
                    className="border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <Input
                    type="text"
                    placeholder="Ej: Descuento pequeño"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border-border"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Crear Recompensa
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Rewards List */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Recompensas Existentes</h3>

          {loading ? (
            <p className="text-center text-muted-foreground">Cargando recompensas...</p>
          ) : rewards.length === 0 ? (
            <Card className="border-border">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No hay recompensas creadas. ¡Crea una nueva!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">{reward.discount_percentage}% OFF</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">Puntos:</span>
                        <span className="font-bold text-primary">{reward.points_required}</span>
                      </div>
                      <Button onClick={() => deleteReward(reward.id)} variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
