// Client Components Wrappers
'use client'

import { Suspense, useEffect, useState } from 'react'
import {
  AspectRatio,
  Card,
  Container,
  Grid,
  Section,
  Text
} from '../../shared/components/ui'
import { HeroSlideshow } from '../../shared/components/HeroSlideshow'
import { ContactForm } from '../../shared/components/ContactForm'
import { LoadingScreen } from '../../shared/components/LoadingScreen'
import { UIMedia } from '../../shared/components/UIMedia'

// This allows the page to be dynamic and fetch fresh data on each request
// export const revalidate = 0

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

interface HeroSection {
  id: string
  title: string
  description: string
  images: string[]
  link: string
  text?: string
  locationId?: string
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

// Static sections that will be combined with dynamic program section
const staticSections: HeroSection[] = [
  {
    id: 'edsu-house',
    title: '3D5U hou53',
    description: 'tentang kami, mereka, dan kita',
    images: ['/images/placeholder/edsu1.jpg'],
    link: '/public/edsu-house',
    locationId: 'home.hero.edsu'
  },
  {
    id: 'tokobuku',
    title: 'ToKo8uKu Y6n9T6u',
    description: 'kunjungi toko buku',
    images: ['/images/placeholder/book1.jpg'],
    link: '/public/tokobuku',
    locationId: 'home.hero.tokobuku'
  },
  {
    id: 'merchandise',
    title: 'M3rchandi53',
    description: 'untuk dibawa pulang dan dikenang',
    images: ['/images/placeholder/merch1.jpg'],
    link: '/public/merchandise',
    locationId: 'home.hero.merchandise'
  }
]

function HeroSection({ sections }: { sections: HeroSection[] }) {
  return (
    <Section className="h-screen relative">
      <HeroSlideshow sections={sections} />
    </Section>
  )
}

function ContactSection() {
  return (
    <Card className="p-6">
      <Text variant="heading" className="mb-6">Contact Us</Text>
      <ContactForm />
    </Card>
  )
}

export default function Home() {
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const activeProgram = await getActiveProgram()
        
        // Combine the active program with static sections
        const sections = [
          // Active program section if exists - keep this dynamic without locationId
          activeProgram ? {
            id: activeProgram.id,
            title: activeProgram.title,
            description: "Kunjungi Program",
            images: activeProgram.media.map(m => m.url),
            link: `/public/programs/${activeProgram.id}`
          } : {
            id: 'no-program',
            title: 'Program',
            description: 'Kunjungi Program',
            images: ['/placeholder/program1.jpg'],
            link: '/public/programs/${activeProgram.id}',
            text: ""
          },
          // Static sections
          ...staticSections
        ]
        
        setHeroSections(sections)
      } catch (error) {
        console.error('Error setting up hero sections:', error)
        // Show fallback sections even if there's an error
        setHeroSections([
          {
            id: 'no-program',
            title: 'Program',
            description: 'Kunjungi Program',
            images: ['/placeholder/program1.jpg'],
            link: '/public/programs',
            text: "Lihat seluruh program"
          },
          ...staticSections
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="relative">
        <Suspense fallback={<div className="h-screen bg-black" />}>
          <HeroSection sections={heroSections} />
        </Suspense>
      </div>
    </div>
  )
}
