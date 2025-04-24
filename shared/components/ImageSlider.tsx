'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AspectRatio } from '../components/ui'

interface ImageSliderProps {
  images: string[]
  interval?: number
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9'
  className?: string
}

export function ImageSlider({ 
  images, 
  interval = 5000,
  aspectRatio = '4:3',
  className = ''
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images.length) {
    return (
      <AspectRatio ratio={aspectRatio}>
        <div className={`w-full h-full bg-gray-100 ${className}`} />
      </AspectRatio>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div className="absolute inset-0">
        <Image
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          fill
          className="object-cover w-full h-full"
          sizes="100vw"
          priority
        />
      </div>

      {/* Navigation Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 
                ${index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 