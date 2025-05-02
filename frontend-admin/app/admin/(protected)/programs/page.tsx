'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Search, Filter, Trash2, Plus } from 'lucide-react'

interface Program {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location?: string
  featuredMedia?: {
    _id: string
    url: string
    thumbnailUrl?: string
  }
  media: {
    _id: string
    title: string
    url: string
    thumbnailUrl: string
  }[]
  isPublic: boolean
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Program['status'] | 'all'>('all')
  const [isPublicFilter, setIsPublicFilter] = useState<'all' | 'public' | 'private'>('all')
  const router = useRouter()

  useEffect(() => {
    fetchPrograms()
  }, [])

  useEffect(() => {
    filterPrograms()
  }, [programs, searchQuery, statusFilter, isPublicFilter])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs')
      const data = await response.json()
      setPrograms(data)
      setFilteredPrograms(data)
    } catch (error) {
      console.error('Error fetching programs:', error)
      toast.error('Failed to fetch programs')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPrograms = () => {
    let filtered = [...programs]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(program => 
        program.title.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query) ||
        program.location?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(program => program.status === statusFilter)
    }

    // Public/Private filter
    if (isPublicFilter !== 'all') {
      filtered = filtered.filter(program => 
        isPublicFilter === 'public' ? program.isPublic : !program.isPublic
      )
    }

    setFilteredPrograms(filtered)
  }

  const handleDelete = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete program')

      toast.success('Program deleted successfully')
      fetchPrograms() // Refresh the list
    } catch (error) {
      console.error('Error deleting program:', error)
      toast.error('Failed to delete program')
    }
  }

  const getStatusColor = (status: Program['status'] | undefined) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
        <Link
          href="/admin/programs/new"
          className="bg-[#6EBDAF] hover:bg-[#6EBDAF]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Program
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Program['status'] | 'all')}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={isPublicFilter}
          onChange={(e) => setIsPublicFilter(e.target.value as 'all' | 'public' | 'private')}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6EBDAF]"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Grid Layout for Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPrograms.map((program) => (
          <div
            key={program._id}
            className="bg-white rounded-lg shadow-md overflow-hidden group"
          >
            <div className="aspect-square relative">
              {program.featuredMedia ? (
                <Image
                  src={program.featuredMedia.thumbnailUrl || program.featuredMedia.url}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
              ) : program.media && program.media.length > 0 ? (
                <Image
                  src={program.media[0].thumbnailUrl || program.media[0].url}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link
                  href={`/admin/programs/${program._id}`}
                  className="p-2 bg-[#6EBDAF] text-white rounded-full hover:bg-[#6EBDAF]/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </Link>
                <button
                  onClick={() => handleDelete(program._id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate">{program.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {program.description}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
              </div>
              {program.location && (
                <p className="text-xs text-gray-500 mt-1">
                  {program.location}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(program.status)}`}>
                  {(program.status || 'draft').charAt(0).toUpperCase() + (program.status || 'draft').slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  program.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {program.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {programs.length === 0 && !isLoading && (
        <div className="flex justify-center items-center min-h-screen">No programs found.</div>
      )}
    </div>
  )
} 