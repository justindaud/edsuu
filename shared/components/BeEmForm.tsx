import { useState } from 'react'
import { Media } from '../types/media'
import { Text, Button, Card, Grid } from './ui'
import Image from 'next/image'
import { X } from 'lucide-react'

interface BeEmFormProps {
  onSubmit: (data: BeEmFormData) => void
  initialData?: any
  media: Media[]
  selectedMedia: string[]
  onMediaChange: (mediaIds: string[]) => void
}

interface BeEmFormData {
  title: string
  year: number
  author: string
  price: number
  description: string
  media: string[]
  isAvailable: boolean
}

export default function BeEmForm({ onSubmit, initialData, media, selectedMedia, onMediaChange }: BeEmFormProps) {
  const [formData, setFormData] = useState<BeEmFormData>({
    title: initialData?.title || '',
    year: initialData?.year || new Date().getFullYear(),
    author: initialData?.author || '',
    price: initialData?.price || 0,
    description: initialData?.description || '',
    media: initialData?.media || [],
    isAvailable: initialData?.isAvailable ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedia.length) {
      alert('Please select a cover image')
      return
    }
    onSubmit({
      ...formData,
      year: Number(formData.year),
      price: Number(formData.price),
      media: selectedMedia
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Media Selection */}
      <div>
        <Text variant="body" className="mb-2">Book Images</Text>
        <div className="relative h-[400px] w-full rounded-lg overflow-hidden bg-gray-100">
          {selectedMedia.length > 0 ? (
            <div className="relative h-full">
              <Image
                src={media.find(m => m._id === selectedMedia[0])?.thumbnailUrl || media.find(m => m._id === selectedMedia[0])?.url || ''}
                alt="Book cover"
                fill
                className="object-contain"
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = '/placeholder-book.jpg';
                }}
              />
              {selectedMedia.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  +{selectedMedia.length - 1} more
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
              // This will be handled by the parent component
              const mediaItem = media.find(m => m._id === selectedMedia[0])
              if (mediaItem) {
                onMediaChange([...selectedMedia, mediaItem._id])
              }
            }}
          >
            Add Images
          </Button>
          {selectedMedia.length > 0 && (
            <Grid cols={{ base: 4, md: 6, lg: 8 }} gap="sm">
              {selectedMedia.map((mediaId, index) => {
                const mediaItem = media.find(m => m._id === mediaId)
                if (!mediaItem) return null
                return (
                  <div key={`${mediaItem._id}-${index}`} className="relative">
                    <Image
                      src={mediaItem.thumbnailUrl || mediaItem.url}
                      alt={mediaItem.title}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onMediaChange(selectedMedia.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
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
            onChange={(e) => {
              const title = e.target.value
              if (title.length <= 200) {
                setFormData({ ...formData, title })
              }
            }}
            maxLength={200}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
            required
          />
        </div>
        <div>
          <Text variant="body" className="mb-2">Author</Text>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
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
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
            min={1900}
            max={new Date().getFullYear()}
            required
          />
        </div>
        <div>
          <Text variant="body" className="mb-2">Price (Rp)</Text>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
            min={0}
            required
          />
        </div>
      </Grid>

      <div>
        <Text variant="body" className="mb-2">Description</Text>
        <textarea
          value={formData.description}
          onChange={(e) => {
            const description = e.target.value
            if (description.length <= 2000) {
              setFormData({ ...formData, description })
            }
          }}
          maxLength={2000}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
          rows={5}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
          className="h-4 w-4 text-[#6EBDAF] focus:ring-[#6EBDAF] border-gray-300 rounded"
        />
        <label htmlFor="isAvailable">
          <Text variant="body">Book is available for purchase</Text>
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onMediaChange([])}
        >
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Book' : 'Create Book'}
        </Button>
      </div>
    </form>
  )
} 