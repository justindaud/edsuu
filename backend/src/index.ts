import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'
import routes from './routes'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined')
}

const app = express()
const PORT = process.env.PORT || 5002

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5001'],
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api', routes)

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err))

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'EDSU Backend API is running' })
})

// Log environment variables (remove in production)
console.log('Environment variables loaded:')
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Not set ❌')
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Not set ❌')
console.log('PORT:', process.env.PORT || '5002 (default)')

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 