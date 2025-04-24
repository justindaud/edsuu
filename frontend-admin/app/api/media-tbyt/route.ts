import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { MediaTBYT } from '@shared/models'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const media = await MediaTBYT.find().sort({ createdAt: -1 })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media TBYT:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media TBYT' },
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

    const media = await MediaTBYT.create(data)
    return NextResponse.json(media)
  } catch (error) {
    console.error('Error creating media TBYT:', error)
    return NextResponse.json(
      { error: 'Failed to create media TBYT' },
      { status: 500 }
    )
  }
} 