'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { Container, Grid, Text, Button, Card } from '@shared/components/ui'
import { ImageSlider } from '@shared/components/ImageSlider'
import { toast } from 'react-hot-toast'

interface Media {
  _id: string
  title: string
  url: string
  thumbnailUrl: string
}

interface Article {
  _id: string
  title: string
  content: string
  coverImage: string
}

interface ProgramFormData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  media: Media[]
  articles: Article[]
  isPublic: boolean
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
}

const getMediaKey = (media: Media, prefix: string, index?: number) => {
  return `${prefix}-${media._id}${index !== undefined ? `-${index}` : ''}`
}

export default function ProgramEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    media: [],
    articles: [],
    isPublic: false,
    status: 'draft'
  })
  const [availableMedia, setAvailableMedia] = useState<Media[]>([])
  const [availableArticles, setAvailableArticles] = useState<Article[]>([])
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (!isNew && status === 'authenticated') {
      fetchProgram()
    }
  }, [status, router, isNew])

  const fetchProgram = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/programs/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch program')
      const data = await response.json()
      setFormData({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      })
    } catch (error) {
      console.error('Error fetching program:', error)
      toast.error('Failed to load program')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableMedia = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      setAvailableMedia(data)
    } catch (error) {
      console.error('Error fetching media:', error)
      toast.error('Failed to load media')
    }
  }

  const fetchAvailableArticles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch articles')
      const data = await response.json()
      setAvailableArticles(data)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${isNew ? '/api/programs' : `/api/programs/${params.id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) throw new Error(isNew ? 'Failed to create program' : 'Failed to update program')
      
      toast.success(isNew ? 'Program created successfully' : 'Program updated successfully')
      router.push('/admin/programs')
    } catch (error) {
      console.error('Save error:', error)
      toast.error(isNew ? 'Failed to create program' : 'Failed to update program')
    } finally {
      setSaving(false)
    }
  }

  const handleMediaSelect = (media: Media) => {
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, media]
    }))
    setShowMediaModal(false)
  }

  const handleArticleSelect = (article: Article) => {
    setFormData(prev => ({
      ...prev,
      articles: [...prev.articles, article]
    }))
    setShowArticleModal(false)
  }

  if (status === 'loading' || loading) {
    return (
      <Container className="py-8">
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container className="py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Text variant="heading" className="text-3xl">
          {isNew ? 'Create Program' : 'Edit Program'}
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Selection and Preview */}
        <div>
          <Text variant="body" className="mb-2">Program Images</Text>
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-gray-100">
            {formData.media.length > 0 ? (
              <ImageSlider 
                images={formData.media.map(m => m.url)} 
                className="rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Text variant="body" className="text-gray-500">No images selected</Text>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                fetchAvailableMedia()
                setShowMediaModal(true)
              }}
            >
              Add Images
            </Button>
            {formData.media.length > 0 && (
              <Grid cols={{ base: 4, md: 6, lg: 8 }} gap="sm">
                {formData.media.map((media, index) => (
                  <div key={getMediaKey(media, 'preview', index)} className="relative">
                    <Image
                      src={media.thumbnailUrl}
                      alt={media.title}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        media: prev.media.filter((_, i) => i !== index)
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </Grid>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div>
          <Text variant="body" className="mb-2">Title</Text>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value
              if (title.length <= 200) {
                setFormData(prev => ({ ...prev, title }))
              }
            }}
            maxLength={200}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
            required
          />
          <Text variant="caption" className={`mt-1 ${formData.title.length >= 180 ? 'text-orange-500' : 'text-gray-500'}`}>
            {formData.title.length}/200 characters
          </Text>
        </div>

        <div>
          <Text variant="body" className="mb-2">Description</Text>
          <textarea
            value={formData.description}
            onChange={(e) => {
              const description = e.target.value
              if (description.length <= 2000) {
                setFormData(prev => ({ ...prev, description }))
              }
            }}
            maxLength={2000}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
            rows={5}
            required
          />
          <Text variant="caption" className={`mt-1 ${formData.description.length >= 1800 ? 'text-orange-500' : 'text-gray-500'}`}>
            {formData.description.length}/2,000 characters
          </Text>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Text variant="body" className="mb-2">Start Date</Text>
            <DatePicker
              selected={formData.startDate}
              onChange={(date: Date | null) => date && setFormData(prev => ({ ...prev, startDate: date }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
          <div>
            <Text variant="body" className="mb-2">End Date</Text>
            <DatePicker
              selected={formData.endDate}
              onChange={(date: Date | null) => date && setFormData(prev => ({ ...prev, endDate: date }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
              dateFormat="MMMM d, yyyy"
              minDate={formData.startDate}
              required
            />
          </div>
        </div>

        {/* Status and Visibility */}
        <div className="space-y-4">
          <div>
            <Text variant="body" className="mb-2">Status</Text>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                status: e.target.value as ProgramFormData['status']
              }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                isPublic: e.target.checked 
              }))}
              className="h-4 w-4 text-edsu-green focus:ring-edsu-green border-gray-300 rounded"
            />
            <label htmlFor="isPublic">
              <Text variant="body">Make this program public</Text>
            </label>
          </div>
        </div>

        {/* Article Selection */}
        <div>
          <Text variant="body" className="mb-2">Related Articles</Text>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              fetchAvailableArticles()
              setShowArticleModal(true)
            }}
            className="mb-4"
          >
            Add Articles
          </Button>
          {formData.articles.length > 0 && (
            <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md">
              {formData.articles.map((article, index) => (
                <Card key={article._id} className="p-4 relative">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      articles: prev.articles.filter((_, i) => i !== index)
                    }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                  <div className="aspect-video relative mb-2">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <Text variant="body" className="font-medium line-clamp-2">
                    {article.title}
                  </Text>
                </Card>
              ))}
            </Grid>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/programs')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isNew ? 'Create Program' : 'Save Changes')}
          </Button>
        </div>
      </form>

      {/* Media Selection Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <Text variant="heading" className="text-2xl mb-4">Select Media</Text>
            <Grid cols={{ base: 2, md: 3, lg: 4 }} gap="md">
              {availableMedia.map((media) => (
                <Card
                  key={getMediaKey(media, 'select')}
                  className="p-4 cursor-pointer hover:ring-2 hover:ring-edsu-green"
                  onClick={() => handleMediaSelect(media)}
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <Image
                      src={media.thumbnailUrl}
                      alt={media.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Text variant="body" className="mt-2 font-medium truncate">
                    {media.title}
                  </Text>
                </Card>
              ))}
            </Grid>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowMediaModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Article Selection Modal */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <Text variant="heading" className="text-2xl mb-4">Select Articles</Text>
            <Grid cols={{ base: 1, md: 2 }} gap="md">
              {availableArticles.map((article) => (
                <Card
                  key={article._id}
                  className="p-4 cursor-pointer hover:ring-2 hover:ring-edsu-green"
                  onClick={() => handleArticleSelect(article)}
                >
                  <div className="aspect-video relative mb-2">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <Text variant="body" className="font-medium line-clamp-2">
                    {article.title}
                  </Text>
                  <Text variant="caption" className="text-gray-500 line-clamp-3">
                    {article.content}
                  </Text>
                </Card>
              ))}
            </Grid>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowArticleModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
} 