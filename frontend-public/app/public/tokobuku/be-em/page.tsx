'use client'

import { Container, Grid, Card, Text } from '../../../../../shared/components/ui'
import { ImageSlider } from '../../../../../shared/components/ImageSlider'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { LoadingScreen } from '../../../../../shared/components/LoadingScreen'

interface Book {
  _id: string
  title: string
  year: number
  author: string
  price: number
  description: string
  mediaId: string
  media: string[]
  reviews: {
    reviewer: string
    text: string
    createdAt: string
  }[]
  isAvailable: boolean
  relatedPrograms: string[]
  relatedPartyLiterasi: string[]
  createdAt: string
  updatedAt: string
}

interface Media {
  _id: string
  url: string
  thumbnailUrl?: string
}

interface Program {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  media: {
    _id: string
    title: string
    url: string
    thumbnailUrl: string
  }[]
  isPublic: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export default function BeEmPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allReviews, setAllReviews] = useState<{ reviewer: string; text: string; createdAt: string; bookTitle: string }[]>([])
  const reviewSliderRef = useRef<HTMLDivElement>(null)

  const handleReviewScroll = (direction: 'left' | 'right') => {
    if (reviewSliderRef.current) {
      const scrollAmount = 300
      const currentScroll = reviewSliderRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      reviewSliderRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch books and programs
        const [booksResponse, programsResponse] = await Promise.all([
          fetch('/api/be-em'),
          fetch('/api/programs?public=true')
        ])

        if (!booksResponse.ok || !programsResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const [booksData, programsData] = await Promise.all([
          booksResponse.json(),
          programsResponse.json()
        ])

        // Filter books that are related to ongoing programs
        const ongoingProgramIds = programsData
          .filter((p: Program) => p.status === 'ongoing')
          .map((p: Program) => p._id)
        
        const now = new Date()
        const upcomingProgramIds = programsData
          .filter((p: any) =>
            p.isPublic &&
            p.status === 'scheduled' &&
            new Date(p.startDate) > now
          )
          .sort((a: any, b: any) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
        
        const nearestUpcoming = upcomingProgramIds.length > 0 ? upcomingProgramIds[0] : null
          

        const filteredBooks = booksData.filter((book: Book) => {
          if (ongoingProgramIds.length > 0) {
            return (
              book.relatedPrograms.some(id => ongoingProgramIds.includes(id))
            );
          } else if (ongoingProgramIds.length === 0) {
            return (
              book.relatedPrograms.includes(nearestUpcoming._id)
            );
          }
          return false
        })

        // Extract all reviews from books
        const reviews = filteredBooks.flatMap((book: Book) => 
          book.reviews.map((review: { reviewer: string; text: string; createdAt: string }) => ({
            ...review,
            bookTitle: book.title
          }))
        )
        setAllReviews(reviews)

        // Try to fetch media if we have books
        if (filteredBooks.length > 0) {
          try {
            const mediaResponse = await fetch('/api/media-tbyt')
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json()
              setMedia(mediaData)
            }
          } catch (mediaError) {
            console.warn('Failed to fetch media, continuing without it:', mediaError)
          }
        }

        setBooks(filteredBooks)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load books')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <Container className="py-16">
        <Text variant="heading" className="text-2xl text-center text-red-500">{error}</Text>
      </Container>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Container className="py-12">
        <Text variant="heading" className="mb-6">Be Em</Text>
        <Text variant="lead" className="mb-8">
          Curated books related to our ongoing programs.
        </Text>

        {/* Books Grid */}
        <Grid cols={4} className="gap-6">
          {books.map((book) => (
            <Link href={`/tokobuku/be-em/${book._id}`} key={book._id}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="aspect-[3/4] relative">
                  {media.find(m => m._id === book.mediaId)?.thumbnailUrl ? (
                    <Image
                      src={media.find(m => m._id === book.mediaId)?.thumbnailUrl || ''}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <Text variant="heading" className="text-lg mb-2">{book.title}</Text>
                  <Text variant="body" className="text-sm text-gray-600">
                    {book.author} ({book.year})
                  </Text>
                  <Text variant="body" className="text-sm font-medium text-[#6EBDAF] mt-2">
                    {book.description.length > 100 ? book.description.substring(0, 100) + '...' : book.description}
                  </Text>
                </div>
              </Card>
            </Link>
          ))}
        </Grid>

        {/* Reviews Section */}
        {allReviews.length > 0 && (
          <div className="relative bg-white py-16">
            <Text variant="heading" className="text-2xl font-bold mb-8">Book Reviews</Text>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute h-1 bg-[#6EBDAF]/20 w-full top-1/2 -translate-y-1/2" />
              
              {/* Navigation Buttons */}
              {allReviews.length > 1 && (
                <>
                  <button
                    onClick={() => handleReviewScroll('left')}
                    className="absolute left-0 top-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transform -translate-y-1/2 transition-all hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleReviewScroll('right')}
                    className="absolute right-0 top-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transform -translate-y-1/2 transition-all hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
              
              {/* Reviews Content */}
              <div 
                ref={reviewSliderRef}
                className={`relative flex ${allReviews.length === 1 ? 'justify-center' : 'gap-8 overflow-x-hidden'} pb-8 px-12 scroll-smooth`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {allReviews.map((review, index) => (
                  <div
                    key={index}
                    className="flex-none w-72 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100"
                  >
                    <div className="p-6">
                      <Text variant="heading" className="text-lg font-semibold mb-2">{review.bookTitle}</Text>
                      <Text variant="body" className="text-sm text-gray-600 mb-4">
                        "{review.text.length > 150 ? review.text.substring(0, 150) + '...' : review.text}"
                      </Text>
                      <Text variant="body" className="text-xs text-gray-500">
                        - {review.reviewer}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
} 