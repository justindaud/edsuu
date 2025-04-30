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
  relatedPrograms: string[]
  relatedPartyLiterasi: string[]
  reviews: Review[]
}

interface BookFormData {
  title: string
  description: string
  year: number
  author: string
  price: number
  media: Media[]
  isAvailable: boolean
  relatedPrograms: string[]
  relatedPartyLiterasi: string[]
  reviews: Review[]
}

const getMediaKey = (media: Media, prefix: string, index?: number) => {
  return `${prefix}-${media._id}${index !== undefined ? `-${index}` : ''}`
}

export default function BeEmPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [books, setBooks] = useState<Book[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [partyLiterasi, setPartyLiterasi] = useState<PartyLiterasi[]>([])
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
    isAvailable: true,
    relatedPrograms: [],
    relatedPartyLiterasi: [],
    reviews: []
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchBooks()
      fetchPrograms()
      fetchPartyLiterasi()
    }
  }, [status, router])

  const fetchBooks = async () => {
    try {
      // First fetch books
      const booksResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/be-em`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });
      
      if (!booksResponse.ok) throw new Error('Failed to fetch books');
      const booksData = await booksResponse.json();
      
      // Then fetch media
      const mediaResponse = await fetch('/api/media-tbyt');
      if (!mediaResponse.ok) throw new Error('Failed to fetch media');
      const mediaData: Media[] = await mediaResponse.json();
      
      // Create a map of media by ID for quick lookup
      const mediaMap: Record<string, Media> = mediaData.reduce((acc: Record<string, Media>, media: Media) => {
        acc[media._id] = media;
        return acc;
      }, {});
      
      // Combine book data with media
      const enrichedBooks = booksData.map((book: any) => ({
        ...book,
        mediaId: book.mediaId ? mediaMap[book.mediaId] : undefined,
        media: (book.media || []).map((id: string) => mediaMap[id]).filter(Boolean),
      }));
      
      setBooks(enrichedBooks);
      setAvailableMedia(mediaData);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      if (!response.ok) throw new Error('Failed to fetch programs')
      const data = await response.json()
      setPrograms(data)
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const fetchPartyLiterasi = async () => {
    try {
      const response = await fetch('/api/party-literasi')
      if (!response.ok) throw new Error('Failed to fetch party literasi')
      const data = await response.json()
      setPartyLiterasi(data)
    } catch (error) {
      console.error('Error fetching party literasi:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Prepare data with mediaId from the first media item if available
      const dataToSubmit = {
        ...formData,
        mediaId: formData.media.length > 0 ? formData.media[0]._id : null,
        // Send only the IDs of the media items
        media: formData.media.map(m => m._id)
      };

      const response = await fetch(
        selectedBook 
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/be-em/${selectedBook._id}` 
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/be-em`,
        {
          method: selectedBook ? 'PUT' : 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`
          },
          body: JSON.stringify(dataToSubmit),
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/be-em/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
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
    
    // Create a proper media array from available data
    let mediaItems: Media[] = [];
    
    // Add mediaId object if it exists
    if (book.mediaId && typeof book.mediaId === 'object') {
      mediaItems.push(book.mediaId);
    }
    
    // Add media array items if they exist
    if (book.media && Array.isArray(book.media)) {
      // Filter out any duplicates that might be in mediaId already
      const mediaIdToExclude = book.mediaId?._id;
      const additionalMedia = mediaIdToExclude 
        ? book.media.filter(m => m._id !== mediaIdToExclude)
        : book.media;
        
      mediaItems = [...mediaItems, ...additionalMedia];
    }
    
    setFormData({
      title: book.title,
      description: book.description,
      year: book.year,
      author: book.author,
      price: book.price,
      media: mediaItems,
      isAvailable: book.isAvailable,
      relatedPrograms: book.relatedPrograms,
      relatedPartyLiterasi: book.relatedPartyLiterasi,
      reviews: book.reviews || []
    });
    
    setShowForm(true);
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
            isAvailable: true,
            relatedPrograms: [],
            relatedPartyLiterasi: [],
            reviews: []
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
              {book.mediaId && typeof book.mediaId === 'object' ? (
                <Image
                  src={book.mediaId.thumbnailUrl || book.mediaId.url}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : book.media && book.media.length > 0 && typeof book.media[0] === 'object' ? (
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
                        fetchBooks()
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
                    />
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Year</Text>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
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
                    />
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Availability</Text>
                    <select
                      value={(formData.isAvailable ?? true).toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text variant="body" className="mb-2">Related Programs</Text>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                      {programs.map(program => (
                        <div key={program._id} className="mb-2 flex items-center">
                          <input
                            type="checkbox"
                            id={`program-${program._id}`}
                            checked={formData.relatedPrograms.includes(program._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  relatedPrograms: [...prev.relatedPrograms, program._id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  relatedPrograms: prev.relatedPrograms.filter(id => id !== program._id)
                                }));
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`program-${program._id}`} className="text-sm">
                            {program.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Related Party Literasi</Text>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                      {partyLiterasi.map(party => (
                        <div key={party._id} className="mb-2 flex items-center">
                          <input
                            type="checkbox"
                            id={`party-${party._id}`}
                            checked={formData.relatedPartyLiterasi.includes(party._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  relatedPartyLiterasi: [...prev.relatedPartyLiterasi, party._id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  relatedPartyLiterasi: prev.relatedPartyLiterasi.filter(id => id !== party._id)
                                }));
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`party-${party._id}`} className="text-sm">
                            {party.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Reviews Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Text variant="body">Reviews</Text>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setFormData(prev => ({
                        ...prev, 
                        reviews: [...(prev.reviews || []), { reviewer: '', text: '' }]
                      }))}
                    >
                      Add Review
                    </Button>
                  </div>
                  
                  {(formData.reviews || []).map((review, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg relative">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            reviews: prev.reviews.filter((_, i) => i !== index)
                          }))
                        }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                      
                      <div className="mb-3">
                        <Text variant="body" className="mb-1">Reviewer</Text>
                        <input
                          type="text"
                          value={review.reviewer}
                          onChange={(e) => {
                            const updatedReviews = [...formData.reviews];
                            updatedReviews[index] = {
                              ...updatedReviews[index],
                              reviewer: e.target.value
                            };
                            setFormData(prev => ({ ...prev, reviews: updatedReviews }));
                          }}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                        />
                      </div>
                      
                      <div>
                        <Text variant="body" className="mb-1">Review Text</Text>
                        <textarea
                          value={review.text}
                          onChange={(e) => {
                            const updatedReviews = [...formData.reviews];
                            updatedReviews[index] = {
                              ...updatedReviews[index],
                              text: e.target.value
                            };
                            setFormData(prev => ({ ...prev, reviews: updatedReviews }));
                          }}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                        />
                      </div>
                    </div>
                  ))}
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