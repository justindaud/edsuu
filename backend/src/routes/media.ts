import express, { RequestHandler } from 'express'
import { uploadImage } from '../lib/cloudinary'
import { Media } from '../models/Media'

const router = express.Router()

const uploadMediaHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { image } = req.body

    if (!image) {
      res.status(400).json({ error: 'No image provided' })
      return
    }

    const uploadResult = await uploadImage(image)
    
    const media = new Media({
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl
    })

    await media.save()

    res.status(201).json(media)
  } catch (error) {
    console.error('Error uploading media:', error)
    res.status(500).json({ error: 'Failed to upload media' })
  }
}

router.post('/upload', uploadMediaHandler)

export default router 