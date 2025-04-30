import { v2 as cloudinary } from 'cloudinary'
import { ApiError } from '../utils/ApiError'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

interface CloudinaryResponse {
  secure_url: string
  public_id: string
}

interface CloudinaryTransformation {
  width?: number
  height?: number
  crop?: string
  quality?: string
  fetch_format?: string
}

// Configure Cloudinary with timeout settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds timeout
})

export const uploadImage = async (buffer: Buffer) => {
  try {
    // Convert buffer to base64
    const b64 = buffer.toString('base64')
    const dataURI = `data:image/jpeg;base64,${b64}`
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'webedsu',
      timeout: 60000,
      resource_type: 'auto',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto:good' },
        { fetch_format: 'auto' },
      ] as CloudinaryTransformation[],
    }) as CloudinaryResponse

    // Generate thumbnail URL
    const thumbnailUrl = cloudinary.url(result.public_id, {
      transformation: [
        { width: 300, height: 300, crop: 'fill', quality: 'auto:eco' },
        { fetch_format: 'auto' },
      ],
    })

    return {
      url: result.secure_url,
      thumbnailUrl
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new ApiError(500, 'Error uploading to Cloudinary')
  }
}

// Generate thumbnail from existing Cloudinary URL
export const generateThumbnail = async (url: string): Promise<string> => {
  try {
    // Extract public_id from the URL by matching the pattern
    const match = url.match(/\/webedsu\/([^/]+)\.[^.]+$/)
    if (!match) {
      throw new ApiError(400, 'Invalid Cloudinary URL format')
    }
    const publicId = `webedsu/${match[1]}`
    
    return cloudinary.url(publicId, {
      transformation: [
        { width: 300, height: 300, crop: 'fill', quality: 'auto:eco' },
        { fetch_format: 'auto' },
      ],
    })
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    throw new ApiError(500, 'Failed to generate thumbnail')
  }
}

export default cloudinary 