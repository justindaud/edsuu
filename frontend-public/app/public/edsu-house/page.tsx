import { Container, Grid, Text } from '../../../../shared/components/ui'
import { ImageSlider } from '../../../../shared/components/ImageSlider'
import { UIMedia } from '../../../../shared/components/UIMedia'
import { UIMediaLocationId } from '../../../../shared/config/uiMediaLocations'

async function getEdsuHouseContent() {
  // TODO: Implement API call to fetch EDSU House content
  return {
    title: 'T3ntang Kami',
    description: `Edsu house menggabungkan warisan sejarah dengan ekspresi budaya kontemporer. Terletak di wilayah utara Yogyakarta dalam kompleks Pulang ke Uttara, galeri ini terinspirasi dari kehidupan dan karya pematung ternama Indonesia,
    Edhi Sunarso.`,
    media: ['/placeholder/edsu1.jpg', '/placeholder/edsu2.jpg'],
    content: [
      {
        title: '',
        text: 'Nama EDSU menghormati Sunarso, sekaligus mencerminkan semangat berani, kreatif, dan sedikit memberontak yang relavan dengan dunia seni saat ini. Sebagai akronim dari "Eat Dat Ship Up", nama ini mewakili eksplorasi seni tanpa batas. Desain ruang galeri ini mengusung konsep kontras dualitas, yaitu perpaduan antara "black box" (ruang gelap dramatis) dan "all white gallery" (ruang putih netral).'
      }
    ],
    sections: {
      gallery: {
        whiteSpace: {
          title: 'The White Space',
          description: 'Ruang yang terang dan netral, memungkinkan interpretasi terbuka serta mendukung narasi multi-layered dalam karya seni',
          media: ['/placeholder/white-space1.jpg', '/placeholder/white-space2.jpg'],
          locationId: 'edsu.gallery.white-space.1' as UIMediaLocationId
        },
        blackBox: {
          title: 'The Black Box',
          description: 'Ruang dramatis dengan pencahayaan terfokus untuk menciptakan pengalaman yang lebih mendalam dan introspektif bagi pengunjung',
          media: ['/placeholder/black-box1.jpg', '/placeholder/black-box2.jpg'],
          locationId: 'edsu.gallery.black-box.1' as UIMediaLocationId
        }
      },
      entrance: {
        title: 'Wrong Way',
        description: 'Pintu masuk EDSU House akan menjadi ekspresi artistik langsung dari Wawan Dalbo, seniman sekaligus pemilik galeri. Karya ini merefleksikan perjalanannya sebagai seniman dan arsitek. Terinspirasi dari karyanya Wrong Way (ArtJOG, 2024), Dalbo menggabungkan desain arsitektural dengan storytelling. Karyanya mengeksplorasi jalan hidup yang tak terduga, melambangkan keindahan dalam perjalanan yang penuh kejutan—sebuah narasi yang selaras dengan konsep pintu masuk galeri, tempat pengunjung memulai eksplorasi kreatif mereka.',
        media: ['/placeholder/entrance1.jpg', '/placeholder/entrance2.jpg'],
        locationId: 'edsu.entrance.1' as UIMediaLocationId
      },
      compound: {
        sections: [
          {
            title: 'Uttara th3 Icon',
            media: ['/placeholder/uttara1.jpg', '/placeholder/uttara2.jpg'],
            locationId: 'edsu.compound.uttara.1' as UIMediaLocationId
          },
          {
            title: 'Pulang k3 Uttara',
            media: ['/placeholder/pulang1.jpg', '/placeholder/pulang2.jpg'],
            locationId: 'edsu.compound.pulang.1' as UIMediaLocationId
          },
          {
            title: 'Omong-omong',
            media: ['/placeholder/omong1.jpg', '/placeholder/omong2.jpg'],
            locationId: 'edsu.compound.omong.1' as UIMediaLocationId
          },
          {
            title: '18+ Mu5ic Bar',
            media: ['/placeholder/music1.jpg', '/placeholder/music2.jpg'],
            locationId: 'edsu.compound.music.1' as UIMediaLocationId
          }
        ]
      }
    }
  }
}

