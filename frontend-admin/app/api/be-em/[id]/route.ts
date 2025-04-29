import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { BeEm } from '@shared/models'

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
    const book = await BeEm.findById(params.id)
      .populate({
        path: 'mediaId',
        model: 'MediaTBYT',
        select: '_id title url thumbnailUrl'
      })
      .populate({
        path: 'media',
        model: 'MediaTBYT',
        select: '_id title url thumbnailUrl'
      })
      .populate({
        path: 'relatedPrograms',
        model: 'Program',
        select: '_id title'
      })
      .populate({
        path: 'relatedPartyLiterasi',
        model: 'PartyLiterasi',
        select: '_id title'
      })
      .lean()

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
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

    const data = await request.json()
    await connectToDatabase()

    const book = await BeEm.findByIdAndUpdate(
      params.id,
      {
        ...data,
        price: data.price || 0,
        year: data.year || new Date().getFullYear(),
        isAvailable: data.isAvailable ?? true
      },
      { new: true }
    )
      .populate({
        path: 'mediaId',
        model: 'MediaTBYT',
        select: '_id title url thumbnailUrl'
      })
      .populate({
        path: 'media',
        model: 'MediaTBYT',
        select: '_id title url thumbnailUrl'
      })
      .populate({
        path: 'relatedPrograms',
        model: 'Program',
        select: '_id title'
      })
      .populate({
        path: 'relatedPartyLiterasi',
        model: 'PartyLiterasi',
        select: '_id title'
      })
      .lean()

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
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
    const book = await BeEm.findByIdAndDelete(params.id)

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
} 