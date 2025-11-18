-- Removed hardcoded user insertion that violates FK constraint
-- The user_profiles will be created automatically via trigger when user signs up

-- Insertar categorías de ejemplo si no existen
INSERT INTO categories (name, created_at)
VALUES 
  ('Hamburguesas', NOW()),
  ('Pizzas', NOW()),
  ('Bebidas', NOW()),
  ('Postres', NOW())
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Hamburguesa Clásica',
  'Deliciosa hamburguesa con queso y vegetales',
  8.99,
  (SELECT id FROM categories WHERE name = 'Hamburguesas' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Hamburguesa Clásica');

INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Hamburguesa Doble',
  'Dos medallones de carne con doble queso',
  12.99,
  (SELECT id FROM categories WHERE name = 'Hamburguesas' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Hamburguesa Doble');

INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Pizza Margarita',
  'Pizza clásica con tomate, mozzarella y albahaca',
  10.99,
  (SELECT id FROM categories WHERE name = 'Pizzas' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pizza Margarita');

INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Pizza Pepperoni',
  'Pizza con pepperoni y queso',
  12.99,
  (SELECT id FROM categories WHERE name = 'Pizzas' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pizza Pepperoni');

INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Refresco Pequeño',
  'Refresco de 350ml',
  2.99,
  (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Refresco Pequeño');

INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Jugo Natural',
  'Jugo natural recién hecho',
  4.99,
  (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Jugo Natural');

INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Helado',
  'Helado cremoso de vainilla',
  3.99,
  (SELECT id FROM categories WHERE name = 'Postres' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Helado');

INSERT INTO products (name, description, price, category_id, available, image_url, created_at)
SELECT 
  'Brownie Chocolate',
  'Brownie casero con chocolate',
  5.99,
  (SELECT id FROM categories WHERE name = 'Postres' LIMIT 1),
  true,
  '/placeholder.svg?height=200&width=200',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Brownie Chocolate');

-- Insertar descuentos de ejemplo
INSERT INTO discounts (name, description, points_required, discount_percentage, created_at)
VALUES 
  ('Descuento 5%', 'Obtén 5% de descuento en tu compra', 100, 5, NOW()),
  ('Descuento 10%', 'Obtén 10% de descuento en tu compra', 250, 10, NOW()),
  ('Descuento 15%', 'Obtén 15% de descuento en tu compra', 500, 15, NOW()),
  ('Descuento 20%', 'Obtén 20% de descuento en tu compra', 1000, 20, NOW())
ON CONFLICT DO NOTHING;
