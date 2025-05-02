'use client'

import { Container, Grid, Text } from '../../../../../shared/components/ui'
import { ImageSlider } from '../../../../../shared/components/ImageSlider'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { LoadingScreen } from '../../../../../shared/components/LoadingScreen'

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

const getArticle = async (id: string): Promise<Article> => {
  const response = await fetch(`/api/articles/${id}?public=true`)
  if (!response.ok) throw new Error('Failed to fetch article')
  const data = await response.json()
  return {
    id: data._id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt || data.content?.substring(0, 50) + '...' || '',
    author: data.author?.name || 'EDSU Team',
    programId: data.programId,
    media: data.media?.map((m: any) => ({ 
      url: m.url,
      thumbnailUrl: m.thumbnailUrl 
    })) || [],
    coverImage: data.coverImage,
    createdAt: data.createdAt,
    publishedAt: data.publishedAt
  }
}

const getRecentArticles = async (): Promise<Article[]> => {
  const response = await fetch(`/api/articles?public=true&limit=10`)
  if (!response.ok) throw new Error('Failed to fetch articles')
  const data = await response.json()
  
  return data.map((article: any) => ({
    id: article._id,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt || article.content?.substring(0, 50) + '...' || '',
    author: article.author?.name || 'EDSU Team',
    programId: article.programId,
    media: article.media?.map((m: any) => ({ 
      url: m.url,
      thumbnailUrl: m.thumbnailUrl 
    })) || [],
    coverImage: article.coverImage,
    createdAt: article.createdAt,
    publishedAt: article.publishedAt
  }))
}

const brandColors = {
  black: '#000000',
  green: '#6EBDAF',
  white: '#ffffff',
  pink: '#EB008B'
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const autoScrollRef = useRef<NodeJS.Timeout>()
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [articleData, articlesData] = await Promise.all([
          getArticle(params.id as string),
          getRecentArticles()
        ])
        setArticle(articleData)
        
        // Filter out the current article from related articles
        const filteredArticles = articlesData.filter(a => a.id !== params.id)
        setRelatedArticles(filteredArticles)
      } catch (error) {
        console.error('Error fetching article:', error)
        setError('Article not found or not available')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  // Auto-scroll articles
  useEffect(() => {
    if (relatedArticles.length === 0 || !contentRef.current) return

    const startAutoScroll = () => {
      if (!autoScrollEnabled) return
      
      autoScrollRef.current = setInterval(() => {
        if (!isScrolling && contentRef.current && autoScrollEnabled) {
          const articleWidth = 400 // Width of one article including padding
          const newPosition = contentRef.current.scrollLeft + articleWidth

          // If we've scrolled through all original articles, reset to start
          if (newPosition >= articleWidth * relatedArticles.length) {
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
  }, [relatedArticles, autoScrollEnabled])

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

  if (!article) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Container size="full" className="py-4 md:py-8 px-4 md:px-8">
        {/* First row: Title takes 1/3, rest is empty */}
        <div className="grid grid-cols-2 grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Text variant="heading" className="text-3xl md:text-4xl font-bold mb-4">{article.title}</Text>
          </div>
          <div className="lg:col-span-1">
            {/* Intentionally left empty */}
          </div>
        </div>

        {/* Second row: Image and content with their current spans */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          {/* Left side - Image (Full width on mobile, 8 cols on large screens) */}
          <div className="lg:col-span-8">
            {/* Featured Image */}
            {article.media && article.media.length > 0 && (
              <div className="relative aspect-[16/9] overflow-hidden">
                <ImageSlider 
                  images={article.media.map(m => m.url)} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Right side - Article Content (Full width on mobile, 4 cols on large screens) */}
          <div className="lg:col-span-4">
            <div 
              className="prose prose-lg max-w-none lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{
                scrollbarWidth: 'thin',
              }}
            >
              <div 
                className="text-justify leading-relaxed"
                style={{
                  lineHeight: '1.8',
                  fontSize: '1.1rem',
                }}
              >
                {article.content.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only content view that appears below the image on smaller screens */}
        <div className="block lg:hidden mt-6">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-justify leading-relaxed"
              style={{
                lineHeight: '1.8',
                fontSize: '1.1rem',
              }}
            >
              {article.content.split('\n\n').map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="mb-4">{paragraph}</p>
                ) : null
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Related Articles Slider */}
      {relatedArticles.length > 0 && (
        <div className="relative bg-[#6EBDAF] py-16 mt-12">
          <Container size="full">
            <Text variant="heading" className="text-2xl font-bold mb-8 text-black">Artik3l Lainnya</Text>
            
            <div className="w-full h-[400px] flex items-center justify-center">
              <div 
                ref={contentRef}
                className="h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth mx-auto"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex space-x-8">
                  {/* Articles */}
                  {relatedArticles.map((relatedArticle) => (
                    <div 
                      key={relatedArticle.id}
                      className="flex-none w-[400px] p-6 relative group snap-center"
                      onMouseEnter={() => {
                        setAutoScrollEnabled(false)
                        if (autoScrollRef.current) {
                          clearInterval(autoScrollRef.current)
                        }
                      }}
                    >
                      <Link 
                        href={`/public/articles/${relatedArticle.id}`}
                        className="block h-full"
                      >
                        <div className="h-full flex flex-col relative z-10 article-card overflow-hidden">
                          {/* Article Image with Title Overlay */}
                          <div className="relative aspect-[16/9] -mx-6 -mt-6">
                            {((relatedArticle.media && relatedArticle.media.length > 0) || relatedArticle.coverImage) ? (
                              <div className="absolute inset-0">
                                <img
                                  src={relatedArticle.media?.[0]?.url || relatedArticle.coverImage}
                                  alt={relatedArticle.title}
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
                            <Text variant="heading" className="text-xl font-semibold text-black">{relatedArticle.title}</Text>
                            <Text variant="body" className="mt-1 text-gray-600 text-sm line-clamp-2">
                              {relatedArticle.excerpt}
                            </Text>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                  
                  {/* Duplicate the articles for seamless loop - only if more than 1 article */}
                  {relatedArticles.length > 3 && relatedArticles.map((relatedArticle) => (
                    <div 
                      key={`duplicate-${relatedArticle.id}`}
                      className="flex-none w-[400px] p-6 relative group snap-center"
                      onMouseEnter={() => {
                        setAutoScrollEnabled(false)
                        if (autoScrollRef.current) {
                          clearInterval(autoScrollRef.current)
                        }
                      }}
                    >
                      <Link 
                        href={`/public/articles/${relatedArticle.id}`}
                        className="block h-full"
                      >
                        <div className="h-full flex flex-col relative z-10 article-card overflow-hidden">
                          {/* Article Image*/}
                          <div className="relative aspect-[16/9] -mx-6 -mt-6">
                            {((relatedArticle.media && relatedArticle.media.length > 0) || relatedArticle.coverImage) ? (
                              <div className="absolute inset-0">
                                <img
                                  src={relatedArticle.media?.[0]?.url || relatedArticle.coverImage}
                                  alt={relatedArticle.title}
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
                            <Text variant="heading" className="text-xl font-semibold text-black">{relatedArticle.title}</Text>
                            <Text variant="body" className="mt-1 text-gray-600 text-sm line-clamp-2">
                              {relatedArticle.excerpt}
                            </Text>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </div>
      )}

      <style jsx global>{`
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
      `}</style>
    </div>
  )
} 