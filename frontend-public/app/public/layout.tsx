'use client'

import Link from 'next/link'
import TopBar from '@shared/components/TopBar'
import { useState, useEffect } from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  return (
    <div className="min-h-screen flex flex-col">
      {/* TopBar */}
      <div className={`fixed top-0 left-0 right-0 transition-transform duration-300 z-50 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <TopBar />
      </div>

      <div className="fixed top-6 left-6 w-20 h-20 z-50">
        <Link href="/" className="block w-full h-full transition-transform hover:scale-110">
        </Link>
      </div>

      <main className="flex-grow pt-15">
        {children}
      </main>
    </div>
  )
} 