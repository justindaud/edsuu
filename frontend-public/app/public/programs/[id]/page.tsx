'use client'

import { Container, Grid, Text } from '../../../../../shared/components/ui'
import { ImageSlider } from '../../../../../shared/components/ImageSlider'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { LoadingScreen } from '../../../../../shared/components/LoadingScreen'

interface Program {
  id: string
  title: string
  description: string
  media: Array<{ url: string }>
  startDate: string
  endDate: string
  isPublic: boolean
  status: string
  articles?: Array<{
    _id: string
    title: string
    content: string
    excerpt?: string
    createdAt: string
    author?: { name: string }
  }>
}

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  programId: string
  media: Array<{ url: string; thumbnailUrl?: string }>
  coverImage?: string
  createdAt?: string
  publishedAt?: string
}

const getCurrentProgram = async (id: string): Promise<Program> => {
  const response = await fetch(`/api/programs/${id}?public=true&populate.media`)
  if (!response.ok) throw new Error('Failed to fetch program')
  const data = await response.json()
  return {
    id: data._id,
    title: data.title,
    description: data.description,
    media: data.media || [],
    startDate: data.startDate,
    endDate: data.endDate,
    isPublic: data.isPublic,
    status: data.status,
    articles: data.articles || []
  }
}

const getAllPrograms = async (): Promise<Program[]> => {
  const response = await fetch('/api/programs?public=true')
  if (!response.ok) throw new Error('Failed to fetch programs')
  const data = await response.json()
  return data.map((program: any) => ({
    id: program._id,
    title: program.title,
    description: program.description,
    media: program.media || [],
    startDate: program.startDate,
    endDate: program.endDate,
    isPublic: program.isPublic,
    status: program.status
  }))
}

const brandColors = {
  black: '#000000',
  green: '#6EBDAF',
  white: '#ffffff',
  pink: '#EB008B'
}

