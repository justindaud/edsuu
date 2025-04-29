'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { uiMediaLocations, UIMediaLocationId } from '../config/uiMediaLocations'

interface UIMediaProps {
  locationId: UIMediaLocationId
  className?: string
  width?: number
  height?: number
  alt?: string
  index?: number // For when a location has multiple images (e.g., slider images)
  priority?: boolean
}

interface MediaItem {
  _id: string
  locationId?: string
  locationIds?: string[]
  index: number
  url: string
  thumbnailUrl: string
  title: string
  description: string
}

export function UIMedia({ 
  locationId, 
  className = '', 
  width = 1200, 
  height = 800, 
  alt = '', 
  index = 0,
  priority = false
}: UIMediaProps) {
  const [media, setMedia] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the location config for default image
  const locationConfig = uiMediaLocations[locationId]
  const defaultImage = locationConfig?.defaultPath || '/placeholder/default.jpg'

  useEffect(() => {
    const fetchMediaByLocation = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002'
        const response = await fetch(
          `${backendUrl}/api/ui-media/by-location/${locationId}?index=${index}`,
          { cache: 'no-store' }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch media')
        }
        
        const data = await response.json()
        setMedia(data)
      } catch (error) {
        console.error(`Error fetching UI media for location ${locationId}:`, error)
        setError('Failed to load media')
      } finally {
        setLoading(false)
      }
    }

    fetchMediaByLocation()
  }, [locationId, index])

  // During loading, show a skeleton
  if (loading) {
    return <div className={`animate-pulse bg-gray-200 ${className}`} style={{ width, height }} />
  }

  // If error or no media found, use the default image
  if (error || !media) {
    return (
      <Image 
        src={defaultImage}
        alt={alt || locationConfig?.title || 'Image'}
        className={className}
        width={width}
        height={height}
        priority={priority}
      />
    )
  }

  // Show the media from the database
  return (
    <Image
      src={media.thumbnailUrl || media.url}
      alt={alt || media.title || locationConfig?.title || 'UI Media'}
      className={className}
      width={width}
      height={height}
      priority={priority}
    />
  )
} 