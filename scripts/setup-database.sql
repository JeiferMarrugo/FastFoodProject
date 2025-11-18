-- Crear tabla de usuarios (perfil adicional)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de categorías de productos
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  total_price DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de items de pedidos
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de puntos de usuario
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de descuentos/bonos
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  discount_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de descuentos usados
CREATE TABLE IF NOT EXISTS user_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  discount_id UUID NOT NULL REFERENCES discounts(id),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para categories (public read)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (TRUE);

-- Políticas RLS para products (public read)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (TRUE);

-- Políticas RLS para orders
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para order_items
CREATE POLICY "Users can view their order items" ON order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert order items for their orders" ON order_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Políticas RLS para user_points
CREATE POLICY "Users can view their own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON user_points FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para user_discounts
CREATE POLICY "Users can view their own discounts" ON user_discounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own discounts" ON user_discounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own discounts" ON user_discounts FOR UPDATE USING (auth.uid() = user_id);

-- Insertar categorías de ejemplo
INSERT INTO categories (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Hamburguesas'),
  ('00000000-0000-0000-0000-000000000002', 'Pizzas'),
  ('00000000-0000-0000-0000-000000000003', 'Bebidas'),
  ('00000000-0000-0000-0000-000000000004', 'Postres');

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category_id, available) VALUES
  ('Hamburguesa Clásica', 'Deliciosa hamburguesa con queso y lechuga', 8.99, '00000000-0000-0000-0000-000000000001', TRUE),
  ('Hamburguesa Doble', 'Dos medallones de carne con doble queso', 12.99, '00000000-0000-0000-0000-000000000001', TRUE),
  ('Pizza Margarita', 'Pizza clásica con tomate, mozzarella y albahaca', 10.99, '00000000-0000-0000-0000-000000000002', TRUE),
  ('Pizza Pepperoni', 'Pizza con pepperoni y queso', 12.99, '00000000-0000-0000-0000-000000000002', TRUE),
  ('Refresco Pequeño', 'Refresco de 350ml', 2.99, '00000000-0000-0000-0000-000000000003', TRUE),
  ('Jugo Natural', 'Jugo natural recién hecho', 4.99, '00000000-0000-0000-0000-000000000003', TRUE),
  ('Helado', 'Helado cremoso de vainilla', 3.99, '00000000-0000-0000-0000-000000000004', TRUE),
  ('Brownie Chocolate', 'Brownie casero con chocolate', 5.99, '00000000-0000-0000-0000-000000000004', TRUE);

-- Insertar descuentos de ejemplo
INSERT INTO discounts (name, description, points_required, discount_percentage) VALUES
  ('Descuento 5%', 'Obtén 5% de descuento', 100, 5),
  ('Descuento 10%', 'Obtén 10% de descuento', 250, 10),
  ('Descuento 15%', 'Obtén 15% de descuento', 500, 15),
  ('Descuento 20%', 'Obtén 20% de descuento', 1000, 20);
