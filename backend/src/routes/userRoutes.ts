import express, { Request, Response, NextFunction, RequestHandler } from 'express'
import User, { IUser } from '../models/User'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

interface CreateUserBody {
  username: string
  password: string
  organization: 'EDSU' | 'TokoBuku'
  role?: 'admin' | 'editor'
}

interface UpdateUserBody extends Partial<CreateUserBody> {}

interface AuthResponse {
  user: {
    id: string
    username: string
    role: string
    organization: string
  }
  token: string
}

interface MessageResponse {
  message?: string
  error?: string
}

const router = express.Router()

type AuthRequestHandler<P = {}, ResBody = any, ReqBody = any> = 
  (req: AuthRequest & { params: P } & { body: ReqBody }, res: Response<ResBody>, next: NextFunction) => Promise<void>

// GET all users (protected, admin only)
const getAllUsers: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    next(error)
  }
}

// GET user by ID (protected)
const getUserById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// POST create user (protected, admin only)
const createUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { username, password, role, organization } = req.body

    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' })
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      organization
    })

    // Return user without password
    const userWithoutPassword = {
      id: user._id,
      username: user.username,
      role: user.role,
      organization: user.organization
    }

    res.status(201).json(userWithoutPassword)
  } catch (error) {
    next(error)
  }
}

// PUT update user (protected)
const updateUser: AuthRequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const { username, password, role, organization } = req.body

    // Check if user exists
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Only allow users to update their own account unless they're an admin
    if (req.user?.role !== 'admin' && req.user?.id !== req.params.id) {
      res.status(403).json({ error: 'Not authorized' })
      return
    }

    // If updating username, check if new username already exists
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        res.status(400).json({ error: 'Username already exists' })
        return
      }
    }

    // Update user fields
    if (username) user.username = username
    if (role && req.user?.role === 'admin') user.role = role
    if (organization && req.user?.role === 'admin') user.organization = organization
    if (password) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
    }

    await user.save()

    // Return user without password
    const userWithoutPassword = {
      id: user._id,
      username: user.username,
      role: user.role,
      organization: user.organization
    }

    res.json(userWithoutPassword)
  } catch (error) {
    next(error)
  }
}

// DELETE user (protected, admin only)
const deleteUser: AuthRequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// POST register new user
const registerUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { username, password, organization } = req.body

    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' })
      return
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user with default role
    const user = await User.create({
      username,
      password: hashedPassword,
      role: 'user',
      organization
    })

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        organization: user.organization
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    )

    // Return user info and token
    const userResponse = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        organization: user.organization
      },
      token
    }

    res.status(201).json(userResponse)
  } catch (error) {
    next(error)
  }
}

// POST login user
const loginUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { username, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ username }).select('+password')
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        organization: user.organization
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    )

    // Return user info and token
    const userResponse = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        organization: user.organization
      },
      token
    }

    res.json(userResponse)
  } catch (error) {
    next(error)
  }
}

// GET current user (protected)
const getCurrentUser: AuthRequestHandler = async (req, res, next): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password')
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// Routes
router.get('/', authMiddleware, getAllUsers)
router.get('/:id', authMiddleware, getUserById)
router.post('/', authMiddleware, createUser)
router.put('/:id', authMiddleware, updateUser as RequestHandler)
router.delete('/:id', authMiddleware, deleteUser as RequestHandler)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me/current', authMiddleware, getCurrentUser as RequestHandler)

export default router 