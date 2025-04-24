'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Artwork {
  _id: string
  title: string
  artist: string
  description: string
  exhibition: string
  imageUrl: string
  thumbnailUrl: string
  active: boolean
}

type Stats = {
  programs: number
  artworks: number
  articles: number
  users: number
  visitors: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    programs: 0,
    artworks: 0,
    articles: 0,
    users: 0,
    visitors: 0,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('/api/artworks')
        const data = await response.json()
        setArtworks(data)
      } catch (error) {
        console.error('Error fetching artworks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtworks()
  }, [])

  useEffect(() => {
    // TODO: Fetch actual stats from API
  }, [])

  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  const cards = [
    {
      title: 'Programs',
      value: stats.programs,
      href: '/admin/programs',
      color: 'bg-[#85BAAC]',
    },
    {
      title: 'Articles',
      value: stats.articles,
      href: '/admin/articles',
      color: 'bg-[#EB008B]',
    },
    {
      title: 'Users',
      value: stats.users,
      href: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Visitors',
      value: stats.visitors,
      href: '/admin/visitors',
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold heading-black">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block"
          >
            <div className={`${card.color} rounded-lg p-6 text-white hover:opacity-90 transition-opacity`}>
              <h3 className="text-lg font-medium">{card.title}</h3>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Programs</h2>
          {/* TODO: Add recent programs list */}
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Visitors</h2>
          {/* TODO: Add recent visitors list */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artwork Management</h1>
          <button
            onClick={() => router.push('/admin/dashboard/new')}
            className="bg-[#85BAAC] text-white px-4 py-2 rounded-md hover:bg-[#85BAAC]/90"
          >
            Add New Artwork
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={artwork.thumbnailUrl}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{artwork.title}</h3>
                <p className="text-gray-600">{artwork.artist}</p>
                <p className="text-sm text-gray-500 mt-2">{artwork.exhibition}</p>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => router.push(`/admin/dashboard/edit/${artwork._id}`)}
                    className="text-[#85BAAC] hover:text-[#85BAAC]/90"
                  >
                    Edit
                  </button>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    artwork.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {artwork.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 