'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Container, Grid, Text, Button, Card } from '@shared/components/ui'
import { Upload, Search, Edit } from '@shared/components/icons'
import { toast } from 'react-hot-toast'

interface Media {
  _id: string
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  description: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface MediaFormData {
  file?: File
  title: string
  description: string
}

type SortField = 'createdAt' | 'title' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

export default function MediaTBYTPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null)
  const [formData, setFormData] = useState<MediaFormData>({
    title: '',
    description: ''
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchMedia()
    }
  }, [status, router])

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media-tbyt')
      if (!response.ok) throw new Error('Failed to fetch media')
      const data = await response.json()
      console.log('Fetched media data:', data)
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file) return

    setUploading(true)
    const uploadData = new FormData()
    uploadData.append('file', formData.file)
    uploadData.append('title', formData.title)
    uploadData.append('description', formData.description)

    try {
      const response = await fetch('/api/upload-tbyt', {
        method: 'POST',
        body: uploadData,
      })

      if (!response.ok) throw new Error('Upload failed')
      
      toast.success('File uploaded successfully')
      fetchMedia()
      setShowUploadModal(false)
      setFormData({ title: '', description: '' })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedia) return

    try {
      const response = await fetch(`/api/media-tbyt/${selectedMedia._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user.accessToken}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description
        }),
      })

      if (!response.ok) throw new Error('Update failed')
      
      toast.success('Media updated successfully')
      fetchMedia()
      setShowEditModal(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update media')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/media-tbyt/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user.accessToken}`
        }
      })

      if (!response.ok) throw new Error('Delete failed')
      
      toast.success('Media deleted successfully')
      setMedia(media.filter(item => item._id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete media')
    }
  }

  const openEditModal = (item: Media) => {
    setSelectedMedia(item)
    setFormData({
      title: item.title || '',
      description: item.description || ''
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
      <Container className="py-8">
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container className="py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Text variant="heading" className="text-3xl">Media TBYT</Text>
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
      <div className="container mx-auto px-4 space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedMedia.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video">
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.title || 'Media preview'}
                  fill
                  className="object-cover"
                  onClick={() => setPreviewMedia(item)}
                />
              </div>
              <div className="p-4">
                <Text variant="body" className="font-medium mb-1">
                  {item.title || 'Untitled'}
                </Text>
                {item.description && (
                  <Text variant="body" className="text-gray-500 text-sm mb-4">
                    {item.description}
                  </Text>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {media.length === 0 && !loading && (
          <div className="text-center py-12">
            <Text variant="body" className="text-gray-500">
              No media found. Upload some files to get started.
            </Text>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <Text variant="heading" className="text-2xl mb-4">Upload Media</Text>
            
            <form onSubmit={handleUpload} className="space-y-6">
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
                  accept="image/jpeg,image/png,image/gif,image/webp"
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

              {/* Form Fields */}
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
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    setFormData({ title: '', description: '' })
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
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md">
            <Text variant="heading" className="text-2xl mb-4">Edit Media</Text>
            
            <form onSubmit={handleEdit} className="space-y-6">
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

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMedia(null)
                    setFormData({ title: '', description: '' })
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

      {/* Preview Dialog */}
      {previewMedia && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="relative max-w-7xl w-full max-h-[90vh] aspect-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={previewMedia.url}
              alt={previewMedia.title || 'Media preview'}
              fill
              className="object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/80 hover:bg-white"
              onClick={() => setPreviewMedia(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
} 