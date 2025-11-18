"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { LoadingScreen } from "@/components/loading-screen"
import { MainHeader } from "@/components/main-header"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category_id: string
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const supabase = createClient()
  const { cart, addToCart } = useCart()
  const { toast } = useToast()

  const navigationLinks = [
    { label: "Catálogo", href: "/products" },
    { label: "Pedidos", href: "/orders" },
    { label: "Cupones", href: "/dashboard" },
    { label: "Juegos", href: "/games" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase.from("products").select("*"),
      ])

      if (categoriesRes.error) throw categoriesRes.error
      if (productsRes.error) throw productsRes.error

      setCategories(categoriesRes.data || [])
      setProducts(productsRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory ? products.filter((p) => p.category_id === selectedCategory) : products

  console.log(products);

  const handleAddToCart = async (product: Product) => {
    setIsAdding(true)
    try {
      addToCart(product.id, product.name, product.price, 1)
      toast({
        title: "Éxito",
        description: `${product.name} agregado al carrito`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar al carrito",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <LoadingScreen isVisible={isAdding} message="Agregando al carrito..." />
      <div className="min-h-screen bg-background">
        <MainHeader links={navigationLinks} showCart={true} showProfile={true} />

        <main className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Nuestros Productos</h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedCategory(null)}
                className={`${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Cargando productos...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border-border hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="w-full h-70 bg-secondary overflow-hidden">
                    <img
                      src={`/products/${product.id}.jpg`}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain justify-self-center"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                      >
                        Añadir al Carrito
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
