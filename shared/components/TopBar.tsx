'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Text } from './ui'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import LogoGif from '../logo/LOGO GERAK.gif'

const brandColors = {
  black: '#000000',
  green: '#85BAAC',
  white: '#ffffff',
  pink: '#EB008B'
}

interface NavItem {
  label: string
  href: string
}

interface Program {
  id: string
  title: string
  description: string
  media: Array<{ url: string }>
  startDate: string
  endDate: string
  isPublic: boolean
  status: string
}

const getActiveProgram = async (): Promise<Program | null> => {
  try {
    const response = await fetch('/api/programs?public=true', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Failed to fetch programs')
    const data = await response.json()
    
    // Find the first ongoing and public program
    const activeProgram = data.find((p: any) => 
      p.isPublic && 
      (p.status === 'ongoing' || p.status === 'scheduled') &&
      new Date(p.startDate) <= new Date() &&
      new Date(p.endDate) >= new Date()
    )

    if (!activeProgram) return null

    return {
      id: activeProgram._id,
      title: activeProgram.title,
      description: activeProgram.description,
      media: activeProgram.media.map((m: any) => ({ url: m.url })),
      startDate: activeProgram.startDate,
      endDate: activeProgram.endDate,
      isPublic: activeProgram.isPublic,
      status: activeProgram.status
    }
  } catch (error) {
    console.error('Error fetching active program:', error)
    return null
  }
}

export default function TopBar() {
  const pathname = usePathname()
  const [activeProgram, setActiveProgram] = useState<Program | null>(null)

  useEffect(() => {
    const fetchActiveProgram = async () => {
      const program = await getActiveProgram()
      setActiveProgram(program)
    }
    fetchActiveProgram()
  }, [])

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { 
      label: 'Programs', 
      href: activeProgram ? `/public/programs/${activeProgram.id}` : '/public/programs?public=true'
    },
    { label: 'TokoBuku YangTau', href: '/public/tokobuku' },
    { label: 'Merchandise', href: '/public/merchandise' },
    { label: 'About', href: '/public/edsu-house' }
  ]

  return (
    <header className="bg-[#85BAAC] w-full h-15">
      <div className="w-full h-full flex items-center justify-between px-8 lg:px-12">
        {/* Left side - Navigation Links */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group ${
                pathname === item.href ? 'text-[#EB008B]' : 'text-gray-600 hover:text-[#EB008B]'
              }`}
            >
              <Text variant="body" className="font-bold text-[#EB008B]">
                {item.label}
              </Text>
              {/* Underline animation */}
              <div 
                className={`absolute bottom-0 left-0 w-0 h-0.5 bg-[#EB008B] transition-all duration-300 group-hover:w-full ${
                  pathname === item.href ? 'w-full' : ''
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Right side - Logo */}
        <div className="flex items-center h-full py-2">
          <Image
            src={LogoGif}
            alt="EDSU Logo"
            width={100}
            height={50}
            className="object-contain"
          />
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1280px;
        }
      `}</style>
    </header>
  )
} 