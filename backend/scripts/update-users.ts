import { connectToDatabase } from '../src/utils/mongoose'
import UserModel from '../src/models/User'

async function updateUsers() {
  try {
    await connectToDatabase()
    console.log('Connected to database')

    // Update all users without organization to have EDSU as default
    const result = await UserModel.updateMany(
      { organization: { $exists: false } },
      { $set: { organization: 'EDSU' } }
    )

    console.log(`Updated ${result.modifiedCount} users`)

    // List all users to verify
    const users = await UserModel.find({}).select('-password')
    console.log('\nCurrent users:')
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role}, ${user.organization})`)
    })

  } catch (error) {
    console.error('Error updating users:', error)
  } finally {
    process.exit(0)
  }
}

updateUsers() 