'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Container, Grid, Text, Button, Card } from '@shared/components/ui'
import { Upload, Search, Edit, Trash2, X } from '@shared/components/icons'
import { toast } from 'react-hot-toast'
import { uiMediaLocations, UIMediaLocationId } from '@shared/config/uiMediaLocations'

interface Media {
  _id: string
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  description: string
  isPublic: boolean
  locationIds: string[]
  index?: number
  createdAt: string
  updatedAt: string
}

interface MediaFormData {
  file?: File
  title: string
  description: string
  isPublic: boolean
  locationIds: string[]
  index: number
}

type SortField = 'title' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'

export default function UIMediaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [formData, setFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    isPublic: true,
    locationIds: [],
    index: 0
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ui-media`)
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.file) return
    
    try {
      setUploading(true)
      
      const formDataObj = new FormData()
      formDataObj.append('file', formData.file)
      formDataObj.append('title', formData.title)
      formDataObj.append('description', formData.description)
      formDataObj.append('isPublic', String(formData.isPublic))
      
      if (formData.locationIds.length > 0) {
        formDataObj.append('locationIds', JSON.stringify(formData.locationIds))
      }
      
      formDataObj.append('index', String(formData.index))
      
      console.log('Uploading to Next.js API route: /api/ui-media/upload');
      
      const response = await fetch(
        `/api/ui-media/upload`,
        {
          method: 'POST',
          body: formDataObj
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Failed to upload media: ${response.status} ${errorText}`);
      }
      
      toast.success('Media uploaded successfully')
      setShowUploadModal(false)
      setFormData({
        title: '',
        description: '',
        isPublic: true,
        locationIds: [],
        index: 0
      })
      fetchMedia()
    } catch (error) {
      console.error('Error uploading media:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload media')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedia) return
    
    setUploading(true)
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ui-media/${selectedMedia._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user.accessToken}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            isPublic: formData.isPublic,
            locationIds: formData.locationIds,
            index: formData.index
          })
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update media')
      }
      
      toast.success('Media updated successfully')
      setShowEditModal(false)
      fetchMedia()
    } catch (error) {
      console.error('Error updating media:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update media')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ui-media/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete media')
      }
      
      setMedia(media.filter(item => item._id !== id))
      toast.success('Media has been deleted!')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete media')
    }
  }

  const openEditModal = (item: Media) => {
    setSelectedMedia(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      isPublic: item.isPublic,
      locationIds: item.locationIds || [],
      index: item.index || 0
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

  const getLocationName = (locationId: string) => {
    return uiMediaLocations[locationId as UIMediaLocationId]?.title || locationId
  }

  const handleLocationSelectionChange = (locationId: string, isChecked: boolean) => {
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        locationIds: [...prev.locationIds, locationId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        locationIds: prev.locationIds.filter(id => id !== locationId)
      }));
    }
  };

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
        <Text variant="heading" className="text-2xl font-bold text-gray-900">UI Media</Text>
        <Button
          variant="primary"
          className="bg-[#6EBDAF] hover:bg-[#6EBDAF]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
        >
          <Upload className="h-5 w-5" />
          Upload
        </Button>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
          />
        </div>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
        >
          <option value="createdAt">Date Created</option>
          <option value="title">Title</option>
          <option value="updatedAt">Last Updated</option>
        </select>
        <Button
          variant="outline"
          onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedMedia.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-md overflow-hidden group"
          >
            <div className="aspect-square relative">
              <Image
                src={item.thumbnailUrl}
                alt={item.title || 'Media thumbnail'}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2 bg-[#6EBDAF] text-white rounded-full hover:bg-[#6EBDAF]/90"
                  onClick={(e) => {
                    e.stopPropagation()
                    openEditModal(item)
                  }}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item._id)
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate">{item.title || 'Untitled'}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.isPublic ? 'Public' : 'Private'}
                </span>
                {item.locationIds.length > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {item.locationIds.map(getLocationName).join(', ')}
                  </span>
                )}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Text variant="heading" className="text-2xl font-bold text-gray-900">Upload Media</Text>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setFormData({ title: '', description: '', isPublic: true, locationIds: [], index: 0 })
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Input Section */}
              <div>
                <Text variant="body" className="mb-2 font-medium text-gray-700">Select File</Text>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({ ...prev, file }))
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  required
                />
              </div>

              {/* Preview Section */}
              <div>
                <Text variant="body" className="mb-2 font-medium text-gray-700">Preview</Text>
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
                  <Text variant="body" className="mb-2 font-medium text-gray-700">Title</Text>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                    required
                  />
                </div>
                <div>
                  <Text variant="body" className="mb-2 font-medium text-gray-700">Description</Text>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="h-4 w-4 text-[#6EBDAF] focus:ring-[#6EBDAF] border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="text-gray-700">
                    Make this media public
                  </label>
                </div>
                <div>
                  <Text variant="body" className="mb-2 font-medium text-gray-700">Locations</Text>
                  <div className="max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {Object.entries(uiMediaLocations).map(([locationId, info]) => (
                      <div key={`multi-${locationId}`} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          id={`location-${locationId}`}
                          checked={formData.locationIds.includes(locationId)}
                          onChange={(e) => handleLocationSelectionChange(locationId, e.target.checked)}
                          className="h-4 w-4 text-[#6EBDAF] focus:ring-[#6EBDAF] border-gray-300 rounded"
                        />
                        <label htmlFor={`location-${locationId}`} className="ml-2 text-sm text-gray-700">
                          {info.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {formData.locationIds.length > 0 && (
                  <div>
                    <Text variant="body" className="mb-2 font-medium text-gray-700">Index</Text>
                    <input
                      type="number"
                      min="0"
                      value={formData.index || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, index: parseInt(e.target.value, 10) }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    setFormData({ title: '', description: '', isPublic: true, locationIds: [], index: 0 })
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-[#6EBDAF] hover:bg-[#6EBDAF]/90 text-white px-4 py-2 rounded-lg"
                >
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
              <Text variant="heading" className="text-2xl font-bold text-gray-900">Edit Media</Text>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedMedia(null)
                  setFormData({ title: '', description: '', isPublic: true, locationIds: [], index: 0 })
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Text variant="body" className="mb-2 font-medium text-gray-700">Title</Text>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                  required
                />
              </div>
              <div>
                <Text variant="body" className="mb-2 font-medium text-gray-700">Description</Text>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-[#6EBDAF] focus:ring-[#6EBDAF] border-gray-300 rounded"
                />
                <label htmlFor="editIsPublic" className="text-gray-700">
                  Make this media public
                </label>
              </div>
              <div>
                <Text variant="body" className="mb-2 font-medium text-gray-700">Locations</Text>
                <div className="max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {Object.entries(uiMediaLocations).map(([locationId, info]) => (
                    <div key={`multi-${locationId}`} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        id={`edit-location-${locationId}`}
                        checked={formData.locationIds.includes(locationId)}
                        onChange={(e) => handleLocationSelectionChange(locationId, e.target.checked)}
                        className="h-4 w-4 text-[#6EBDAF] focus:ring-[#6EBDAF] border-gray-300 rounded"
                      />
                      <label htmlFor={`edit-location-${locationId}`} className="ml-2 text-sm text-gray-700">
                        {info.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {formData.locationIds.length > 0 && (
                <div>
                  <Text variant="body" className="mb-2 font-medium text-gray-700">Index</Text>
                  <input
                    type="number"
                    min="0"
                    value={formData.index || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, index: parseInt(e.target.value, 10) }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMedia(null)
                    setFormData({ title: '', description: '', isPublic: true, locationIds: [], index: 0 })
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6EBDAF] hover:bg-[#6EBDAF]/90 text-white px-4 py-2 rounded-lg"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Container>
  )
} 