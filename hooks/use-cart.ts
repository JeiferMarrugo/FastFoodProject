"use client"

import { useState, useEffect } from "react"

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      setCart(parsedCart)
    }
    setIsLoaded(true)
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  const addToCart = (product_id: string, name: string, price: number, quantity = 1) => {
    setCart((prev) => {
      const existingItem = prev.items.find((item) => item.product_id === product_id)
      let newItems

      if (existingItem) {
        newItems = prev.items.map((item) =>
          item.product_id === product_id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      } else {
        newItems = [...prev.items, { product_id, name, price, quantity }]
      }

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return { items: newItems, total }
    })
  }

  const removeFromCart = (product_id: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.product_id !== product_id)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return { items: newItems, total }
    })
  }

  const updateQuantity = (product_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(product_id)
      return
    }

    setCart((prev) => {
      const newItems = prev.items.map((item) => (item.product_id === product_id ? { ...item, quantity } : item))
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return { items: newItems, total }
    })
  }

  const clearCart = () => {
    setCart({ items: [], total: 0 })
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoaded,
  }
}
