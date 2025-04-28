import express, { RequestHandler } from 'express'
import { Merchandise } from '../models/Merchandise'
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

// GET all merchandise
const getAllMerchandise: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const merchandise = await Merchandise.find()
      .sort({ createdAt: -1 })
      .exec()
    res.json(merchandise)
  } catch (error) {
    next(error)
  }
}

// GET merchandise by ID
const getMerchandiseById: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const merchandise = await Merchandise.findById(req.params.id)
      .exec()  
    if (!merchandise) {
      res.status(404).json({ error: 'Merchandise not found' })
      return
    }
    res.json(merchandise)
  } catch (error) {
    next(error)
  }
}

// POST create merchandise (protected)
const createMerchandise: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const { url: imageUrl, thumbnailUrl } = await uploadImage(req.file.buffer)

    const merchandise = await Merchandise.create({
      name: req.body.name,
      type: 'image',
      url: imageUrl,
      thumbnailUrl,
      price: Number(req.body.price),
      description: req.body.description || '',
      isAvailable: req.body.isAvailable === 'true'
    })

    res.status(201).json(merchandise)
  } catch (error) {
    console.error('Create merchandise error:', error);
    next(error)
  }
}

// PUT update merchandise (protected)
const updateMerchandise: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    let updateData: any = {
      name: req.body.name,
      description: req.body.description || '',
      price: Number(req.body.price),
      isAvailable: req.body.isAvailable === 'true'
    }

    // If there's a new file, upload it and update the URLs
    if (req.file) {
      const { url: imageUrl, thumbnailUrl } = await uploadImage(req.file.buffer)
      updateData.url = imageUrl
      updateData.thumbnailUrl = thumbnailUrl
    }

    const merchandise = await Merchandise.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    
    if (!merchandise) {
      res.status(404).json({ error: 'Merchandise not found' })
      return
    }
    
    res.json(merchandise)
  } catch (error) {
    console.error('Update merchandise error:', error);
    next(error)
  }
}

// DELETE merchandise (protected)
const deleteMerchandise: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    const merchandise = await Merchandise.findByIdAndDelete(req.params.id)
    if (!merchandise) {
      res.status(404).json({ error: 'Merchandise not found' })
      return
    }
    res.json({ message: 'Merchandise deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Routes
router.get('/', getAllMerchandise)
router.get('/:id', getMerchandiseById)
router.post('/', authMiddleware, upload.single('file'), createMerchandise)
router.put('/:id', authMiddleware, upload.single('file'), updateMerchandise)
router.delete('/:id', authMiddleware, deleteMerchandise)

export default router
