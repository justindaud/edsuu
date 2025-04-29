import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@shared/lib/mongoose'
import { UIMedia, IUIMedia } from '@shared/models'
import { Model } from 'mongoose'

export const GET = async (
  request: NextRequest,
  { params }: { params: { locationId: string } }
) => {
  try {
    const { locationId } = params
    const searchParams = request.nextUrl.searchParams
    const index = parseInt(searchParams.get('index') || '0', 10)

    await connectToDatabase()

    // Find a media item with the given locationId in locationIds array and matching index
    const media = await (UIMedia as Model<IUIMedia>).findOne({
      locationIds: locationId,
      index,
      isPublic: true
    }, '_id title url thumbnailUrl description locationIds index')

    if (!media) {
      return NextResponse.json({ message: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching UI media by location:', error)
    return NextResponse.json(
      { message: 'Error fetching UI media' },
      { status: 500 }
    )
  }
} 