import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { uploadImage } from '@shared/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { MediaTBYT } from '@shared/models'

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
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Add file size validation (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const { url: imageUrl, thumbnailUrl } = await uploadImage(buffer)

    // Save to MongoDB
    try {
      await connectToDatabase()
      const media = await MediaTBYT.create({
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        type: 'image',
        title: title || file.name,
        description: description || ''
      })

      if (!media) {
        throw new Error('Failed to create media record')
      }

      return NextResponse.json(media)
    } catch (dbError) {
      console.error('MongoDB error:', dbError)
      // Delete the uploaded image from Cloudinary if MongoDB save fails
      try {
        const publicId = imageUrl.match(/\/edsu-house\/([^/]+)\.[^.]+$/)?.[1]
        if (publicId) {
          await cloudinary.uploader.destroy(`edsu-house/${publicId}`)
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup Cloudinary image:', cleanupError)
      }
      return NextResponse.json(
        { error: 'Failed to save media to database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
} 