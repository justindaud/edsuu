'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Container, Grid, Text, Button, Card } from '@shared/components/ui'
import { toast } from 'react-hot-toast'
import { X } from 'lucide-react'

interface Media {
  _id: string
  title: string
  url: string
  thumbnailUrl: string
}

interface Program {
  _id: string
  title: string
}

interface PartyLiterasi {
  _id: string
  title: string
}

interface Review {
  reviewer: string
  text: string
  createdAt?: string
}

interface BookFormData {
  media: Media[]
  title: string
  year: number
  author: string
  price: number
  description: string
  reviews: Review[]
  isAvailable: boolean
  relatedPrograms: string[]
  relatedPartyLiterasi: string[]
}

const getMediaKey = (media: Media, prefix: string, index?: number) => {
  return `${prefix}-${media._id}${index !== undefined ? `-${index}` : ''}`
}

export default function BookEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'

  const [formData, setFormData] = useState<BookFormData>({
    media: [],
    title: '',
    year: new Date().getFullYear(),
    author: '',
    price: 0,
    description: '',
    reviews: [],
    isAvailable: true,
    relatedPrograms: [],
    relatedPartyLiterasi: []
  })

  const [availableMedia, setAvailableMedia] = useState<Media[]>([])
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [partyLiterasi, setPartyLiterasi] = useState<PartyLiterasi[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (!isNew && status === 'authenticated') {
      fetchBook()
    }
    fetchPrograms()
    fetchPartyLiterasi()
  }, [status, router, isNew])

  const fetchBook = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/be-em/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch book')
      const data = await response.json()
      
      // Fetch media details for the book's media IDs
      const mediaResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media-tbyt`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!mediaResponse.ok) throw new Error('Failed to fetch media')
      const mediaData = await mediaResponse.json()
      
      // Find media objects that match the book's media IDs, safely handle undefined arrays
      const bookMedia = mediaData.filter((m: Media) => 
        (data.media || []).includes(m._id) || m._id === data.mediaId
      )
      
      setFormData({
        ...data,
        media: bookMedia,
        // Ensure all arrays are initialized
        reviews: data.reviews || [],
        relatedPrograms: data.relatedPrograms || [],
        relatedPartyLiterasi: data.relatedPartyLiterasi || []
      })
    } catch (error) {
      console.error('Error fetching book:', error)
      toast.error('Failed to load book')
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/programs`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch programs')
      const data = await response.json()
      setPrograms(data)
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const fetchPartyLiterasi = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/party-literasi`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch party literasi')
      const data = await response.json()
      setPartyLiterasi(data)
    } catch (error) {
      console.error('Error fetching party literasi:', error)
    }
  }

  const fetchAvailableMedia = async () => {
    try {
      const response = await fetch('/api/media-tbyt')
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${isNew ? '/api/be-em' : `/api/be-em/${params.id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`
          },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) throw new Error(isNew ? 'Failed to create book' : 'Failed to update book')
      
      toast.success(isNew ? 'Book created successfully' : 'Book updated successfully')
      router.push('/admin/be-em')
    } catch (error) {
      console.error('Save error:', error)
      toast.error(isNew ? 'Failed to create book' : 'Failed to update book')
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

  const handleAddReview = () => {
    setFormData(prev => ({
      ...prev,
      reviews: [...prev.reviews, { reviewer: '', text: '' }]
    }))
  }

  const handleRemoveReview = (index: number) => {
    setFormData(prev => ({
      ...prev,
      reviews: prev.reviews.filter((_, i) => i !== index)
    }))
  }

  const handleReviewChange = (index: number, field: keyof Review, value: string) => {
    setFormData(prev => ({
      ...prev,
      reviews: prev.reviews.map((review, i) => 
        i === index ? { ...review, [field]: value } : review
      )
    }))
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
          {isNew ? 'Add New Book' : 'Edit Book'}
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Selection */}
        <div>
          <Text variant="body" className="mb-2">Book Images</Text>
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-gray-100">
            {formData.media.length > 0 ? (
              <div className="relative h-full">
                <Image
                  src={formData.media[0].url}
                  alt={formData.media[0].title}
                  fill
                  className="object-contain"
                />
                {formData.media.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    +{formData.media.length - 1} more
                  </div>
                )}
              </div>
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
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </Grid>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <Grid cols={2} gap="md">
          <div>
            <Text variant="body" className="mb-2">Title</Text>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
              required
            />
          </div>
          <div>
            <Text variant="body" className="mb-2">Author</Text>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
              required
            />
          </div>
        </Grid>

        <Grid cols={2} gap="md">
          <div>
            <Text variant="body" className="mb-2">Year</Text>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
              required
            />
          </div>
          <div>
            <Text variant="body" className="mb-2">Price (Rp)</Text>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
              required
            />
          </div>
        </Grid>

        <div>
          <Text variant="body" className="mb-2">Description</Text>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
            rows={5}
            required
          />
        </div>

        {/* Reviews */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text variant="body">Reviews</Text>
            <Button type="button" variant="outline" onClick={handleAddReview}>
              Add Review
            </Button>
          </div>
          <div className="space-y-4">
            {formData.reviews.map((review, index) => (
              <Card key={index} className="p-4 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveReview(index)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
                <Grid cols={1} gap="sm">
                  <div>
                    <Text variant="body" className="mb-2">Reviewer</Text>
                    <input
                      type="text"
                      value={review.reviewer}
                      onChange={(e) => handleReviewChange(index, 'reviewer', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
                      required
                    />
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Review Text</Text>
                    <textarea
                      value={review.text}
                      onChange={(e) => handleReviewChange(index, 'text', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
                      rows={3}
                      required
                    />
                  </div>
                </Grid>
              </Card>
            ))}
          </div>
        </div>

        {/* Related Content */}
        <Grid cols={2} gap="md">
          <div>
            <Text variant="body" className="mb-2">Related Programs</Text>
            <select
              multiple
              value={formData.relatedPrograms}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value)
                setFormData(prev => ({ ...prev, relatedPrograms: values }))
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
            >
              {programs.map(program => (
                <option key={program._id} value={program._id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Text variant="body" className="mb-2">Related Party Literasi</Text>
            <select
              multiple
              value={formData.relatedPartyLiterasi}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value)
                setFormData(prev => ({ ...prev, relatedPartyLiterasi: values }))
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#85BAAC]"
            >
              {partyLiterasi.map(party => (
                <option key={party._id} value={party._id}>
                  {party.title}
                </option>
              ))}
            </select>
          </div>
        </Grid>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isAvailable}
            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
            id="isAvailable"
          />
          <label htmlFor="isAvailable">
            <Text variant="body">Book is available for purchase</Text>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/be-em')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : (isNew ? 'Create Book' : 'Update Book')}
          </Button>
        </div>
      </form>

      {/* Media Selection Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Text variant="heading">Select Images</Text>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Grid cols={{ base: 2, md: 3, lg: 4 }} gap="md">
              {availableMedia.map((media) => (
                <button
                  key={media._id}
                  type="button"
                  onClick={() => handleMediaSelect(media)}
                  className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-[#85BAAC] focus:outline-none"
                >
                  <Image
                    src={media.thumbnailUrl}
                    alt={media.title}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </Grid>
          </div>
        </div>
      )}
    </Container>
  )
} 