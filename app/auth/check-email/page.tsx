"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verifica tu Email</CardTitle>
            <CardDescription>Hemos enviado un enlace de confirmación a tu email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground text-center">
                Por favor, verifica tu email y haz clic en el enlace de confirmación para activar tu cuenta.
              </p>
              <Link href="/auth/login">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Volver al login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
