import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@shared/lib/auth'
import { connectToDatabase } from '@shared/lib/mongoose'
import { Visitor } from '@shared/models/Visitor'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const visitors = await Visitor.find().sort({ visitDate: -1 })

    return NextResponse.json(visitors)
  } catch (error) {
    console.error('Error fetching visitors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visitors' },
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

    const body = await request.json()
    const { name, city, category, phoneNumber, email, quantity, visitDate } = body

    await connectToDatabase()
    const visitor = await Visitor.create({
      name,
      city,
      category,
      phoneNumber,
      email,
      quantity,
      visitDate: new Date(visitDate)
    })

    return NextResponse.json(visitor)
  } catch (error) {
    console.error('Error creating visitor:', error)
    return NextResponse.json(
      { error: 'Failed to create visitor' },
      { status: 500 }
    )
  }
} 