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
    const username = process.env.ADMIN_USERNAME || 'admin'
    const email = process.env.ADMIN_EMAIL || 'admin@yourturn.com'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const roles = ['APP_ADMIN']

    // Verificar si el usuario ya existe
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }]
    })

    if (existingUser) {
      console.log('Admin user already exists:')
      console.log(`  Username: ${existingUser.username}`)
      console.log(`  Email: ${existingUser.email}`)
      console.log(`  Roles: ${existingUser.roles.join(', ')}`)
      
      // Actualizar roles si no tiene APP_ADMIN
      if (!existingUser.roles.includes('APP_ADMIN')) {
        existingUser.roles.push('APP_ADMIN')
        await existingUser.save()
        console.log('  ✓ Added APP_ADMIN role to existing user')
      } else {
        console.log('  ✓ User already has APP_ADMIN role')
      }
      
      process.exit(0)
    }

    // Crear el usuario admin
    const hashedPassword = hashPassword(password)
    const adminUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      roles,
      active: true,
    })

    console.log('✓ Admin user created successfully:')
    console.log(`  Username: ${adminUser.username}`)
    console.log(`  Email: ${adminUser.email}`)
    console.log(`  Roles: ${adminUser.roles.join(', ')}`)
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

