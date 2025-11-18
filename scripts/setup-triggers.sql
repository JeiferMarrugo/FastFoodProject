-- Create trigger to automatically create user_profile and user_points on signup

-- Trigger para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, created_at, updated_at)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email), NOW(), NOW());
  
  INSERT INTO public.user_points (user_id, points, created_at, updated_at)
  VALUES (new.id, 0, NOW(), NOW());
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
