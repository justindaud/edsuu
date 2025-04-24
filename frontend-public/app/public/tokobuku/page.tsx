'use client'

import { Container, Grid, Text } from '../../../../shared/components/ui'
import Link from 'next/link'
import Image from 'next/image'
import { ImageSlider } from '../../../../shared/components/ImageSlider'

export default function TokobukuPage() {
  return (
    <div className="min-h-screen bg-white">
      <Grid cols={2} className="h-screen gap-0">
        {/* Be Em Section */}
        <Link href="/public/tokobuku/be-em" className="relative group overflow-hidden">
          <div className="absolute inset-0">
            <ImageSlider 
              images={['/placeholder/be-em.jpg']} 
              className="transform transition-transform duration-700 scale-100 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="relative h-full flex flex-col justify-end p-12 text-white">
            <Text variant="heading" className="text-4xl font-bold mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
              Be Em
            </Text>
            <Text variant="body" className="max-w-md transform transition-all duration-500 group-hover:-translate-y-2 opacity-90 group-hover:opacity-100">
              Discover our curated collection of books related to ongoing programs.
            </Text>
          </div>
        </Link>

        {/* Party Literasi Section */}
        <Link href="/public/tokobuku/party-literasi" className="relative group overflow-hidden">
          <div className="absolute inset-0">
            <ImageSlider 
              images={['/placeholder/party-literasi.jpg']} 
              className="transform transition-transform duration-700 scale-100 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="relative h-full flex flex-col justify-end p-12 text-white">
            <Text variant="heading" className="text-4xl font-bold mb-4 transform transition-transform duration-500 group-hover:-translate-y-2">
              Party Literasi
            </Text>
            <Text variant="body" className="max-w-md transform transition-all duration-500 group-hover:-translate-y-2 opacity-90 group-hover:opacity-100">
              Join our literary events and programs that celebrate the joy of reading and learning.
            </Text>
          </div>
        </Link>
      </Grid>
    </div>
  )
} 