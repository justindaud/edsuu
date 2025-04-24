import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import User from '../models/User'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') })

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('Connected to MongoDB')

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123', // This will be hashed automatically by the model
      organization: 'EDSU',
      role: 'admin'
    })

    console.log('Admin user created successfully:', adminUser)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createAdminUser() 