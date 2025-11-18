import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const testUser = {
  email: "usuario@comidas.com",
  password: "Comidas123!@#",
  user_metadata: {
    full_name: "Carlos Mendez",
  },
}

async function createUser() {
  try {
    console.log("Verificando si el usuario ya existe...")

    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userExists = existingUser.users.find((u) => u.email === testUser.email)

    if (userExists) {
      console.log("El usuario ya existe en la base de datos")
      console.log("\n========================================")
      console.log("✅ Usuario existente")
      console.log("========================================")
      console.log(`Email: ${testUser.email}`)
      console.log(`Contraseña: ${testUser.password}`)
      console.log(`Nombre: ${testUser.user_metadata.full_name}`)
      console.log("========================================\n")
      return
    }

    console.log("Creando usuario de prueba...")

    // Crear usuario en auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: testUser.user_metadata,
    })

    if (authError) {
      console.error("Error al crear usuario en auth:", authError.message)
      process.exit(1)
    }

    console.log("Usuario creado en auth:", authUser.user.id)

    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: authUser.user.id,
      full_name: testUser.user_metadata.full_name,
    })

    if (profileError && !profileError.message.includes("duplicate")) {
      console.error("Error al crear perfil:", profileError.message)
      process.exit(1)
    }

    console.log("Perfil creado exitosamente")

    const { error: pointsError } = await supabase.from("user_points").insert({
      user_id: authUser.user.id,
      points: 0,
    })

    if (pointsError && !pointsError.message.includes("duplicate")) {
      console.error("Error al crear registro de puntos:", pointsError.message)
      process.exit(1)
    }

    console.log("Registro de puntos creado exitosamente")

    console.log("\n========================================")
    console.log("✅ Usuario creado exitosamente")
    console.log("========================================")
    console.log(`Email: ${testUser.email}`)
    console.log(`Contraseña: ${testUser.password}`)
    console.log(`Nombre: ${testUser.user_metadata.full_name}`)
    console.log("========================================\n")
  } catch (error) {
    console.error("Error inesperado:", error.message)
    process.exit(1)
  }
}

createUser()
