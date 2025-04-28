import { Container, Grid, Card, Text } from '../../../../shared/components/ui'
import Image from 'next/image'

async function getMediaDetails(imageId: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002'
    const response = await fetch(`${backendUrl}/api/media/${imageId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch media details for ID: ${imageId}`)
    }
    
    const media = await response.json()
    return media
  } catch (error) {
    console.error(`Error fetching media details for ID ${imageId}:`, error)
    return null
  }
}

async function getMerchandise() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002'
    console.log('Fetching from:', `${backendUrl}/api/merchandise`)
    const response = await fetch(`${backendUrl}/api/merchandise`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch merchandise')
    }
    
    const merchandise = await response.json()
    console.log('Merchandise data:', merchandise)
    
    // Process merchandise items that have image IDs instead of URLs
    const enhancedMerchandise = await Promise.all(
      merchandise.map(async (item: any) => {
        // If we already have a URL, use it
        if (item.url || item.thumbnailUrl) {
          return item
        }
        
        // Try to get media information if we have an image ID
        if (item.image) {
          try {
            const media = await getMediaDetails(item.image)
            if (media && media.url) {
              return {
                ...item,
                thumbnailUrl: media.url
              }
            }
          } catch (error) {
            console.error(`Error enhancing merchandise ${item._id}:`, error)
          }
        }
        
        // Fallback: use placeholder image
        return {
          ...item,
          thumbnailUrl: `https://placehold.co/600x400/000000/FFFFFF?text=${encodeURIComponent(item.name || 'Product')}`
        }
      })
    )
    
    return enhancedMerchandise
  } catch (error) {
    console.error('Error fetching merchandise:', error)
    return []
  }
}

export default async function MerchandisePage() {
  const products = await getMerchandise()
  console.log('Products for rendering:', products)
  console.log('Products length:', products.length)

  return (
    <div className="min-h-screen">
      <Container className="py-12">
        <Text variant="heading" className="mb-6">M3rchandi53</Text>
        <Text variant="lead" className="mb-8">
          Take home a piece of EDSU House.
        </Text>

        {/* Merchandise Grid */}
        <Grid cols={{ base: 2, md: 3, lg: 4 }} className="gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <Image
                    src={product.thumbnailUrl || product.url || `https://placehold.co/600x400/000000/FFFFFF?text=${encodeURIComponent(product.name || 'Product')}`}
                    alt={product.name || 'Product'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <Text variant="heading" className="text-lg mb-2">
                    {product.name || 'Unnamed Product'}
                  </Text>
                  <Text variant="body">
                    Rp {(product.price || 0).toLocaleString('id-ID')}
                  </Text>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Text variant="body" className="text-gray-500">
                No merchandise available at the moment.
              </Text>
            </div>
          )}
        </Grid>
      </Container>
    </div>
  )
} 