'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BlackLogo from '../logo/EDSU_Asset_Logo_Black.png'
import GreenLogo from '../logo/EDSU_Asset_Logo_Green.png'
import WhiteLogo from '../logo/EDSU_Asset_Logo_White.png'
import PinkLogo from '../logo/EDSU_Asset_Logo_Pink.png'

const logos = [
  BlackLogo,
  GreenLogo,
  WhiteLogo,
  PinkLogo
]


const brandColors = {
  black: '#000000',
  green: '#10b981',
  white: '#ffffff',
  pink: '#ec4899'
}

export function MorphingLogo() {
  const [currentLogo, setCurrentLogo] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    // Change logo every 2 seconds
    const interval = setInterval(() => {
      setIsTransitioning(true)
      
      // Random effects
      setRotation(Math.random() * 30 - 15) // -15 to 15 degrees
      setScale(0.9 + Math.random() * 0.3) // 0.9 to 1.2

      setTimeout(() => {
        setCurrentLogo((prev) => (prev + 1) % logos.length)
        setIsTransitioning(false)
      }, 300)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/" className="group fixed top-8 right-8 z-30 w-32 h-32 cursor-pointer">
      <div 
        className="relative w-full h-full transition-all duration-500 group-hover:scale-125"
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: 'all 0.5s ease-in-out',
        }}
      >
        {/* Dramatic glow effect rings */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-[-50%] animate-glow-ring-1 rounded-full" />
          <div className="absolute inset-[-75%] animate-glow-ring-2 rounded-full" />
          <div className="absolute inset-[-100%] animate-glow-ring-3 rounded-full" />
          <div className="absolute inset-[-125%] animate-glow-ring-4 rounded-full" />
        </div>

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

      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes glow-ring-1 {
          0%, 100% {
            box-shadow: 0 0 20px ${brandColors.black},
                        0 0 40px ${brandColors.black};
            transform: rotate(0deg);
          }
          50% {
            box-shadow: 0 0 40px ${brandColors.green},
                        0 0 80px ${brandColors.green};
            transform: rotate(180deg);
          }
        }

        @keyframes glow-ring-2 {
          0%, 100% {
            box-shadow: 0 0 20px ${brandColors.green},
                        0 0 40px ${brandColors.green};
            transform: rotate(90deg);
          }
          50% {
            box-shadow: 0 0 40px ${brandColors.white},
                        0 0 80px ${brandColors.white};
            transform: rotate(270deg);
          }
        }

        @keyframes glow-ring-3 {
          0%, 100% {
            box-shadow: 0 0 20px ${brandColors.white},
                        0 0 40px ${brandColors.white};
            transform: rotate(180deg);
          }
          50% {
            box-shadow: 0 0 40px ${brandColors.pink},
                        0 0 80px ${brandColors.pink};
            transform: rotate(360deg);
          }
        }

        @keyframes glow-ring-4 {
          0%, 100% {
            box-shadow: 0 0 20px ${brandColors.pink},
                        0 0 40px ${brandColors.pink};
            transform: rotate(270deg);
          }
          50% {
            box-shadow: 0 0 40px ${brandColors.black},
                        0 0 80px ${brandColors.black};
            transform: rotate(450deg);
          }
        }

        .animate-glow-ring-1 {
          animation: glow-ring-1 4s infinite;
        }
        .animate-glow-ring-2 {
          animation: glow-ring-2 4s infinite 1s;
        }
        .animate-glow-ring-3 {
          animation: glow-ring-3 4s infinite 2s;
        }
        .animate-glow-ring-4 {
          animation: glow-ring-4 4s infinite 3s;
        }
      `}</style>
    </Link>
  )
} 