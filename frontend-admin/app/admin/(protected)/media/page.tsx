'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Container, Grid, Text, Button, Card } from '@shared/components/ui'
import { Upload, Search, Edit, Trash2, X } from '@shared/components/icons'
import { toast } from 'react-hot-toast'

interface Media {
  _id: string
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  artist: string | null
  year?: string
  description: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

interface MediaFormData {
  file?: File
  title: string
  description: string
  artist?: string
  year?: string
  isPublic: boolean
}

type SortField = 'title' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

export default function MediaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [formData, setFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    artist: '',
    year: '',
    isPublic: true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchMedia()
    }
  }, [status, router])

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/media`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      setMedia(data)
    } catch (error) {
      console.error('Error fetching media:', error)
      toast.error('Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
      setShowUploadModal(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formDataToSend = new FormData()
      if (formData.file) {
        formDataToSend.append('file', formData.file)
      } else if (selectedMedia) {
        // If editing without a new file, send the existing URLs
        formDataToSend.append('url', selectedMedia.url)
        formDataToSend.append('thumbnailUrl', selectedMedia.thumbnailUrl)
      } else {
        // This is a new upload and requires a file
        throw new Error('File is required for new uploads')
      }
      
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('artist', formData.artist || '')
      formDataToSend.append('year', formData.year || '')
      formDataToSend.append('isPublic', formData.isPublic.toString())

      // Use different endpoints for new uploads vs updates, both using Next.js API routes
      const endpoint = selectedMedia 
        ? `/api/media/${selectedMedia._id}`
        : `/api/upload`;
      
      const response = await fetch(endpoint, {
        method: selectedMedia ? 'PUT' : 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(selectedMedia ? 'Failed to update media' : 'Failed to create media');
      }
      
      toast.success(selectedMedia ? 'Media updated successfully' : 'Media created successfully')
      setShowUploadModal(false)
      setShowEditModal(false)
      setSelectedMedia(null)
      fetchMedia()
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : (selectedMedia ? 'Failed to update media' : 'Failed to create media'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedia) return

    try {
      const response = await fetch(`/api/media/${selectedMedia._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          artist: formData.artist || null,
          year: formData.year || null,
          isPublic: formData.isPublic,
          url: selectedMedia.url,
          thumbnailUrl: selectedMedia.thumbnailUrl
        }),
      })

      if (!response.ok) {
        toast.error('Failed to update media', {
          duration: 3000,
          position: 'top-center',
        })
        return
      }
      
      const updatedMedia = await response.json()
      
      // Update the media list with the edited item
      setMedia(media.map(item => 
        item._id === selectedMedia._id ? updatedMedia : item
      ))
      
      // Show success notification
      toast.success('Media has been updated!', {
        duration: 3000,
        position: 'top-center',
      })

      // Close the modal and reset form
      setShowEditModal(false)
      setSelectedMedia(null)
      setFormData({
        title: '',
        description: '',
        artist: '',
        year: '',
        isPublic: true
      })
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update media', {
        duration: 3000,
        position: 'top-center',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error('Failed to delete media', {
          duration: 3000,
          position: 'top-center',
        })
        return
      }

      // Then show success notification
      toast.success('Media has been deleted!', {
        duration: 3000,
        position: 'top-center',
      })

      // Update UI first
      setMedia(media.filter(item => item._id !== id))
      
      
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete media', {
        duration: 3000,
        position: 'top-center',
      })
    }
  }

  const openEditModal = (item: Media) => {
    setSelectedMedia(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      artist: item.artist || '',
      year: item.year || '',
      isPublic: item.isPublic
    })
    setShowEditModal(true)
  }

  const filteredAndSortedMedia = media
    .filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] || ''
      const bValue = b[sortField] || ''
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#85BAAC]"></div>
      </div>
    )
  }

  return (
    <Container className="py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Text variant="heading" className="text-3xl">Media</Text>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
        >
          <Upload className="w-5 h-5" />
          Upload
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
          />
        </div>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
        >
          <option value="createdAt">Date Created</option>
          <option value="title">Title</option>
          <option value="updatedAt">Last Updated</option>
        </select>
        <Button
          variant="outline"
          onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      <Grid cols={{ base: 1, md: 2, lg: 4 }} gap="md" className="mt-8">
        {filteredAndSortedMedia.map((item) => (
          <Card key={item._id} className="group relative overflow-hidden">
            {/* Media Preview */}
            <div 
              className="aspect-square relative cursor-pointer"
              onClick={() => setPreviewMedia(item)}
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.title || 'Media thumbnail'}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditModal(item)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item._id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Media Info */}
            <div className="p-4 space-y-2">
              <Text variant="body" className="font-medium truncate">
                {item.title || 'Untitled'}
              </Text>
              {item.description && (
                <Text variant="caption" className="text-gray-500 line-clamp-2">
                  {item.description}
                </Text>
              )}
              <Text variant="caption" className="text-gray-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </div>
          </Card>
        ))}
      </Grid>

      {media.length === 0 && !loading && (
        <div className="text-center py-12">
          <Text variant="body" className="text-gray-500">
            No media found. Upload some files to get started.
          </Text>
        </div>
      )}

      {/* Fullscreen Preview */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
            <Image
              src={previewMedia.url}
              alt={previewMedia.title || 'Media preview'}
              fill
              className="object-contain"
            />
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-4 rounded-lg text-white">
              <Text variant="heading" className="text-xl mb-2">
                {previewMedia.title || 'Untitled'}
              </Text>
              {previewMedia.description && (
                <Text variant="body" className="text-white/80">
                  {previewMedia.description}
                </Text>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <Text variant="heading" className="text-2xl">Upload Media</Text>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setFormData({ title: '', description: '', artist: '', year: '', isPublic: true })
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Input Section */}
              <div>
                <Text variant="body" className="mb-2">Select File</Text>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({ ...prev, file }))
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                  required
                />
              </div>

              {/* Preview Section */}
              <div>
                <Text variant="body" className="mb-2">Preview</Text>
                <div className="relative h-[200px] md:h-[400px] w-full rounded-lg overflow-hidden bg-gray-100">
                  {formData.file ? (
                    <Image
                      src={URL.createObjectURL(formData.file)}
                      alt="Upload preview"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Text variant="body" className="text-gray-500">No file selected</Text>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields in Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Text variant="body" className="mb-2">Title</Text>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                      required
                    />
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Description</Text>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Text variant="body" className="mb-2">Artist</Text>
                    <input
                      type="text"
                      value={formData.artist || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                    />
                  </div>
                  <div>
                    <Text variant="body" className="mb-2">Year</Text>
                    <input
                      type="text"
                      value={formData.year || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="YYYY"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    <label htmlFor="isPublic">
                      <Text variant="body">Make this media public</Text>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    setFormData({ title: '', description: '', artist: '', year: '', isPublic: true })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <Text variant="heading" className="text-2xl">Edit Media</Text>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedMedia(null)
                  setFormData({ title: '', description: '', artist: '', year: '', isPublic: true })
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Text variant="body" className="mb-2">Title</Text>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                  required
                />
              </div>
              <div>
                <Text variant="body" className="mb-2">Description</Text>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                  rows={3}
                />
              </div>
              <div>
                <Text variant="body" className="mb-2">Artist</Text>
                <input
                  type="text"
                  value={formData.artist || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                />
              </div>
              <div>
                <Text variant="body" className="mb-2">Year</Text>
                <input
                  type="text"
                  value={formData.year || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="YYYY"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                <label htmlFor="editIsPublic">
                  <Text variant="body">Make this media public</Text>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMedia(null)
                    setFormData({ title: '', description: '', artist: '', year: '', isPublic: true })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  )
} 