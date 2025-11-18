"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { useUser } from "@/hooks/use-users"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavLink {
  label: string
  href: string
}

interface MainHeaderProps {
  links: NavLink[]
  showCart?: boolean
  showProfile?: boolean
}

export function MainHeader({ links, showCart = false, showProfile = false }: MainHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { cart } = useCart()
  const { user, loading } = useUser()
  
  const avatar = user?.user_metadata?.avatar_url

  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={() => setIsOpen(false)} className="cursor-pointer">
          <h1 className="text-xl md:text-2xl font-bold text-primary-foreground cursor-pointer whitespace-nowrap">
            Rapid Food G.A
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-2 lg:gap-4 items-center flex-wrap justify-center flex-1 mx-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" className="cursor-pointer text-primary-foreground hover:bg-primary/90 text-sm lg:text-base">
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Section - Carrito + Hamburguesa */}
        <div className="flex items-center gap-2">
          {showCart && (
            <Link href="/cart" className="cursor-pointer">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 relative">
                <span className="hidden sm:inline">Carrito</span>
                <span className="sm:hidden">🛒</span>
                {cart.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cart.items.length}
                  </span>
                )}
              </Button>
            </Link>
          )}
          {showProfile && !loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={avatar || "/default-avatar.png"} />
                    <AvatarFallback>
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/logout" className="cursor-pointer">Cerrar sesión</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}


          {/* Hamburger Menu */}
          <button
            className="md:hidden p-2 text-primary-foreground hover:bg-primary/90 rounded"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-primary border-t border-border px-4 py-3 space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="block">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary/90 w-full justify-start">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
