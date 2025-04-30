import express, { RequestHandler } from 'express'
import MediaTBYT from '../models/MediaTBYT'
import { authMiddleware } from '../middleware/authMiddleware'

const router = express.Router()

// GET all media-tbyt
const getAllMediaTBYT: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const media = await MediaTBYT.find()
      .sort({ createdAt: -1 })
      .exec()
    res.json(media)
  } catch (error) {
    next(error)
  }
}

// GET media-tbyt by ID
const getMediaTBYTById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await MediaTBYT.findById(req.params.id)
    if (!media) {
      res.status(404).json({ error: 'Media TBYT not found' })
      return
    }
    res.json(media)
  } catch (error) {
    next(error)
  }
}

// POST create media-tbyt (protected)
const createMediaTBYT: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const media = await MediaTBYT.create(req.body)
    res.status(201).json(media)
  } catch (error) {
    next(error)
  }
}

// PUT update media-tbyt (protected)
const updateMediaTBYT: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await MediaTBYT.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!media) {
      res.status(404).json({ error: 'Media TBYT not found' })
      return
    }
    res.json(media)
  } catch (error) {
    next(error)
  }
}

// DELETE media-tbyt (protected)
const deleteMediaTBYT: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await MediaTBYT.findByIdAndDelete(req.params.id)
    if (!media) {
      res.status(404).json({ error: 'Media TBYT not found' })
      return
    }
    res.json({ message: 'Media TBYT deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Routes
router.get('/', getAllMediaTBYT)
router.get('/:id', getMediaTBYTById)
router.post('/', authMiddleware, createMediaTBYT)
router.put('/:id', authMiddleware, updateMediaTBYT)
router.delete('/:id', authMiddleware, deleteMediaTBYT)

export default router 