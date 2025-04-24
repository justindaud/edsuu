'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Container, Card, Text, Button, Grid} from '@shared/components/ui'
import { Upload, Search, Edit, Trash2, X } from '@shared/components/icons'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'

interface Merchandise {
  _id: string
  name: string
  url: string
  thumbnailUrl: string
  price: number
  image: string
  description?: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

interface MerchandiseFormData {
    file?: File
    name: string
    price: number
    description?: string
    isAvailable: boolean
}

type SortField = 'name' | 'createdAt' | 'updatedAt'
type SortOrder = 'asc' | 'desc'


export default function MerchandisePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [merchandise, setMerchandise] = useState<Merchandise[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMerchandise, setSelectedMerchandise] = useState<Merchandise | null>(null)
  const [formData, setFormData] = useState<MerchandiseFormData>({
    name: '',
    price: 0,
    description: '',
    isAvailable: true
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [previewMerchandise, setPreviewMerchandise] = useState<Merchandise | null>(null)
  const [updating, setUpdating] = useState(false)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
        router.push('/admin/login')
    } else if (status === 'authenticated') {
        fetchMerchandise()
    }
  }, [status, router])

  const fetchMerchandise = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchandise`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user?.accessToken}`
            }
        })
        if (!response.ok) throw new Error('Failed to fetch merchandise')
        const data = await response.json()
        setMerchandise(data)
    } catch (error) {
      console.error('Error fetching merchandise:', error)
      toast.error('Failed to load merchandise')
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
        }
        formDataToSend.append('name', formData.name)
        formDataToSend.append('price', formData.price.toString())
        formDataToSend.append('description', formData.description || '')
        formDataToSend.append('isAvailable', formData.isAvailable.toString())

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${selectedMerchandise ? `/api/merchandise/${selectedMerchandise._id}` : '/api/merchandise'}`, {
            method: selectedMerchandise ? 'PUT' : 'POST',
            headers: {
                'Authorization': `Bearer ${session?.user?.accessToken}`
            },
            body: formDataToSend
        }
    )

    if (!response.ok) throw new Error(selectedMerchandise ? 'Failed to update merchandise' : 'Failed to create merchandise')

    toast.success(selectedMerchandise ? 'Merchandise updated successfully' : 'Merchandise created successfully')
    setShowUploadModal(false)
    setShowEditModal(false)
    setSelectedMerchandise(null)
    fetchMerchandise()
    } catch (error) {
        console.error('Save error:', error)
        toast.error(selectedMerchandise ? 'Failed to update merchandise' : 'Failed to create merchandise')
    } finally {
        setSaving(false)
    }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMerchandise) return
    setUpdating(true)

    try {
        const response = await fetch(`/api/merchandise/${selectedMerchandise._id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.name,
                price: formData.price,
                description: formData.description || '',
                isAvailable: formData.isAvailable,
            }),
        })

        if (!response.ok) {
            toast.error('Failed to update merchandise',{
                duration: 3000,
                position: 'top-center',
            })
            return
        }
        
        const updatedMerchandise = await response.json()

        // Update the merchandise list with the edited item
        setMerchandise(merchandise.map(item => 
            item._id === selectedMerchandise._id ? updatedMerchandise : item
        ))

        toast.success('Merchandise updated successfully', {
            duration: 3000,
            position: 'top-center',
        })
        setShowEditModal(false)
        setSelectedMerchandise(null)
        setFormData({
            name: '',
            price: 0,
            description: '',
            isAvailable: true,
        })
        fetchMerchandise()
    } catch (error) {
        console.error('Update error:', error)
        toast.error('Failed to update merchandise', {
            duration: 3000,
            position: 'top-center',
        })
    } finally {
        setUpdating(false)
    }
  }
    
        
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/merchandise/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user?.accessToken}`
            }
        })

        if (!response.ok) {
            const error = await response.json()
            toast.error('Failed to delete merchandise', {
                duration: 3000,
                position: 'top-center',
            })
            return
        }

        toast.success('Merchandise deleted successfully', {
            duration: 3000,
            position: 'top-center',
        })

        setMerchandise(merchandise.filter(item => item._id !== id))

    } catch (error) {
      console.error('Error deleting merchandise:', error)
    }
  }

  const openEditModal = (item: Merchandise) => {
    setSelectedMerchandise(item)
    setFormData({
        name: item.name,
        price: item.price,
        description: item.description || '',
        isAvailable: item.isAvailable,
    })
    setShowEditModal(true)
  }

  const filteredAndSortedMerchandise = merchandise
    .filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <Text variant="heading">Merchandise</Text>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setShowUploadModal(true)}
            disabled={uploading}
          >
            <Upload className="w-5 h-5" />
            Item
          </Button>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search merchandise..."
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
                <option value="name">Name</option>
                <option value="updatedAt">Last Updated</option>
            </select>
            <Button
                variant="outline"
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            >
                {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
        </div>

        <Grid cols={{ base: 1, md: 2, lg: 3 }} gap="md" className="mt-8">
          {filteredAndSortedMerchandise.map((item) => (
            <Card key={item._id} className="group relative overflow-hidden">
                {/* Merchandise Preview */}

              <div className="aspect-square relative cursor-pointer"
                onClick={() => setPreviewMerchandise(item)}
              >
                <Image
                  src={item.thumbnailUrl}
                  alt={item.name}
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
                        e.preventDefault()
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
                        e.preventDefault()
                        handleDelete(item._id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Merchandise Info */}
              <div className="p-4 space-y-2">
                <Text variant="body" className="font-medium truncate">
                  {item.name}
                </Text>
                <Text variant="body" className="mb-2">
                  Rp {item.price.toLocaleString('id-ID')}
                </Text>
                {item.description && (
                  <Text variant="body" className="text-gray-600 mb-4">
                    {item.description}
                  </Text>
                )}
                {item.isAvailable && (
                  <Text variant="body" className="text-gray-600 mb-4">
                    Stock: {item.isAvailable ? 'Available' : 'Out of Stock'}
                  </Text>
                )}
                
              </div>
            </Card>
          ))}
        </Grid>

        {merchandise.length === 0 && !loading && (
          <div className="text-center py-12">
            <Text variant="body" className="text-gray-500">
              No merchandise found. Upload some items to get started.
            </Text>
          </div>
        )}

        {/* Fullscreen Preview */}
        {previewMerchandise && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
              <Image
                src={previewMerchandise.thumbnailUrl}
                alt={previewMerchandise.name}
                fill
                className="object-contain"
              />
              <button
                onClick={() => setPreviewMerchandise(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-4 rounded-lg text-white">
                <Text variant="heading" className="text-xl mb-2">
                  {previewMerchandise.name}
                </Text>
                <Text variant="body" className="mb-4">
                  Rp {previewMerchandise.price.toLocaleString('id-ID')}
                </Text>
                {previewMerchandise.description && (
                  <Text variant="body" className="mb-4">
                    {previewMerchandise.description}
                  </Text>
                )}
                {previewMerchandise.isAvailable && (
                  <Text variant="body" className="mb-4">
                    Stock: {previewMerchandise.isAvailable ? 'Available' : 'Out of Stock'}
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
                <Text variant="heading" className="text-2xl">Upload Merchandise</Text>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setFormData({ name: '', price: 0, description: '', isAvailable: true })
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

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Text variant="body" className="mb-2">Name</Text>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                        required
                      />
                    </div>
                    <div>
                      <Text variant="body" className="mb-2">Price</Text>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
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
                      <Text variant="body" className="mb-2">Stock</Text>
                      <select
                        value={formData.isAvailable.toString() || 'true'}
                        onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                      >
                        <option value="true">Available</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Text variant="body" className="mb-2">Stock</Text>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedMerchandise && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-4">
                <Text variant="heading" className="text-2xl">Edit Merchandise</Text>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMerchandise(null)
                    setFormData({ name: '', price: 0, description: '', isAvailable: true })
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
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
                    ) : null}
                  </div>
                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Text variant="body" className="mb-2">Name</Text>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                        required
                      />
                    </div>
                    <div>
                      <Text variant="body" className="mb-2">Price</Text>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
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
                      <Text variant="body" className="mb-2">Stock</Text>
                      <select
                        value={formData.isAvailable.toString() || 'true'}
                        onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.value === 'true' }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-edsu-green"
                      >
                        <option value="true">Available</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMerchandise(null)
                    setFormData({ name: '', price: 0, description: '', isAvailable: true })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
  )
}}