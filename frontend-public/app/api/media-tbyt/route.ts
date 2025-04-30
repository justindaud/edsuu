import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media-tbyt`
    console.log('Fetching media-tbyt from:', url)
    
    const response = await fetch(url, {
      // Add timeout to avoid hanging
      signal: AbortSignal.timeout(5000),
      // Add proper headers
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      // Handle HTTP errors
      console.error('Media-TBYT API Error Response:', {
        status: response.status,
        statusText: response.statusText
      })
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Media-TBYT fetched successfully:', data.length, 'items')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Media-TBYT API Error:', {
      message: error.message,
      code: error.cause?.code,
      name: error.name
    })

    // Handle specific error types
    if (error.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Backend server is not running. Please start the backend server.' },
        { status: 503 }
      )
    }

    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      )
    }

    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request was aborted. Please try again.' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
} 