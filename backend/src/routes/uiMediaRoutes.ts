import express, { RequestHandler } from 'express'
import { UIMedia } from '../models/UIMedia'
import { authMiddleware } from '../middleware/authMiddleware'
import { uploadImage } from '../lib/cloudinary'
import multer from 'multer'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'))
    }
  }
})

// GET all UI media
const getAllMedia: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const media = await UIMedia.find()
      .sort({ createdAt: -1 })
      .exec()
    res.json(media)
  } catch (error) {
    next(error)
  }
}

// GET UI media by ID
const getMediaById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await UIMedia.findById(req.params.id)
    if (!media) {
      res.status(404).json({ error: 'Media not found' })
      return
    }
    res.json(media)
  } catch (error) {
    next(error)
  }
}

// POST create UI media (protected)
const createMedia: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const { url: imageUrl, thumbnailUrl } = await uploadImage(req.file.buffer)

    const media = await UIMedia.create({
      url: imageUrl,
      thumbnailUrl,
      type: 'image',
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      isPublic: req.body.isPublic === 'true'
    })

    res.status(201).json(media)
  } catch (error) {
    next(error)
  }
}

// PUT update UI media (protected)
const updateMedia: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await UIMedia.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        isPublic: req.body.isPublic === 'true'
      },
      { new: true }
    )

    if (!media) {
      res.status(404).json({ error: 'Media not found' })
      return
    }

    res.json(media)
  } catch (error) {
    next(error)
  }
}

// DELETE UI media (protected)
const deleteMedia: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const media = await UIMedia.findByIdAndDelete(req.params.id)
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
router.post('/', authMiddleware, upload.single('file'), createMedia)
router.put('/:id', authMiddleware, updateMedia)
router.delete('/:id', authMiddleware, deleteMedia)

export default router 