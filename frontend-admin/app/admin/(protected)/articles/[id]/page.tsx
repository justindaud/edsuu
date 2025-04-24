'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Container, Grid, Text, Button, Card } from '@shared/components/ui'
import { ImageSlider } from '@shared/components/ImageSlider'
import { toast } from 'react-hot-toast'

interface Media {
  _id: string
  title: string
  url: string
  thumbnailUrl: string
}

interface ArticleFormData {
  title: string
  content: string
  slug: string
  media: Media[]
  isPublic: boolean
}

const getMediaKey = (media: Media, prefix: string, index?: number) => {
  return `${prefix}-${media._id}${index !== undefined ? `-${index}` : ''}`
}

export default function ArticleEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    slug: '',
    media: [],
    isPublic: false
  })
  const [availableMedia, setAvailableMedia] = useState<Media[]>([])
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (!isNew && status === 'authenticated') {
      fetchArticle()
    }
  }, [status, router, isNew])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/articles/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch article')
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error('Error fetching article:', error)
      toast.error('Failed to load article')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${isNew ? '/api/articles' : `/api/articles/${params.id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) throw new Error(isNew ? 'Failed to create article' : 'Failed to update article')
      
      toast.success(isNew ? 'Article created successfully' : 'Article updated successfully')
      router.push('/admin/articles')
    } catch (error) {
      console.error('Save error:', error)
      toast.error(isNew ? 'Failed to create article' : 'Failed to update article')
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
          {isNew ? 'Create Article' : 'Edit Article'}
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Selection and Preview */}
        <div>
          <Text variant="body" className="mb-2">Article Images</Text>
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

        <div>
          <Text variant="body" className="mb-2">Title</Text>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value
              if (title.length <= 200) {
                setFormData(prev => ({
                  ...prev,
                  title,
                  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                }))
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
          <Text variant="body" className="mb-2">Content</Text>
          <textarea
            value={formData.content}
            onChange={(e) => {
              const content = e.target.value
              if (content.length <= 10000) {
                setFormData(prev => ({ ...prev, content }))
              }
            }}
            maxLength={10000}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
            rows={10}
            required
          />
          <Text variant="caption" className={`mt-1 ${formData.content.length >= 9000 ? 'text-orange-500' : 'text-gray-500'}`}>
            {formData.content.length}/10,000 characters
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            id="isPublic"
          />
          <label htmlFor="isPublic">
            <Text variant="body">Make this article public</Text>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/articles')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isNew ? 'Create Article' : 'Save Changes')}
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
                  onClick={() => {
                    handleMediaSelect(media)
                    setShowMediaModal(false)
                  }}
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
    </Container>
  )
} 