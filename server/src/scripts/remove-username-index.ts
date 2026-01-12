import mongoose from 'mongoose'
import { connectDB } from '../db/db-connection'

async function removeUsernameIndex() {
  try {
    console.log('Connecting to MongoDB...')
    await connectDB()
    
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }

    const usersCollection = db.collection('users')
    
    // Listar todos los índices
    const indexes = await usersCollection.indexes()
    console.log('\n📋 Current indexes:')
    indexes.forEach((index: any) => {
      console.log(`  - ${index.name}:`, index.key)
    })
    
    // Eliminar el índice de username si existe
    try {
      await usersCollection.dropIndex('username_1')
      console.log('\n✅ Index "username_1" removed successfully')
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound' || error.message?.includes('index not found')) {
        console.log('\nℹ️  Index "username_1" does not exist (already removed)')
      } else {
        throw error
      }
    }
    
    // Verificar que se eliminó
    const indexesAfter = await usersCollection.indexes()
    console.log('\n📋 Indexes after removal:')
    indexesAfter.forEach((index: any) => {
      console.log(`  - ${index.name}:`, index.key)
    })
    
    console.log('\n✅ Migration completed successfully')
    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error removing username index:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

removeUsernameIndex()

