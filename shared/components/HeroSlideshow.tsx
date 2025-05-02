'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Text } from '../components/ui'
import GreenLogo from '../logo/EDSU_Asset_Logo_Green.png'
import PinkLogo from '../logo/EDSU_Asset_Logo_Pink.png'
import { UIMedia } from './UIMedia'
import { UIMediaLocationId } from '../config/uiMediaLocations'

const logos = [
  GreenLogo,
  PinkLogo
]

interface HeroSection {
  id: string
  title: string
  description: string
  images: string[]
  link: string
  text?: string
  locationId?: string
}

interface HeroSlideshowProps {
  sections: HeroSection[]
}

export function HeroSlideshow({ sections }: HeroSlideshowProps) {
  const [activeSection, setActiveSection] = useState(0)
  const [activeImage, setActiveImage] = useState(0)
  const [currentLogo, setCurrentLogo] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [textRotation, setTextRotation] = useState(0)
  const [textScale, setTextScale] = useState(1)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [isManualNavigation, setIsManualNavigation] = useState(false)
  const autoScrollRef = useRef<NodeJS.Timeout>()
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  // Auto-scroll sections
  useEffect(() => {
    if (sections.length === 0) return

    const startAutoScroll = () => {
      if (isAutoplayPaused) return
      
      autoScrollRef.current = setInterval(() => {
        if (!isScrolling && !isAutoplayPaused) {
          handleNextSection(false)
        }
      }, 5000)
    }

    const stopAutoScroll = () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }

    // Start initial auto-scroll
    startAutoScroll()

    return () => stopAutoScroll()
  }, [sections.length, isAutoplayPaused, isScrolling])

  // Handle touch events for sliding
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setIsAutoplayPaused(true)
    setIsManualNavigation(true)
    
    // Clear any existing resume timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === 0 || isTransitioning) return
    
    const touchEnd = e.touches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) { // Threshold for slide
      if (diff > 0) {
        // Slide left - next section
        handleNextSection(true)
      } else {
        // Slide right - previous section
        handlePrevSection(true)
      }
      setTouchStart(0)
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(0)
    
    // Set a timeout to resume auto-scroll after 5 seconds of no interaction
    scrollTimeout.current = setTimeout(() => {
      setIsAutoplayPaused(false)
      setIsManualNavigation(false)
    }, 5000)
  }

  // Handle mouse wheel scrolling
  const handleWheel = (e: WheelEvent) => {
    if (isTransitioning) return
    
    setIsAutoplayPaused(true)
    setIsManualNavigation(true)

    // Clear any existing resume timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    // Check if it's a horizontal scroll (from mousepad) or shift+wheel
    const isHorizontalScroll = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey
    const delta = isHorizontalScroll ? e.deltaX : e.deltaY

    if (Math.abs(delta) > 30) {
      if (delta > 0) {
        handleNextSection(true)
      } else {
        handlePrevSection(true)
      }
    }

    // Set a timeout to resume auto-scroll after 5 seconds of no interaction
    scrollTimeout.current = setTimeout(() => {
      setIsAutoplayPaused(false)
      setIsManualNavigation(false)
    }, 5000)
  }

  // Navigation handlers
  const handleNextSection = (manual: boolean = false) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    
    // Only apply effects for auto-scroll
    if (!manual) {
    setTextRotation(Math.random() * 10 - 5)
    setTextScale(0.95 + Math.random() * 0.2)
    }

    setTimeout(() => {
      setActiveSection((prev) => (prev + 1) % sections.length)
      setActiveImage(0)
      setIsTransitioning(false)
    }, manual ? 300 : 500)
  }

  const handlePrevSection = (manual: boolean = false) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    
    // Only apply effects for auto-scroll
    if (!manual) {
      setTextRotation(Math.random() * 10 - 5)
      setTextScale(0.95 + Math.random() * 0.2)
  }

    setTimeout(() => {
      setActiveSection((prev) => (prev - 1 + sections.length) % sections.length)
      setActiveImage(0)
      setIsTransitioning(false)
    }, manual ? 300 : 500)
  }

  // Add wheel event listener
  useEffect(() => {
    const element = contentRef.current
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: true })
    }
    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel)
      }
    }
  }, [isTransitioning])

  // Logo rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      onMouseEnter={() => {
        setIsAutoplayPaused(true)
        // Clear any existing resume timeout
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current)
        }
      }}
      onMouseLeave={() => {
        // Set a timeout to resume auto-scroll after 5 seconds
        scrollTimeout.current = setTimeout(() => {
          setIsAutoplayPaused(false)
          setIsManualNavigation(false)
        }, 5000)
      }}
    >
      {/* Center Logo */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 w-20 h-20 z-50">
        {logos.map((logo, index) => (
          <div
            key={`logo-${index}`}
            className={`absolute inset-0 transition-all duration-300 ${
              index === currentLogo 
                ? 'opacity-100 transform-none' 
                : 'opacity-0 scale-90'
            }`}
          >
          <Image
              src={logo}
            alt="EDSU Logo"
              fill
            className="object-contain"
              style={{
                mixBlendMode: index === 2 ? 'difference' : 'normal'
              }}
          />
          </div>
        ))}
        </div>

      {/* Background Images and Content */}
      <div 
        className="relative w-full h-full touch-pan-x"
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`absolute inset-0 transition-all ${isManualNavigation ? 'duration-300' : 'duration-1000'} ease-in-out
              ${index === activeSection ? 'translate-x-0' : 'translate-x-full'}
              ${index < activeSection ? '-translate-x-full' : ''}
            `}
          >
            {/* Background Image - Either UIMedia or Image */}
            <div className="absolute inset-0">
              {section.locationId ? (
                <UIMedia
                  locationId={section.locationId as UIMediaLocationId}
                  alt={section.title}
                  width={1920}
                  height={1080}
                  className={`object-cover w-full h-full transition-opacity ${isManualNavigation ? 'duration-300' : 'duration-500'}
                    ${isTransitioning ? 'opacity-0' : 'opacity-100'}
                  `}
                  priority={index === activeSection}
                />
              ) : (
                <Image
                  src={section.images[activeImage]}
                  alt={section.title}
                  fill
                  className={`object-cover transition-opacity ${isManualNavigation ? 'duration-300' : 'duration-500'}
                    ${isTransitioning ? 'opacity-0' : 'opacity-100'}
                  `}
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <Link 
                href={section.link}
                className="text-center p-8 group"
                onMouseEnter={() => {
                  if (!isManualNavigation) {
                  setTextRotation(Math.random() * 20 - 10)
                  setTextScale(1.1 + Math.random() * 0.1)
                  }
                }}
                onMouseLeave={() => {
                  if (!isManualNavigation) {
                  setTextRotation(0)
                  setTextScale(1)
                  }
                }}
              >
                <div 
                  className="transition-all duration-500 ease-in-out relative"
                  style={{
                    transform: isManualNavigation ? 'none' : `rotate(${textRotation}deg) scale(${textScale})`,
                  }}
                >
                  <Text 
                    variant="glitch" 
                    className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 multicolor-text"
                  >
                    {section.title}
                  </Text>
                  <Text 
                    variant="lead"
                    className="text-xl md:text-2xl lg:text-3xl max-w-3xl mx-auto multicolor-text-desc"
                  >
                    {section.description}
                  </Text>

                  {section.text && (
                    <Text 
                      variant="body"
                      className="mt-8 text-lg md:text-xl text-white hover:text-[#10b981] transition-colors"
                    >
                      {section.text}
                    </Text>
                  )}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-3">
          {sections.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 
                ${index === activeSection ? 'multicolor-dot w-12' : 'bg-white/50 hover:bg-white/70'}
              `}
              onClick={() => {
                // Clear any existing resume timeout
                if (scrollTimeout.current) {
                  clearTimeout(scrollTimeout.current)
                }
                
                setIsManualNavigation(true)
                setIsAutoplayPaused(true)
                setIsTransitioning(true)
                
                setTimeout(() => {
                  setActiveSection(index)
                  setActiveImage(0)
                  setIsTransitioning(false)
                  
                  // Set a timeout to resume auto-scroll after 5 seconds
                  scrollTimeout.current = setTimeout(() => {
                    setIsManualNavigation(false)
                    setIsAutoplayPaused(false)
                  }, 5000)
                }, 300)
              }}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .multicolor-text {
          background: linear-gradient(
            45deg,
            #6EBDAF 20%,
            #6EBDAF 40%,
            #EB008B 40%,
            #EB008B 60%,
            #EB008B 80%,
            #6EBDAF 80%
          );
          background-size: 200% 200%;
          animation: gradientMove 8s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .multicolor-text-desc {
          background: linear-gradient(
            -45deg,
            #EB008B 20%,
            #EB008B 40%,
            #6EBDAF 40%,
            #6EBDAF 60%,
            #6EBDAF 80%,
            #EB008B 80%
          );
          background-size: 200% 200%;
          animation: gradientMove 8s linear infinite reverse;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .multicolor-dot {
          background: linear-gradient(
            90deg,
            #171717,
            #6EBDAF,
            #EB008B
          );
          background-size: 300% 100%;
          animation: gradientMove 4s linear infinite;
        }

        .nav-button {
          overflow: hidden;
        }

        .nav-button::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            45deg,
            #171717,
            #6EBDAF,
            #EB008B
          );
          background-size: 300% 300%;
          animation: gradientMove 0.5s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          border-radius: inherit;
        }

        .nav-button:hover::before {
          opacity: 1;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 200%; }
        }

        @keyframes textGlitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </div>
  )
}