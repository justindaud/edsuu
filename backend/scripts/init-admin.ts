import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface IUser {
  username: string
  password: string
  role: string
}

async function createAdminUser() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable')
    }

    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Define the User schema
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, required: true }
    })

    // Create the User model
    const User = mongoose.models.User || mongoose.model('User', userSchema)

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' }).exec()

    if (existingAdmin) {
      console.log('Admin user already exists')
      await mongoose.disconnect()
      process.exit(0)
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    })

    console.log('Admin user created successfully')
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

createAdminUser() 