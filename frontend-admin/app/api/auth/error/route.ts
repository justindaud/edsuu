import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  // Handle different error types
  let errorMessage = 'An error occurred during authentication'
  switch (error) {
    case 'Configuration':
      errorMessage = 'There is a problem with the server configuration.'
      break
    case 'AccessDenied':
      errorMessage = 'Access denied. You do not have permission to access this resource.'
      break
    case 'Verification':
      errorMessage = 'The verification token has expired or has already been used.'
      break
    case 'Default':
    default:
      errorMessage = 'An unexpected error occurred during authentication.'
      break
  }

  return NextResponse.json({ error: errorMessage }, { status: 401 })
} 