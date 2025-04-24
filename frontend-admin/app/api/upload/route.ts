import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { uploadImage } from '@shared/lib/cloudinary'
import { connectToDatabase } from '@shared/lib/mongoose'
import { Media } from '@shared/models'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting upload process...')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('Session verified')

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const artist = formData.get('artist') as string
    const year = formData.get('year') as string
    const isPublic = formData.get('isPublic') === 'true'

    console.log('Form data received:', { title, description, artist, year, isPublic })

    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    console.log('File received:', file.name, file.type, file.size)

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('File converted to buffer')

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...')
    const { url, thumbnailUrl } = await uploadImage(buffer)
    console.log('Cloudinary upload successful:', { url, thumbnailUrl })

    // Connect to database and create media record
    console.log('Connecting to database...')
    await connectToDatabase()
    console.log('Creating media record...')
    const media = await Media.create({
      title,
      description,
      artist: artist || null,
      year: year || null,
      isPublic,
      url,
      thumbnailUrl,
      type: 'image',
      placeholders: []
    })

    console.log('Media record created successfully:', media)
    return NextResponse.json(media)
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
} 