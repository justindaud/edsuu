import { Container, Grid, Card, Text } from '../../../../shared/components/ui'
import Image from 'next/image'

async function getMerchandise() {
  // TODO: Implement API call to fetch merchandise
  return [
    {
      id: '1',
      name: 'Product 1',
      price: 150000,
      image: '/placeholder/merch1.jpg'
    },
    {
      id: '2',
      name: 'Product 2',
      price: 200000,
      image: '/placeholder/merch2.jpg'
    }
  ]
}

export default async function MerchandisePage() {
  const products = await getMerchandise()

  return (
    <div className="min-h-screen">
      <Container className="py-12">
        <Text variant="heading" className="mb-6">M3rchandi53</Text>
        <Text variant="lead" className="mb-8">
          Take home a piece of EDSU House.
        </Text>

        {/* Merchandise Grid */}
        <Grid cols={{ base: 2, md: 3, lg: 4 }} className="gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <Text variant="heading" className="text-lg mb-2">
                  {product.name}
                </Text>
                <Text variant="body">
                  Rp {product.price.toLocaleString('id-ID')}
                </Text>
              </div>
            </Card>
          ))}
        </Grid>
      </Container>
    </div>
  )
} 