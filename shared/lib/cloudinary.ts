import { v2 as cloudinary } from 'cloudinary'
import { ApiError } from './ApiError'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  url: string
  thumbnailUrl: string
}

export async function uploadImage(buffer: Buffer): Promise<CloudinaryUploadResult> {
  try {
    // Convert buffer to base64
    const base64 = buffer.toString('base64')
    const dataURI = `data:image/jpeg;base64,${base64}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'edsu-house',
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ]
    })

    // Generate thumbnail URL
    const thumbnailUrl = cloudinary.url(result.public_id, {
      width: 400,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    })

    return {
      url: result.secure_url,
      thumbnailUrl
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new ApiError(500, 'Failed to upload image')
  }
}

export function generateThumbnail(publicId: string): string {
  return cloudinary.url(publicId, {
    width: 400,
    height: 400,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  })
} 