"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { MainHeader } from "@/components/main-header"
import { createClient } from "@/lib/supabase/client"

export default function ProfileClient({ user, puntos, pedidos, pedidosCount, cuponesCount }) {
    const [openAvatarModal, setOpenAvatarModal] = useState(false)

    const avatarOptions = [
        "/avatars/avatar1.jpeg",
        "/avatars/avatar2.jpeg",
        "/avatars/avatar3.jpeg",
        "/avatars/avatar4.jpeg",
        "/avatars/avatar5.jpeg",
        "/avatars/avatar6.jpeg",
        "/avatars/avatar7.jpeg",
        "/avatars/avatar8.jpeg",
    ]

    const nombre = user.user_metadata?.full_name || "Usuario"
    const email = user.email
    const avatar = user.user_metadata?.avatar_url

    async function updateAvatar(url) {
        const supabase = createClient()

        const { data, error } = await supabase.auth.updateUser({
            data: {
                avatar_url: url
            }
        })

        if (error) {
            console.error("❌ Error actualizando avatar:", error)
            return
        }

        console.log("✅ Avatar actualizado:", data)

        setOpenAvatarModal(false)

        window.location.reload()
    }


    return (
        <div className="min-h-screen bg-background">
            <MainHeader
                links={[
                    { label: "Catálogo", href: "/products" },
                    { label: "Pedidos", href: "/orders" },
                    { label: "Cupones", href: "/dashboard" },
                    { label: "Juegos", href: "/games" },
                ]}
                showProfile={true}
                showCart={false}
            />

            <main className="container mx-auto px-4 py-10">

                <h2 className="text-3xl font-bold mb-8 text-center">
                    Perfil del Usuario
                </h2>

                {/* Tarjeta Principal */}
                <Card className="max-w-2xl mx-auto shadow-sm">
                    <CardHeader className="flex flex-col items-center">
                        <Avatar className="w-28 h-28 border-4 border-primary/30 shadow-md">
                            <AvatarImage src={avatar || "/default-avatar.png"} />
                            <AvatarFallback className="text-3xl">
                                {nombre.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenAvatarModal(true)}
                            className="mt-4"
                        >
                            Editar Avatar
                        </Button>


                        <CardTitle className="mt-4 text-2xl">{nombre}</CardTitle>
                        <p className="text-muted-foreground">{email}</p>
                    </CardHeader>

                    <CardContent className="mt-6 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">

                            <div className="bg-muted rounded-lg p-4 shadow-sm">
                                <p className="text-3xl font-bold text-primary">{puntos}</p>
                                <p className="text-muted-foreground text-sm">Puntos</p>
                            </div>

                            <div className="bg-muted rounded-lg p-4 shadow-sm">
                                <p className="text-3xl font-bold text-primary">{pedidosCount}</p>
                                <p className="text-muted-foreground text-sm">Pedidos</p>
                            </div>

                            <div className="bg-muted rounded-lg p-4 shadow-sm">
                                <p className="text-3xl font-bold text-primary">{cuponesCount}</p>
                                <p className="text-muted-foreground text-sm">Cupones Canjeados</p>
                            </div>

                        </div>

                        {/* Botones de Acción */}
                        <div className="flex justify-center gap-4 pt-4">
                            <Button variant="outline">Editar Perfil</Button>
                            <Button variant="destructive">Cerrar Sesión</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sección Historia (opcional para expandir) */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Historial de Pedidos</CardTitle>
                        </CardHeader>

                        <CardContent>

                            {pedidos && pedidos.length > 0 ? (
                                <div className="space-y-4">

                                    {pedidos.map((order) => (
                                        <div
                                            key={order.id}
                                            className="border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition"
                                        >
                                            {/* Información del pedido */}
                                            <div>
                                                <p className="font-semibold text-lg">
                                                    Pedido #{order.id}
                                                </p>

                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString("es-CO", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric"
                                                    })}
                                                </p>

                                                <span
                                                    className={`
                                                    inline-block mt-2 px-3 py-1 text-xs font-bold rounded 
                                                    ${order.status === "completed" ? "bg-green-200 text-green-700" : ""}
                                                    ${order.status === "pending" ? "bg-yellow-200 text-yellow-700" : ""}
                                                    ${order.status === "canceled" ? "bg-red-200 text-red-700" : ""}
                                                    `}
                                                >
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Total y botón */}
                                            <div className="text-right">

                                                <p className="font-bold text-xl text-primary">
                                                    ${order.total_price?.toLocaleString("es-CO")}
                                                </p>

                                            </div>
                                        </div>
                                    ))}

                                </div>
                            ) : (
                                // Vista cuando NO hay pedidos
                                <div className="text-center py-10">
                                    <div className="text-6xl mb-4">📦</div>
                                    <p className="text-lg font-medium">Aún no tienes pedidos recientes</p>
                                    <p className="text-muted-foreground mt-1">
                                        Cuando realices compras aparecerán aquí.
                                    </p>

                                    <Button className="mt-6" asChild>
                                        <a href="/products">Ir al Catálogo</a>
                                    </Button>
                                </div>
                            )}

                        </CardContent>
                    </Card>

                </div>

            </main>

            <Dialog open={openAvatarModal} onOpenChange={setOpenAvatarModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Selecciona un Avatar</DialogTitle>
                        <DialogDescription>
                            Elige un estilo de avatar para actualizar tu perfil
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-3 gap-4 py-4">
                        {avatarOptions.map((img) => (
                            <button
                                key={img}
                                onClick={() => updateAvatar(img)}
                                className="rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition"
                            >
                                <img src={img} className="grip justify-self-center w-24 h-24 object-cover" />
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
