'use client'

import { Container, Grid, Text } from '../../../../../shared/components/ui'
import { ImageSlider } from '../../../../../shared/components/ImageSlider'
import Link from 'next/link'
import { useEffect, useState } from 'react'
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

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const articleData = await getArticle(params.id as string)
        setArticle(articleData)
      } catch (error) {
        console.error('Error fetching article:', error)
        setError('Article not found or not available')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

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
      <Container className="py-16">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <Text variant="heading" className="text-4xl font-bold mb-4">{article.title}</Text>
            <div className="flex items-center gap-4 text-gray-600">
              <Text variant="body" className="text-lg">By {article.author}</Text>
              {article.publishedAt && (
                <Text variant="body" className="text-sm">
                  Published on {new Date(article.publishedAt).toLocaleDateString()}
                </Text>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {article.media && article.media.length > 0 && (
            <div className="relative aspect-[16/9] mb-8 overflow-hidden">
              <ImageSlider 
                images={article.media.map(m => m.url)} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </Container>
    </div>
  )
} 