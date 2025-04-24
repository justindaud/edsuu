import express, { RequestHandler } from 'express'
import { Media } from '../models/Media'
import { authMiddleware } from '../middleware/authMiddleware'

interface MessageResponse {
  message?: string
  error?: string
}

const router = express.Router()

// GET all media
const getAllMedia: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const media = await Media.find()
      .sort({ createdAt: -1 })
      .exec()
    res.json(media)
  } catch (error) {
    next(error)
  }
}

// GET media by ID
const getMediaById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await Media.findById(req.params.id)
    if (!media) {
      res.status(404).json({ error: 'Media not found' })
      return
    }
    res.json(media)
  } catch (error) {
    next(error)
  }
}

// POST create media (protected)
const createMedia: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const media = await Media.create(req.body)
    res.status(201).json(media)
  } catch (error) {
    next(error)
  }
}

// DELETE media (protected)
const deleteMedia: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id)
    if (!media) {
      res.status(404).json({ error: 'Media not found' })
      return
    }
    res.json({ message: 'Media deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Routes
router.get('/', getAllMedia)
router.get('/:id', getMediaById)
router.post('/', authMiddleware, createMedia)
router.delete('/:id', authMiddleware, deleteMedia)

export default router 