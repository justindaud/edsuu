import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { Merchandise } from '@shared/models'
import { uploadImage } from '@shared/lib/cloudinary'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    // Find merchandise by id and populate the image reference
    const merchandise = await Merchandise.findById(params.id)
      .populate('image')
      .lean() as any

    if (!merchandise) {
      return NextResponse.json(
        { error: 'Merchandise not found' },
        { status: 404 }
      )
    }

    // Format the response to match the frontend expectations
    const formattedMerchandise = {
      _id: merchandise._id,
      name: merchandise.name,
      price: merchandise.price,
      description: merchandise.description || '',
      isAvailable: merchandise.isAvailable !== false,
      createdAt: merchandise.createdAt,
      updatedAt: merchandise.updatedAt
    }

    // Add image properties if available
    if (merchandise.image && typeof merchandise.image === 'object') {
      const image = merchandise.image as any;
      Object.assign(formattedMerchandise, {
        url: image.url || '',
        thumbnailUrl: image.thumbnailUrl || '',
        image: image._id
      })
    } else {
      Object.assign(formattedMerchandise, {
        url: '',
        thumbnailUrl: '',
        image: merchandise.image || ''
      })
    }

    return NextResponse.json(formattedMerchandise)
  } catch (error) {
    console.error('Error fetching merchandise:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchandise' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT request received for merchandise:', params.id)
    
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    // Check content type to handle FormData or JSON
    const contentType = request.headers.get('content-type') || ''
    console.log('Content-Type:', contentType)
    
    let updateData: any = {}
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with file upload
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      
      updateData = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        description: formData.get('description') as string || ''
      }
      
      console.log('Update data:', updateData)
      
      // If file was provided, upload it and update the image reference
      if (file) {
        console.log('File received:', file.name, file.type, file.size)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const { url, thumbnailUrl } = await uploadImage(buffer)
        
        // Get the current merchandise to find its image reference
        const merchandise = await Merchandise.findById(params.id)
        if (!merchandise) {
          return NextResponse.json(
            { error: 'Merchandise not found' },
            { status: 404 }
          )
        }
        
        // Update the existing Media object or create a new one
        const { Media } = await import('@shared/models')
        let media
        
        if (merchandise.image) {
          // Update existing media
          media = await Media.findByIdAndUpdate(
            merchandise.image,
            {
              url,
              thumbnailUrl,
              title: updateData.name,
              description: updateData.description
            },
            { new: true }
          )
        } else {
          // Create new media
          media = await Media.create({
            url,
            thumbnailUrl,
            type: 'image',
            title: updateData.name,
            description: updateData.description
          })
        }
        
        // Set the image reference
        updateData.image = media._id
      }
    } else {
      // Handle JSON data
      updateData = await request.json()
    }
    
    const merchandise = await Merchandise.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )
    
    if (!merchandise) {
      return NextResponse.json(
        { error: 'Merchandise not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(merchandise)
  } catch (error) {
    console.error('Error updating merchandise:', error)
    return NextResponse.json(
      { error: 'Failed to update merchandise' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    
    const updateData = await request.json()

    const merchandise = await Merchandise.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )

    if (!merchandise) {
      return NextResponse.json(
        { error: 'Merchandise not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(merchandise)
  } catch (error) {
    console.error('Error updating merchandise:', error)
    return NextResponse.json(
      { error: 'Failed to update merchandise' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const merchandise = await Merchandise.findByIdAndDelete(params.id)

    if (!merchandise) {
      return NextResponse.json(
        { error: 'Merchandise not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting merchandise:', error)
    return NextResponse.json(
      { error: 'Failed to delete merchandise' },
      { status: 500 }
    )
  }
}