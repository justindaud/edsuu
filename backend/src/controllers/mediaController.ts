import { Request, Response } from 'express'
import { Media } from '../models/Media'
import { uploadImage } from '../lib/cloudinary'
import { ApiError } from '../utils/ApiError'

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded')
    }

    const result = await uploadImage(req.file.buffer)
    
    const media = await Media.create({
      url: result.url,
      thumbnailUrl: result.thumbnailUrl
    })

    res.status(201).json({
      success: true,
      data: media
    })
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Error uploading media'
      })
    }
  }
}

export const getMedia = async (req: Request, res: Response) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 })
    
    res.status(200).json({
      success: true,
      data: media
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching media'
    })
  }
}

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const media = await Media.findByIdAndDelete(id)
    
    if (!media) {
      throw new ApiError(404, 'Media not found')
    }

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    })
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Error deleting media'
      })
    }
  }
} 