import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { PartyLiterasi } from '@shared/models'

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
    const events = await PartyLiterasi.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'media',
        model: 'MediaTBYT'
      })
      .lean()

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching party literasi events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
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

    const event = await PartyLiterasi.create(data)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating party literasi event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
} 