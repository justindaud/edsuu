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

// GET UI media by location ID
const getMediaByLocation: RequestHandler<{ locationId: string }> = async (req, res, next): Promise<void> => {
  try {
    const { locationId } = req.params
    const index = parseInt(req.query.index as string || '0', 10)

    // Updated query to only check locationIds array
    const media = await UIMedia.findOne({
      locationIds: locationId,
      index,
      isPublic: true
    })

    if (!media) {
      res.status(404).json({ error: 'Media not found for this location' })
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

    const locationIds = req.body.locationIds ? 
      Array.isArray(req.body.locationIds) ? 
        req.body.locationIds : 
        JSON.parse(req.body.locationIds) : 
      [];

    const media = await UIMedia.create({
      url: imageUrl,
      thumbnailUrl,
      type: 'image',
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      isPublic: req.body.isPublic === 'true',
      locationIds,
      index: req.body.index ? parseInt(req.body.index, 10) : 0
    })

    res.status(201).json(media)
  } catch (error) {
    next(error)
  }
}

// PUT update UI media (protected)
const updateMedia: RequestHandler<{ id: string }> = async (req, res, next): Promise<void> => {
  try {
    console.log('Update request body:', req.body);
    
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ error: 'Invalid media ID format' });
      return;
    }

    const updateData: any = {
      title: req.body.title,
      description: req.body.description,
      isPublic: req.body.isPublic === 'true' || req.body.isPublic === true
    }

    // Handle locationIds update
    if (req.body.locationIds !== undefined) {
      try {
        updateData.locationIds = Array.isArray(req.body.locationIds) ? 
          req.body.locationIds : 
          JSON.parse(req.body.locationIds);
      } catch (e) {
        console.error('Error parsing locationIds:', e);
        res.status(400).json({ error: 'Invalid locationIds format' });
        return;
      }
    }

    // Only update index if it's provided and is a valid number
    if (req.body.index !== undefined) {
      const index = parseInt(req.body.index, 10);
      if (isNaN(index)) {
        res.status(400).json({ error: 'Invalid index value' });
        return;
      }
      updateData.index = index;
    }

    console.log('Final update data:', updateData);

    const media = await UIMedia.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!media) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    res.json(media);
  } catch (error) {
    console.error('Error updating media:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
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
router.get('/by-location/:locationId', getMediaByLocation)
router.get('/:id', getMediaById)
router.post('/', authMiddleware, upload.single('file'), createMedia)
router.put('/:id', authMiddleware, updateMedia)
router.delete('/:id', authMiddleware, deleteMedia)

export default router 