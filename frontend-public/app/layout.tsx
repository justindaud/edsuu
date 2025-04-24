import '../../shared/globals.css'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../shared/lib/auth'
import Providers from '../../shared/providers'
import { Footer } from '@shared/components/Footer'

export const metadata = {
  title: 'EDSU House Art Gallery',
  description: '',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const path = headersList.get('x-invoke-path') || ''
  const session = await getServerSession(authOptions)
  const isAdminRoute = path.startsWith('/admin')


  return (
    <html lang="en" className="font-frutiger">
      <body>
        <Providers session={session}>
          <div className="min-h-screen flex flex-col">
            

            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
} 
