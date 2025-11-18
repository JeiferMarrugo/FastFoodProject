"use client"

import Link from "next/link"

export function ProductCarousel({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null

  // Duplicamos los productos para el loop infinito
  const loopProducts = [...products, ...products]

  return (
    <div className="overflow-hidden py-6 relative">
      <div className="marquee gap-6">
        {loopProducts.map((p, i) => (
          <Link key={i} href={`/products/${p.id}`}>
            <div className="min-w-[200px] bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <img
                src={p.image_url}
                alt={p.name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h4 className="font-semibold">{p.name}</h4>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <p className="font-bold text-primary mt-1">${p.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