export default async function EdsuHousePage() {
  const content = await getEdsuHouseContent()

  return (
    <div className="min-h-screen bg-[#EB008B]">
      {/* Hero Section */}
      <div className="h-[100vh] relative bg-[#6EBDAF]">
        {/* Hero Image */}
        <div className="absolute inset-0">
          <UIMedia 
            locationId="edsu.hero.1"
            className="w-full h-full object-cover"
            alt="EDSU House Hero"
            priority
          />

          {/* Hero Text */}
          <div className="absolute inset-0 flex items-center">
            <Container size='full' > 
              {/* Title */}
              <div className="absolute bottom-8 left-8 right-8">   
                <Text variant="heading" className="text-[#EB008B] text-4xl mb-4 glitch-text animate-float">
                  {content.title}
                </Text>
                {/* Description */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-justify'>
                  <Text variant="body" className="text-[#EB008B] max-w-4xl font-bold whitespace-pre-line fade-in animate-slideIn">
                    {content.description}
                  </Text>
                  {content.content.map((section, index) => (
                  <div key={index} className="space-y-4 hover-lift text-justify">
                    <Text variant="body" className="text-[#EB008B] font-bold whitespace-pre-line fade-in animate-slideIn">{section.text}</Text>
                  </div>
                  ))}
                </div>
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="py-12 relative overflow-hidden">
        <Container size='full' className='px-8'>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* White Space */}
            <div className="hover-lift hover-glow animate-fadeIn bg-white">
              <div className="h-[50vh] relative overflow-hidden">
                <UIMedia 
                  locationId={content.sections.gallery.whiteSpace.locationId}
                  className="w-full h-full object-cover"
                  alt={content.sections.gallery.whiteSpace.title}
                />
              </div>
              <div className='px-8 py-4'>
                <Text variant="heading" className="text-xl glitch-text text-[#EB008B]">{content.sections.gallery.whiteSpace.title}</Text>
                <Text variant="body" className="fade-in text-[#EB008B] font-bold">{content.sections.gallery.whiteSpace.description}</Text>
              </div>
            </div>
            {/* Black Box */}
            <div className="hover-lift hover-glow animate-fadeIn delay-200 bg-white">
              <div className="h-[50vh] relative overflow-hidden">
                <UIMedia 
                  locationId={content.sections.gallery.blackBox.locationId}
                  className="w-full h-full object-cover"
                  alt={content.sections.gallery.blackBox.title}
                />
              </div>
              <div className='px-8 py-4'>
                <Text variant="heading" className="text-xl glitch-text text-[#EB008B]">{content.sections.gallery.blackBox.title}</Text>
                <Text variant="body" className="fade-in text-[#EB008B] font-bold">{content.sections.gallery.blackBox.description}</Text>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Entrance Section */}
      <section className="py-12 relative overflow-hidden">
        <Container size="full" className="relative">
          <Container size="full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
              {/* Left side - Image (Full width on mobile, 8 cols on large screens) */}
              <div className="lg:col-span-8 order-2 lg:order-1">
                <div className="relative aspect-[16/9] overflow-hidden hover-lift hover-glow animate-fadeIn">
                  <UIMedia 
                    locationId={content.sections.entrance.locationId}
                    className="w-full h-full object-cover"
                    alt={content.sections.entrance.title}
                  />
                </div>
              </div>
              
              {/* Right side - Content (Full width on mobile, 4 cols on large screens) */}
              <div className="lg:col-span-4 order-1 lg:order-2 flex items-center">
                <div className="space-y-6 flex flex-col justify-center animate-slideIn delay-200">
                  <Text variant="heading" className="text-4xl font-bold text-white">{content.sections.entrance.title}</Text>
                  <Text variant="body" className="whitespace-pre-line text-white font-bold">{content.sections.entrance.description}</Text>
                </div>
              </div>
            </div>
          </Container>
        </Container>
      </section>

      {/* Compound Section */}
      <section className="py-16 bg-[#6EBDAF] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-x"></div>
        <Container size="full" className="relative">
          <Text variant="heading" className="text-4xl mb-12 glitch-text animate-float text-[#EB008B]">Th3 Compound</Text>
          <Grid cols={2} className="gap-8">
            {content.sections.compound.sections.map((section, index) => (
              <div key={index} className="space-y-6 hover-lift hover-glow animate-fadeIn" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="h-[40vh] relative overflow-hidden">
                  <UIMedia 
                    locationId={section.locationId}
                    className="w-full h-full object-cover"
                    alt={section.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent mix-blend-overlay"></div>
                </div>
                <Text variant="heading" className="text-2xl glitch-text text-[#EB008B]">{section.title}</Text>
              </div>
            ))}
          </Grid>
        </Container>
      </section>

      {/* BNN Section */}
      <section className="py-16 bg-[#6EBDAF] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x"></div>
        <Container size="full" className="relative">
          <Text variant="heading" className="text-4xl mb-12 glitch-text animate-float text-[#EB008B]">BNN (Badan Ny3ni & Ngawur)</Text>
          <Container size="xl">
            <div className="space-y-8 animate-slideIn">
              {/* Left Column */}
              <div className="space-y-6 hover-lift">
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-xl text-[#EB008B]">Wawan Dalbo</Text>
                  <Text variant="body" className="text-gray-600 font-bold text-[#EB008B]">Founder</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-xl text-[#EB008B]">Christine Toelle</Text>
                  <Text variant="body" className="text-gray-600 font-bold text-[#EB008B]">Program Director</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-xl text-[#EB008B]">Faiz Dwiana</Text>
                  <Text variant="body" className="text-gray-600 font-bold text-[#EB008B]">Graphic Designer</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-xl text-[#EB008B]">If El Lang Rajendra</Text>
                  <Text variant="body" className="text-gray-600 font-bold text-[#EB008B]">Gallery Assistant</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-xl text-[#EB008B]">Siti Nurjanah</Text>
                  <Text variant="body" className="text-gray-600 font-bold text-[#EB008B]">Toko Buku Yang Tau</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-xl text-[#EB008B]">Ingrid Karunia</Text>
                  <Text variant="body" className="text-gray-600 font-bold text-[#EB008B]">Marketing Communication</Text>
                </div>
              </div>
            </div>
          </Container>
        </Container>
      </section>
    </div>
  )
}