export default function () {
  const params = useParams()
  const [program, setProgram] = useState<Program | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [allPrograms, setAllPrograms] = useState<Program[]>([])
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const timelineRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const autoScrollRef = useRef<NodeJS.Timeout>()
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [programData, programsData] = await Promise.all([
          getCurrentProgram(params.id as string),
          getAllPrograms()
        ])
        console.log('Program Data:', programData)
        console.log('Program Media:', programData.media) // Detailed media logging
        setProgram(programData)
        // Sort programs by start date (earliest first)
        const sortedPrograms = programsData.sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        setAllPrograms(sortedPrograms)
        
        if (programData.articles) {
          console.log('Articles Data:', programData.articles)
          setArticles(programData.articles.map((article: any) => ({
            id: article._id,
            title: article.title,
            content: article.content || '',
            excerpt: article.excerpt || article.content?.substring(0, 50) + '...' || '',
            author: article.author?.name || 'EDSU Team',
            programId: params.id as string,
            media: article.media?.map((m: any) => ({ 
              url: m.url,
              thumbnailUrl: m.thumbnailUrl 
            })) || [],
            coverImage: article.coverImage,
            createdAt: article.createdAt,
            publishedAt: article.publishedAt
          })))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Program not found or not available')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  // Auto-scroll articles
  useEffect(() => {
    if (articles.length === 0 || !contentRef.current) return

    const startAutoScroll = () => {
      if (!autoScrollEnabled) return
      
      autoScrollRef.current = setInterval(() => {
        if (!isScrolling && contentRef.current && autoScrollEnabled) {
          const articleWidth = 400 // Width of one article including padding
          const newPosition = contentRef.current.scrollLeft + articleWidth

          // If we've scrolled through all original articles, reset to start
          if (newPosition >= articleWidth * articles.length) {
            contentRef.current.scrollTo({ left: 0, behavior: 'instant' })
          } else {
            contentRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
          }
        }
      }, 3000)
    }

    const stopAutoScroll = () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }

    // Handle scroll events
    const handleScroll = () => {
      setIsScrolling(true)
      stopAutoScroll()
      
      // Only restart if auto-scroll is still enabled
      if (autoScrollEnabled) {
        setTimeout(() => {
          setIsScrolling(false)
          startAutoScroll()
        }, 3000)
      }
    }

    // Add scroll event listener
    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', handleScroll)
      startAutoScroll()
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('scroll', handleScroll)
      }
      stopAutoScroll()
    }
  }, [articles, autoScrollEnabled])

  // Auto-slide timeline
  useEffect(() => {
    if (!timelineRef.current || allPrograms.length === 0) return
    
    const scrollAmount = 300 // pixels to scroll each time
    const interval = setInterval(() => {
      if (timelineRef.current) {
        const maxScroll = timelineRef.current.scrollWidth - timelineRef.current.clientWidth
        const newPosition = timelineRef.current.scrollLeft + scrollAmount

        if (newPosition >= maxScroll) {
          // Reset to start when reaching the end
          timelineRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          // Smooth scroll to next position
          timelineRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
        }
      }
    }, 3000) // Scroll every 3 seconds

    return () => clearInterval(interval)
  }, [allPrograms])

  const handlePrevArticle = () => {
    setCurrentArticleIndex((prev) => {
      // Calculate the previous position
      const prevIndex = prev - 1
      // If we've moved before the first article, go to the last one
      if (prevIndex < 0) {
        return articles.length - 1
      }
      return prevIndex
    })
  }

  const handleNextArticle = () => {
    setCurrentArticleIndex((prev) => {
      // Calculate the next position
      const nextIndex = prev + 1
      // If we've moved past the last article, reset to 0
      if (nextIndex >= articles.length) {
        return 0
      }
      return nextIndex
    })
  }

  const handleTimelineScroll = (direction: 'left' | 'right') => {
    if (!timelineRef.current) return
    const scrollAmount = 300
    timelineRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

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

  if (!program) {
    return null
  }

  return (
    <div className="min-h-screen bg-green relative overflow-hidden">
      {/* Main Content */}
      <div className="relative min-h-[100vh]">
        <Grid cols={1} className="h-full">
          {/* Image Slider - Full width */}
          <div className="col-span-1 relative h-[100vh] overflow-hidden">
            <div className="absolute inset-0">
              {program.media && program.media.length > 0 ? (
                <ImageSlider 
                  images={program.media.map(m => m.url)} 
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Text variant="body" className="text-gray-400">No images available</Text>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 text-[#EB008B] z-10">
              <Text variant="heading" className="text-4xl font-bold mb-4">{program.title}</Text>
              <Text variant="heading" className="text-lg">{program.description}</Text>
              {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
            </div>
          </div>
        </Grid>
      </div>

      {/* Articles Section */}
      <div className="relative bg-[#6EBDAF] py-4">
        <Container className="w-full max-w-none px-0">
          {articles.length > 0 ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div 
                ref={contentRef}
                className="h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth mx-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex space-x-8">
                  {/* Original articles */}
                  {articles.map((article, index) => (
                    <div 
                      key={`original-${article.id}`}
                      className="flex-none w-[500px] p-6 relative group snap-center"
                      onMouseEnter={() => {
                        setAutoScrollEnabled(false)
                        if (autoScrollRef.current) {
                          clearInterval(autoScrollRef.current)
                        }
                      }}
                    >
                      <Link 
                        href={`/public/articles/${article.id}`}
                        className="block h-full"
                      >
                        <div className="h-full flex flex-col relative z-10 article-card overflow-hidden">
                          {/* Article Image with Title Overlay */}
                          <div className="relative aspect-[16/9] -mx-6 -mt-6">
                            {((article.media && article.media.length > 0) || article.coverImage) ? (
                              <div className="absolute inset-0">
                                <img
                                  src={article.media?.[0]?.url || article.coverImage}
                                  alt={article.title}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                <Text variant="body" className="text-gray-400">No images</Text>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          </div>
                          
                          {/* Article Content */}
                          <div className="flex-1 p-4 pt-2">
                          <Text variant="heading" className="text-xl font-semibold text-black">{article.title}</Text>
                            <Text variant="body" className="mt-1 text-gray-600 text-sm line-clamp-2">
                              {article.excerpt}
                            </Text>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                  
                  {/* Duplicate articles for seamless loop - only if more than 1 article */}
                  {articles.length > 3 && articles.map((article, index) => (
                    <div 
                      key={`duplicate-${article.id}`}
                      className="flex-none w-[500px] p-6 relative group snap-center"
                      onMouseEnter={() => {
                        setAutoScrollEnabled(false)
                        if (autoScrollRef.current) {
                          clearInterval(autoScrollRef.current)
                        }
                      }}
                    >
                      <Link 
                        href={`/public/articles/${article.id}`}
                        className="block h-full"
                      >
                        <div className="h-full flex flex-col relative z-10 article-card overflow-hidden">
                          {/* Article Image with Title Overlay */}
                          <div className="relative aspect-[16/9] -mx-6 -mt-6">
                            {((article.media && article.media.length > 0) || article.coverImage) ? (
                              <div className="absolute inset-0">
                                <img
                                  src={article.media?.[0]?.url || article.coverImage}
                                  alt={article.title}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                <Text variant="body" className="text-gray-400">No images</Text>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          </div>
                          
                          {/* Article Content */}
                          <div className="flex-1 p-4 pt-2">
                            <Text variant="heading" className="text-xl font-semibold text-black">{article.title}</Text>
                            <Text variant="body" className="mt-1 text-gray-600 text-sm line-clamp-2">
                              {article.excerpt}
                            </Text>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <Text variant="body" className="text-gray-500">No articles yet</Text>
            </div>
          )}
        </Container>
      </div>

      {/* Programs Timeline */}
      <div className="relative bg-[#6EBDAF] py-16 z-10 w-full">
        <Container size="full">
          <div className="relative w-full px-8">
            {/* Timeline Line */}
            <div className="absolute h-0.5 bg-black/20 w-[90%] top-[50%] -translate-y-[-9px]" />
            
            {/* Timeline Content */}
            <div 
              ref={timelineRef}
              className="relative w-[90%] mx-auto py-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allPrograms.map((prog, index) => {
                const totalItems = allPrograms.length;
                let position;
                if (totalItems === 1) {
                  position = 50;
                } else {
                  const spacing = 100 / (totalItems + 1);
                  position = spacing * (index + 1);
                }

                const isActive = prog.id === program.id;
                const startDate = new Date(prog.startDate);
                const endDate = new Date(prog.endDate);
                const isPast = endDate < new Date();
                const isCurrent = startDate <= new Date() && endDate >= new Date();
                const isFuture = startDate > new Date();

                return (
                  <Link
                    key={prog.id}
                    href={`/public/programs/${prog.id}`}
                    className="absolute group flex flex-col items-center cursor-pointer"
                    style={{ 
                      left: `${position}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >

                    {/* Dot */}
                    <div className={`w-5 h-5 rounded-full 
                      ${isActive ? 'bg-[#EB008B]' : isCurrent ? 'bg-black' : isPast ? 'bg-black/30' : 'bg-black'} 
                      transition-all duration-300 z-10
                      group-hover:bg-[#EB008B] group-hover:scale-125
                      ${isActive ? 'group-hover:animate-activeDot' : 'group-hover:animate-activeDot'}`} 
                    />

                    {/* Title */}
                    <div className="mt-6 whitespace-nowrap">
                      <Text variant="heading" className={`transition-all duration-300 font-bold
                        ${isActive ? 'text-[#EB008B] scale-110' : 'text-black/70'}
                        group-hover:text-[#EB008B] group-hover:scale-110
                        ${isActive ? 'group-hover:animate-activeTitle' : 'group-hover:animate-activeTitle'}`}>
                        {prog.title}
                      </Text>
                    </div>

                    {/* Hover Card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-30">
                      <div className="program-card">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          {prog.media[0] ? (
                            <img
                              src={prog.media[0].url}
                              alt={prog.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Text variant="body" className="text-gray-400">No image</Text>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <Text variant="heading" className="text-xl font-bold text-white">{prog.title}</Text>
                          </div>
                        </div>
                        <div className="p-4">
                          <Text variant="body" className="text-gray-600 text-sm mb-2">
                            {prog.description.length > 100 ? prog.description.substring(0, 100) + '...' : prog.description}
                          </Text>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{startDate.toLocaleDateString()}</span>
                            <span>-</span>
                            <span>{endDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      </div>

      <style jsx global>{`
        @layer components {
          .group:hover .animate-activeDot {
            animation: none;
          }
          .group:hover .animate-activeTitle {
            animation: none;
          }
        }

        .program-card {
          background: white;
          border-radius: 0;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
          width: 320px;
          transform: translateY(-50%);
        }

        .program-card:hover {
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 25px 30px rgba(0, 0, 0, 0.2);
        }

        .article-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 0;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          background-image: linear-gradient(
            135deg,
            ${brandColors.white} 100%,
          );
          background-size: 300% 300%;
          animation: gradientMove 8s linear infinite;
        }

        .article-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.2);
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Hide scrollbar for timeline */
        .overflow-x-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
} 