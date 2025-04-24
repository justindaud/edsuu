import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { UIMedia } from '@shared/models'
import { uploadImage } from '@shared/lib/cloudinary'

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

    // Create media record
    const media = await UIMedia.create({
      title,
      description,
      isPublic,
      url,
      thumbnailUrl,
      type: file.type.startsWith('image/') ? 'image' : 'video'
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