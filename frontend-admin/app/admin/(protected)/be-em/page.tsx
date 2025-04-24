'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

interface Book {
  _id: string
  title: string
  description: string
  year: number
  author: string
  price: number
  mediaId?: Media
  media?: Media[]
  isAvailable: boolean
}

interface BookFormData {
  title: string
  description: string
  year: number
  author: string
  price: number
  media: Media[]
  isAvailable: boolean
}

const getMediaKey = (media: Media, prefix: string, index?: number) => {
  return `${prefix}-${media._id}${index !== undefined ? `-${index}` : ''}`
}

export default function BeEmPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [books, setBooks] = useState<Book[]>([])
  const [availableMedia, setAvailableMedia] = useState<Media[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    author: '',
    price: 0,
    media: [],
    isAvailable: true
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchBooks()
    }
  }, [status, router])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/be-em')
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      console.log('Fetched books data:', data)
      console.log('First book media data:', data[0]?.mediaId, data[0]?.media)
      setBooks(data)
    } catch (error) {
      console.error('Error fetching books:', error)
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableMedia = async () => {
    try {
      const response = await fetch('/api/media')
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
        selectedBook ? `/api/be-em/${selectedBook._id}` : '/api/be-em',
        {
          method: selectedBook ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) throw new Error(selectedBook ? 'Failed to update book' : 'Failed to create book')
      
      toast.success(selectedBook ? 'Book updated successfully' : 'Book created successfully')
      setShowForm(false)
      setSelectedBook(null)
      fetchBooks()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(selectedBook ? 'Failed to update book' : 'Failed to create book')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const response = await fetch(`/api/be-em/${bookId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete book')
      
      toast.success('Book deleted successfully')
      fetchBooks()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete book')
    }
  }

  const handleEdit = (book: Book) => {
    setSelectedBook(book)
    setFormData({
      title: book.title,
      description: book.description,
      year: book.year,
      author: book.author,
      price: book.price,
      media: book.media || [],
      isAvailable: book.isAvailable
    })
    setShowForm(true)
  }

  const handleMediaSelect = (media: Media) => {
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, media]
    }))
    setShowMediaModal(false)
  }

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <Text variant="heading" className="text-3xl">Books</Text>
        <Button onClick={() => {
          setSelectedBook(null)
          setFormData({
            title: '',
            description: '',
            year: new Date().getFullYear(),
            author: '',
            price: 0,
            media: [],
            isAvailable: true
          })
          setShowForm(true)
        }}>
          Add Book
        </Button>
      </div>

      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
      />

      <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md">
        {filteredBooks.map(book => (
          <Card key={book._id} className="overflow-hidden">
            <div className="relative h-[200px] w-full">
              {book.mediaId ? (
                <Image
                  src={book.mediaId.thumbnailUrl || book.mediaId.url}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : book.media && book.media.length > 0 ? (
                <Image
                  src={book.media[0].thumbnailUrl || book.media[0].url}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <Text variant="body" className="text-gray-500">No image</Text>
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <Text variant="heading" className="text-xl">{book.title}</Text>
              <Text variant="body" className="text-gray-600">{book.author}</Text>
              <Text variant="body">Year: {book.year}</Text>
              <Text variant="body">Price: {book.price}</Text>
              <Text variant="body" className={book.isAvailable ? 'text-green-600' : 'text-red-600'}>
                {book.isAvailable ? 'Available' : 'Not Available'}
              </Text>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => handleEdit(book)}>
                  Edit
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(book._id)}
                  className="ml-2"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </Grid>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <Text variant="heading" className="text-2xl">
                  {selectedBook ? 'Edit Book' : 'Add Book'}
                </Text>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Media Selection and Preview */}
                <div>
                  <Text variant="body" className="mb-2">Book Images</Text>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text variant="body" className="mb-2">Author</Text>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                      required
                    />
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Year</Text>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text variant="body" className="mb-2">Price</Text>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      step="0.01"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                      required
                    />
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Availability</Text>
                    <select
                      value={formData.isAvailable.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (selectedBook ? 'Save Changes' : 'Create Book')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Text variant="heading" className="text-2xl">Select Images</Text>
                <button
                  onClick={() => setShowMediaModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <Grid cols={{ base: 2, md: 3, lg: 4 }} gap="md">
                {availableMedia.map(media => (
                  <button
                    key={media._id}
                    onClick={() => handleMediaSelect(media)}
                    className="relative aspect-square rounded-lg overflow-hidden hover:opacity-75 transition-opacity"
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
        </div>
      )}
    </Container>
  )
} 