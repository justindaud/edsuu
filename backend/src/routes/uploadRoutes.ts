import { Router, Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/authMiddleware'
import { Media } from '../models/Media'
import { authMiddleware } from '../middleware/authMiddleware'
import { uploadImage } from '../lib/cloudinary'
import multer from 'multer'

const router = Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 20MB limit
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

interface UploadResponse {
  url: string
  thumbnailUrl: string
  type: string
  title: string
  description: string
}

// POST upload image (protected)
const uploadMediaFile = async (
  req: Request & { file?: Express.Multer.File },
  res: Response<UploadResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' } as any)
      return
    }

    const { url: imageUrl, thumbnailUrl } = await uploadImage(req.file.buffer)

    const media = await Media.create({
      url: imageUrl,
      thumbnailUrl,
      type: 'image',
      title: req.body.title || req.file.originalname,
      description: req.body.description || ''
    })

    res.status(201).json(media as any)
    return
  } catch (error) {
    next(error)
    return
  }
}

// Routes
router.post('/', authMiddleware, upload.single('file'), uploadMediaFile)

export default router 