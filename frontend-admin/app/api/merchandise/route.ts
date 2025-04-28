import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { Merchandise } from '@shared/models'
import { uploadImage } from '@shared/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Find all merchandise and populate the image reference
    const merchandiseItems = await Merchandise.find()
      .populate('image')
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    // Format the response to match the frontend expectations
    const formattedMerchandise = merchandiseItems.map(item => {
      // Make sure item.image exists and has the expected properties
      if (item.image && typeof item.image === 'object') {
        return {
          _id: item._id,
          name: item.name,
          price: item.price,
          description: item.description || '',
          isAvailable: item.isAvailable !== false, // Default to true if not set
          url: item.image.url || '',
          thumbnailUrl: item.image.thumbnailUrl || '',
          image: item.image._id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      } else {
        // Fallback if image is not populated
        return {
          _id: item._id,
          name: item.name,
          price: item.price,
          description: item.description || '',
          isAvailable: item.isAvailable !== false,
          url: '',
          thumbnailUrl: '',
          image: item.image || '',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      }
    })

    return NextResponse.json(formattedMerchandise)
  } catch (error) {
    console.error('Error fetching merchandise:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchandise' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received at /api/merchandise')
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check content type to determine how to process the request
    const contentType = request.headers.get('content-type') || ''
    console.log('Content-Type:', contentType)
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with file
      console.log('Processing multipart form data')
      const formData = await request.formData()
      
      // Log received form data keys
      const formDataKeys = Array.from(formData.keys())
      console.log('Form data keys:', formDataKeys)
      
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }
      
      console.log('File:', file.name, file.type, file.size)
      
      const name = formData.get('name') as string
      const price = Number(formData.get('price'))
      const description = formData.get('description') as string || ''
      const isAvailable = formData.get('isAvailable') === 'true'
      
      console.log('Form data:', { name, price, description, isAvailable })
      
      // Upload file to Cloudinary
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      console.log('Uploading to Cloudinary...')
      const { url, thumbnailUrl } = await uploadImage(buffer)
      console.log('Upload successful:', { url, thumbnailUrl })
      
      await connectToDatabase()
      
      // First, create a Media object that will be referenced by the merchandise
      const { Media } = await import('@shared/models')
      const media = await Media.create({
        url,
        thumbnailUrl,
        type: 'image',
        title: name,
        description: description || name  // Use name as fallback if description is empty
      })
      
      console.log('Media created with ID:', media._id)
      
      // Create merchandise with reference to the media
      const merchandise = await Merchandise.create({
        name,
        price,
        image: media._id,  // Reference to the created media
        description
      })
      
      console.log('Merchandise created:', merchandise._id)
      return NextResponse.json(merchandise)
    } else {
      // Handle JSON data
      console.log('Processing JSON data')
      const data = await request.json()
      await connectToDatabase()
      
      const merchandise = await Merchandise.create(data)
      return NextResponse.json(merchandise)
    }
  } catch (error) {
    console.error('Error creating merchandise:', error)
    return NextResponse.json(
      { error: 'Failed to create merchandise', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

 