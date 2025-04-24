import '../../shared/globals.css'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../shared/lib/auth'
import Providers from '../../shared/providers'

export const metadata = {
  title: 'EDSU House Art Gallery',
  description: '',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const headersList = headers()
  const path = headersList.get('x-invoke-path') || ''
  const isAdminRoute = path.startsWith('/admin')

  // For admin routes, ensure there's a session
  if (isAdminRoute && !session && path !== '/admin/login') {
    const url = new URL('/admin/login', 'http://localhost:5001')
    url.searchParams.set('callbackUrl', path)
    return Response.redirect(url)
  }

  return (
    <html lang="en" className="font-frutiger">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
