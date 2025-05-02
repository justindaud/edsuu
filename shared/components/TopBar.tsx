'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Text } from './ui'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import LogoGif from '../logo/LOGO GERAK.gif'
import { Container, Grid } from './ui'

const brandColors = {
  black: '#000000',
  green: '#6EBDAF',
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

    // Return active program if found
    if (activeProgram) {
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
    }

    // Fallback: Find the nearest upcoming public program if no active program
    const now = new Date()
    const upcomingPrograms = data
      .filter((p: any) => 
        p.isPublic && 
        (p.status === 'scheduled') &&
        new Date(p.startDate) > now
      )
      .sort((a: any, b: any) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
    
    const nearestUpcoming = upcomingPrograms.length > 0 ? upcomingPrograms[0] : null
    
    if (nearestUpcoming) {
      return {
        id: nearestUpcoming._id,
        title: nearestUpcoming.title,
        description: nearestUpcoming.description,
        media: nearestUpcoming.media.map((m: any) => ({ url: m.url })),
        startDate: nearestUpcoming.startDate,
        endDate: nearestUpcoming.endDate,
        isPublic: nearestUpcoming.isPublic,
        status: nearestUpcoming.status
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching active program:', error)
    return null
  }
}

export default function TopBar() {
  const pathname = usePathname()
  const [activeProgram, setActiveProgram] = useState<Program | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoClicked, setLogoClicked] = useState(false)
  const logoRotationRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const directionRef = useRef<number>(1) // 1 for clockwise, -1 for counterclockwise
  const [isHovered, setIsHovered] = useState(false)
  const maxRotation = 15 // Maximum rotation in degrees (both directions)

  // Random rotation animation
  useEffect(() => {
    let lastTime = 0
    const intervalBase = 300; // Time in ms to switch rotation direction
    let nextDirectionChange = intervalBase + Math.random() * 200; // Random interval

    const animateLogo = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      // If clicked and menu is open, stop animation
      if (logoClicked && menuOpen) return;
      
      nextDirectionChange -= deltaTime;
      
      // Change direction if time elapsed or if reaching max rotation angle
      if (nextDirectionChange <= 0 || 
          Math.abs(logoRotationRef.current) >= maxRotation) {
        directionRef.current = -directionRef.current;
        nextDirectionChange = intervalBase + Math.random() * 200;
      }
      
      // Base rotation speed and faster when hovered
      const rotationSpeed = isHovered ? 0.8 : 0.3;
      
      // Update rotation with bounds check
      const newRotation = logoRotationRef.current + rotationSpeed * directionRef.current;
      
      // Ensure we don't exceed max rotation
      if (Math.abs(newRotation) <= maxRotation) {
        logoRotationRef.current = newRotation;
      } else {
        // If we would exceed max, reverse direction
        directionRef.current = -directionRef.current;
      }
      
      // Apply rotation to logo if element exists
      const logoElement = document.getElementById('logo-button');
      if (logoElement) {
        logoElement.style.transform = `rotate(${logoRotationRef.current}deg)`;
      }
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animateLogo);
    };
    
    // Start animation
    if (!logoClicked || !menuOpen) {
      animationFrameRef.current = requestAnimationFrame(animateLogo);
    }
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [logoClicked, isHovered, menuOpen]);

  useEffect(() => {
    const fetchActiveProgram = async () => {
      const program = await getActiveProgram()
      setActiveProgram(program)
    }
    fetchActiveProgram()
  }, [])

  useEffect(() => {
    // Close menu when route changes
    setMenuOpen(false)
  }, [pathname])

  const handleLogoClick = () => {
    if (menuOpen) {
      // When closing menu, reset animation state
      setLogoClicked(false);
    } else {
      // When opening menu, stop animation temporarily
      setLogoClicked(true);
    }
    setMenuOpen(!menuOpen);
    
    // Reset rotation
    const logoElement = document.getElementById('logo-button');
    if (logoElement) {
      logoElement.style.transform = 'rotate(0deg)';
      logoRotationRef.current = 0;
    }
  }

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { 
      label: 'Programs', 
      href: activeProgram ? `/public/programs/${activeProgram.id}` : '/public/programs?public=true'
    },
    { label: 'TokoBuku YangTau', href: '/public/tokobuku' },
    { label: 'Merchandise', href: '/public/merchandise' },
    { label: 'Tentang Kami', href: '/public/edsu-house' }
  ]

  return (
    <div className="w-full">
      {/* Logo as a toggle button (always visible) */}
      <div className="fixed top-4 right-4 z-50 cursor-pointer">
        <button 
          onClick={handleLogoClick} 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="bg-transparent border-none p-0 focus:outline-none relative group"
          aria-label="Toggle navigation menu"
        >
          <Image
            id="logo-button"
            src={LogoGif}
            alt="EDSU Logo"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
          <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[#EB008B] transition-all duration-300 animate-pulse"></div>
        </button>
      </div>

      {/* Navigation menu (hidden by default) */}
      <div 
        className={`fixed top-0 right-0 w-full bg-[#6EBDAF] bg-opacity-100 backdrop-blur-sm shadow-sm transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Container size='full' className="py-4">
          <nav className="w-full flex flex-col md:flex-row md:items-center md:space-x-8 space-y-3 md:space-y-0 pt-16 md:pt-4 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-2 relative group ${
                  pathname === item.href ? 'text-[#EB008B]' : 'text-[#EB008B] hover:text-white'
                } transition-colors duration-200`}
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
        </Container>
      </div>
    </div>
  )
} 