import Image from 'next/image'
import { useState, useEffect } from 'react'
import GreenLogo from '../logo/EDSU_Asset_Logo_Green.png'
import WhiteLogo from '../logo/EDSU_Asset_Logo_White.png'
import PinkLogo from '../logo/EDSU_Asset_Logo_Pink.png'

const logos = [
  GreenLogo,
  WhiteLogo,
  PinkLogo
]

interface LoadingScreenProps {
  onLoadingComplete?: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [currentLogo, setCurrentLogo] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="w-64 h-64 relative">
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
                mixBlendMode: index === 2 ? 'difference' : 'normal', // Special handling for white logo
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}