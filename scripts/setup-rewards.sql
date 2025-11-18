-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_percentage INT NOT NULL,
  points_required INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create redeemed_coupons table
CREATE TABLE IF NOT EXISTS redeemed_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_percentage INT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  used_at TIMESTAMP
);

-- Insert default rewards
INSERT INTO rewards (discount_percentage, points_required, description) VALUES
  (5, 50, 'Descuento pequeño para tu próxima compra'),
  (10, 100, 'Descuento mediano en cualquier producto'),
  (15, 200, 'Descuento generoso en tu pedido'),
  (20, 300, 'Descuento máximo en toda tu compra')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeemed_coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards (anyone can read)
CREATE POLICY "Rewards are readable by all" ON rewards
  FOR SELECT USING (true);

-- RLS Policies for redeemed_coupons (users can only see their own)
CREATE POLICY "Users can see their own coupons" ON redeemed_coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coupons" ON redeemed_coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);
