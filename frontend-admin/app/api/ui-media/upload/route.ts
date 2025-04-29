import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { UIMedia } from '@shared/models'
import cloudinary from 'cloudinary'

// Configure Cloudinary with the same settings as backend
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds timeout
})

// Reimplement uploadImage to match backend's function
async function uploadImage(buffer: Buffer) {
  // Convert buffer to base64
  const b64 = buffer.toString('base64')
  const dataURI = `data:image/jpeg;base64,${b64}`
  
  // Upload to Cloudinary
  const result = await cloudinary.v2.uploader.upload(dataURI, {
    folder: 'webedsu',
    timeout: 60000,
    resource_type: 'auto',
    transformation: [
      { width: 1920, height: 1080, crop: 'limit', quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  })

  // Generate thumbnail URL
  const thumbnailUrl = cloudinary.v2.url(result.public_id, {
    transformation: [
      { width: 300, height: 300, crop: 'fill', quality: 'auto:eco' },
      { fetch_format: 'auto' },
    ],
  })

  return {
    url: result.secure_url,
    thumbnailUrl
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isPublic = formData.get('isPublic') === 'true'
    const locationIdsStr = formData.get('locationIds') as string
    const indexStr = formData.get('index') as string || '0'
    const index = parseInt(indexStr, 10) || 0

    // Parse locationIds from JSON string if it exists
    let locationIds: string[] = []
    if (locationIdsStr) {
      try {
        locationIds = JSON.parse(locationIdsStr)
      } catch (e) {
        console.warn('Failed to parse locationIds:', e)
      }
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const { url, thumbnailUrl } = await uploadImage(buffer)

    await connectToDatabase()

    // Create media record with locationIds array
    const media = await UIMedia.create({
      title,
      description,
      isPublic,
      url,
      thumbnailUrl,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      locationIds,
      index
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error uploading UI media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
} 