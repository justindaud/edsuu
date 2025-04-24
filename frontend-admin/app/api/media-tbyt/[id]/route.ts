import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { MediaTBYT } from '@shared/models'

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
    const media = await MediaTBYT.findById(params.id)

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media TBYT:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media TBYT' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const data = await request.json()
    await connectToDatabase()

    const media = await MediaTBYT.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    )

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error updating media TBYT:', error)
    return NextResponse.json(
      { error: 'Failed to update media TBYT' },
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
    const media = await MediaTBYT.findByIdAndDelete(params.id)

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Error deleting media TBYT:', error)
    return NextResponse.json(
      { error: 'Failed to delete media TBYT' },
      { status: 500 }
    )
  }
} 