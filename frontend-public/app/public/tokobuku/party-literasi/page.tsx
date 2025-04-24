import { Container, Grid, Text } from '../../../../../shared/components/ui'
import { ImageSlider } from '../../../../../shared/components/ImageSlider'

async function getPartyLiterasi() {
  // TODO: Implement API call to fetch party literasi programs
  return {
    title: 'Party Literasi',
    description: 'Join our literary events and programs that celebrate the joy of reading and learning.',
    media: ['/placeholder/party1.jpg', '/placeholder/party2.jpg'],
    articles: []
  }
}

export default async function PartyLiterasiPage() {
  const program = await getPartyLiterasi()

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <Container className="py-12">
        <Grid cols={3} className="gap-8">
          {/* Image Slider - 1/3 width */}
          <div className="col-span-1">
            <ImageSlider images={program.media} />
          </div>

          {/* Content - 2/3 width */}
          <div className="col-span-2">
            <Text variant="heading" className="mb-6">{program.title}</Text>
            <Text variant="body">{program.description}</Text>
          </div>
        </Grid>
      </Container>

      {/* Timeline */}
      <Container className="py-12">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute h-1 bg-gray-200 w-full top-1/2 -translate-y-1/2" />
          
          {/* Timeline Content */}
          <div className="relative flex gap-8 overflow-x-auto pb-8">
            {program.articles.map((article: any, index: number) => (
              <div 
                key={index}
                className="flex-none w-64 bg-white p-4 rounded-lg shadow-lg"
              >
                <Text variant="heading" className="text-lg mb-2">{article.title}</Text>
                <Text variant="body">{article.excerpt}</Text>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
} 