import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/admin/login']

// List of routes that require admin role
const adminOnlyRoutes = ['/admin/users']

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isAuthPath = request.nextUrl.pathname.startsWith('/admin/login')
  const isAdminOnlyPath = adminOnlyRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // If it's an admin path but not auth path, check for token
  if (isAdminPath && !isAuthPath) {
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check for admin role on admin-only routes
    if (isAdminOnlyPath && token.role !== 'admin') {
      // Redirect to dashboard if not admin
      const dashboardUrl = new URL('/admin/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // If user is already logged in and tries to access login page, redirect to dashboard
  if (isAuthPath && token) {
    const dashboardUrl = new URL('/admin/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/admin/:path*']
} 