import dotenv from 'dotenv'
import { connectDB } from '../db/db-connection'
import { UserModel } from '../models/user.model'
import { hashPassword } from '../utils/crypto.util'

// Cargar variables de entorno
dotenv.config()

async function createAdmin() {
  try {
    // Conectar a la base de datos
    await connectDB()
    console.log('Connected to database')

    // Datos del admin (puedes cambiarlos o pasarlos como variables de entorno)
    const email = process.env.ADMIN_EMAIL || 'admin@yourturn.com'
    const password = process.env.ADMIN_PASSWORD || 'Turn12345@'
    const admin = true // Usuario admin
    const roles: string[] = [] // Los admins no necesitan roles específicos

    // Verificar si el usuario ya existe y eliminarlo
    const existingUser = await UserModel.findOne({ email })

    if (existingUser) {
      console.log('Admin user already exists, deleting...')
      console.log(`  Email: ${existingUser.email}`)
      await UserModel.findByIdAndDelete(existingUser._id)
      console.log('  ✓ Existing user deleted')
    }

    // Crear el usuario admin
    const hashedPassword = hashPassword(password)
    const adminUser = await UserModel.create({
      email,
      password: hashedPassword,
      roles,
      admin: true,
      // No asignar enterprise para usuarios admin
      active: true,
    })

    console.log('✓ Admin user created successfully:')
    console.log(`  Email: ${adminUser.email}`)
    console.log(`  Admin: ${adminUser.admin}`)
    console.log(`  ID: ${adminUser._id}`)
    console.log('\n⚠️  Remember to change the default password!')

    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

// Ejecutar el script
createAdmin()

