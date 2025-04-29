import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { BeEm } from '@shared/models'
import mongoose from 'mongoose'

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

    // Ensure we're connected before proceeding
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready')
    }

    const books = await BeEm.find()
      .sort({ createdAt: -1 })
      .populate('mediaId')
      .populate('media')
      .populate('relatedPrograms')
      .populate('relatedPartyLiterasi')
      .lean()
      .exec()

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch books' },
      { status: 500 }
    )
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

    const data = await request.json()
    await connectToDatabase()

    // Ensure we're connected before proceeding
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection not ready')
    }

    const book = await BeEm.create({
      ...data,
      price: data.price || 0,
      year: data.year || new Date().getFullYear(),
      isAvailable: data.isAvailable ?? true
    })

    const populatedBook = await BeEm.findById(book._id)
      .populate('mediaId')
      .populate('media')
      .populate('relatedPrograms')
      .populate('relatedPartyLiterasi')
      .lean()
      .exec()

    return NextResponse.json(populatedBook)
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create book' },
      { status: 500 }
    )
  }
} 