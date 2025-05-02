'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LogOut, Image, BookOpen, Brush, LibraryBig, PartyPopper, ShoppingCart } from 'lucide-react'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    name: 'UI Media', 
    href: '/admin/ui-media',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    name: 'Media EDSU', 
    href: '/admin/media',
    icon: <Brush className="h-6 w-6" />
  },
  { 
    name: 'Articles', 
    href: '/admin/articles',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
      </svg>
    )
  },
  { 
    name: 'Programs', 
    href: '/admin/programs',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    name: 'Media TBYT', 
    href: '/admin/media-tbyt',
    icon: <LibraryBig className="h-6 w-6" />
  },
  { 
    name: 'Be Em', 
    href: '/admin/be-em',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    name: 'Party Literasi', 
    href: '/admin/party-literasi',
    icon: <PartyPopper className="h-6 w-6" />
  },
  { 
    name: 'Merchandise', 
    href: '/admin/merchandise',
    icon: <ShoppingCart className="h-6 w-6" />
  },
  { 
    name: 'Users', 
    href: '/admin/users',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  { 
    name: 'Visitors', 
    href: '/admin/visitors',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMinimized, setIsMinimized] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (!session) {
      router.replace('/admin/login')
      return
    }

    setIsLoading(false)
  }, [session, status, router])

  // Show loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6EBDAF]"></div>
      </div>
    )
  }

  // If no session, don't render anything (redirect will happen in useEffect)
  if (!session) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full z-50 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col ${
          isMinimized ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo area */}
        <div className="p-4 border-b flex items-center justify-between bg-[#6EBDAF]">
          <h1 className={`font-bold text-white ${isMinimized ? 'hidden' : 'block'}`}>
            EDSU HOUSE
          </h1>
          {/* Toggle button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[#6EBDAF]/80 rounded-lg text-white"
            title={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMinimized ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 transition-colors ${
                pathname === item.href
                  ? 'bg-[#6EBDAF]/10 text-[#6EBDAF]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span className={`ml-3 ${isMinimized ? 'hidden' : 'block'}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* User info and logout */}
        <div className={`p-4 border-t ${isMinimized ? 'text-center' : ''}`}>
          <div className={`text-sm font-medium text-gray-700 ${isMinimized ? 'hidden' : 'block'}`}>
            {session.user?.name}
          </div>
          <button
            onClick={() => router.push('/api/auth/signout')}
            className={`mt-2 text-sm text-red-600 hover:text-red-800 flex items-center gap-2 ${isMinimized ? 'w-full justify-center' : ''}`}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            {!isMinimized && 'Sign out'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 ${isMinimized ? 'ml-16' : 'ml-64'}`}>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 