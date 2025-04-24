import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'
import * as dotenv from 'dotenv'
import UserModel from '../src/models/User'

// Load environment variables
dotenv.config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

async function createUser() {
  const args = process.argv.slice(2)
  if (args.length !== 4) {
    console.error('Usage: npm run create-user <username> <password> <organization> <role>')
    console.error('Organization must be either "EDSU" or "TokoBuku"')
    console.error('Role must be either "admin" or "editor"')
    process.exit(1)
  }

  const [username, password, organization, role] = args

  // Validate organization
  if (!['EDSU', 'TokoBuku'].includes(organization)) {
    console.error('Organization must be either "EDSU" or "TokoBuku"')
    process.exit(1)
  }

  // Validate role
  if (!['admin', 'editor'].includes(role)) {
    console.error('Role must be either "admin" or "editor"')
    process.exit(1)
  }
  
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if user already exists
    const existingUser = await UserModel.findOne({ username })
    if (existingUser) {
      console.error(`User with username "${username}" already exists`)
      process.exit(1)
    }

    const hashedPassword = await bcryptjs.hash(password, 10)
    
    const user = new UserModel({
      username,
      password: hashedPassword,
      organization,
      role
    })

    await user.save()
    console.log(`User created successfully:`)
    console.log(`Username: ${username}`)
    console.log(`Organization: ${organization}`)
    console.log(`Role: ${role}`)
    
  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

createUser() 