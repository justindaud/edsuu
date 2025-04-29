import { Container, Grid, Text } from '../../../../shared/components/ui'
import { ImageSlider } from '../../../../shared/components/ImageSlider'
import { UIMedia } from '../../../../shared/components/UIMedia'
import { UIMediaLocationId } from '../../../../shared/config/uiMediaLocations'

async function getEdsuHouseContent() {
  // TODO: Implement API call to fetch EDSU House content
  return {
    title: 'T3ntang Kami',
    description: `Edsu house menggabungkan warisan sejarah dengan ekspresi budaya kontemporer.
    Terletak di wilayah utara Yogyakarta dalam kompleks Pulang ke Uttara,
    galeri ini terinspirasi dari kehidupan dan karya pematung ternama Indonesia,
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
          title: 'Th3 Whit3 5pac3',
          description: 'Ruang yang terang dan netral, memungkinkan interpretasi terbuka serta mendukung narasi multi-layered dalam karya seni',
          media: ['/placeholder/white-space1.jpg', '/placeholder/white-space2.jpg'],
          locationId: 'edsu.gallery.white-space.1' as UIMediaLocationId
        },
        blackBox: {
          title: 'Th3 Black Box',
          description: 'Ruang dramatis dengan pencahayaan terfokus untuk menciptakan pengalaman yang lebih mendalam dan introspektif bagi pengunjung',
          media: ['/placeholder/black-box1.jpg', '/placeholder/black-box2.jpg'],
          locationId: 'edsu.gallery.black-box.1' as UIMediaLocationId
        }
      },
      entrance: {
        title: 'Pintu Ma5uk Gal3ri',
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
      },
      location: {
        title: 'Loka5i 3d5u',
        description: 'Galeri EDSU terletak di Jl. Kaliurang No.72 - KM 5.5, Yogyakarta, sebuah kawasan seni yang pernah menjadi rumah bagi maestro patung Indonesia, Edhi Sunarso.'
      }
    }
  }
}

export default async function EdsuHousePage() {
  const content = await getEdsuHouseContent()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="h-[70vh] relative bg-[#85BAAC]">
        <div className="absolute inset-0">
          <UIMedia 
            locationId="edsu.hero.1"
            className="w-full h-full object-cover"
            alt="EDSU House Hero"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#85BAAC]/80 to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex items-center">
          <Container>
            <Text variant="heading" className="text-[#EB008B] text-4xl mb-4 glitch-text animate-float">
              {content.title}
            </Text>
            <Text variant="lead" className="text-[#EB008B] max-w-2xl whitespace-pre-line fade-in animate-slideIn">
              {content.description}
            </Text>
          </Container>
        </div>
      </div>

      {/* Content Sections */}
      <Container className="py-12 bg-[#EB008B]">
        <Grid cols={1}>
          {content.content.map((section, index) => (
            <div key={index} className="space-y-4 hover-lift">
              <Text variant="heading" className="text-[#85BAAC] text-2xl glitch-text">{section.title}</Text>
              <Text variant="body" className="text-[#85BAAC]">{section.text}</Text>
            </div>
          ))}
        </Grid>
      </Container>

      {/* Gallery Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-100/30 to-transparent animate-pulse"></div>
        <Container className="relative">
          <Text variant="heading" className="text-4xl mb-12 glitch-text animate-float">Gal3ri</Text>
          <Grid cols={2} className="gap-8">
            {/* White Space */}
            <div className="space-y-6 hover-lift hover-glow animate-fadeIn">
              <div className="h-[50vh] relative overflow-hidden rounded-lg">
                <UIMedia 
                  locationId={content.sections.gallery.whiteSpace.locationId}
                  className="w-full h-full object-cover"
                  alt={content.sections.gallery.whiteSpace.title}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent mix-blend-overlay"></div>
              </div>
              <Text variant="heading" className="text-2xl glitch-text">{content.sections.gallery.whiteSpace.title}</Text>
              <Text variant="body" className="fade-in">{content.sections.gallery.whiteSpace.description}</Text>
            </div>
            {/* Black Box */}
            <div className="space-y-6 hover-lift hover-glow animate-fadeIn delay-200">
              <div className="h-[50vh] relative overflow-hidden rounded-lg">
                <UIMedia 
                  locationId={content.sections.gallery.blackBox.locationId}
                  className="w-full h-full object-cover"
                  alt={content.sections.gallery.blackBox.title}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent mix-blend-overlay"></div>
              </div>
              <Text variant="heading" className="text-2xl glitch-text">{content.sections.gallery.blackBox.title}</Text>
              <Text variant="body" className="fade-in">{content.sections.gallery.blackBox.description}</Text>
            </div>
          </Grid>
        </Container>
      </section>

      {/* Entrance Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-100/30 to-transparent animate-pulse"></div>
        <Container className="relative">
          <Text variant="heading" className="text-4xl mb-12 glitch-text animate-float">{content.sections.entrance.title}</Text>
          <Grid cols={2} className="gap-8">
            <div className="h-[60vh] relative hover-lift hover-glow animate-fadeIn">
              <UIMedia 
                locationId={content.sections.entrance.locationId}
                className="w-full h-full object-cover"
                alt={content.sections.entrance.title}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 mix-blend-overlay"></div>
            </div>
            <div className="space-y-6 flex flex-col justify-center animate-slideIn delay-200">
              <Text variant="body" className="whitespace-pre-line">{content.sections.entrance.description}</Text>
            </div>
          </Grid>
        </Container>
      </section>

      {/* Compound Section */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-x"></div>
        <Container className="relative">
          <Text variant="heading" className="text-4xl mb-12 glitch-text animate-float">Th3 Compound</Text>
          <Grid cols={2} className="gap-8">
            {content.sections.compound.sections.map((section, index) => (
              <div key={index} className="space-y-6 hover-lift hover-glow animate-fadeIn" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="h-[40vh] relative overflow-hidden rounded-lg">
                  <UIMedia 
                    locationId={section.locationId}
                    className="w-full h-full object-cover"
                    alt={section.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent mix-blend-overlay"></div>
                </div>
                <Text variant="heading" className="text-2xl glitch-text">{section.title}</Text>
              </div>
            ))}
          </Grid>
        </Container>
      </section>

      {/* BNN Section */}
      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x"></div>
        <Container className="relative">
          <Text variant="heading" className="text-4xl mb-12 glitch-text animate-float">BNN (Badan Ny3ni & Ngawur)</Text>
          <Grid cols={2} className="gap-12">
            <div className="space-y-8 animate-slideIn">
              {/* Left Column */}
              <div className="space-y-6 hover-lift">
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">Wawan Dalbo</Text>
                  <Text variant="body" className="text-gray-600">Founder</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">Christine Toelle</Text>
                  <Text variant="body" className="text-gray-600">Program Director</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">Faiz Dwiana</Text>
                  <Text variant="body" className="text-gray-600">Graphic Designer</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">If El Lang Rajendra</Text>
                  <Text variant="body" className="text-gray-600">Gallery Assistant</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">Siti Nurjanah</Text>
                  <Text variant="body" className="text-gray-600">Toko Buku Yang Tau</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">Ingrid Karunia</Text>
                  <Text variant="body" className="text-gray-600">Marketing Communication</Text>
                </div>
              </div>
            </div>

            <div className="space-y-8 animate-slideIn delay-200">
              {/* Right Column */}
              <div className="space-y-6 hover-lift">
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">Andi Rahmat/NUSAÉ</Text>
                  <Text variant="body" className="text-gray-600">Art Director</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">Lambox Sinaga</Text>
                  <Text variant="body" className="text-gray-600">Photographer</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text variant="heading" className="text-2xl">NUSAÉ</Text>
                  <Text variant="body" className="text-gray-600">Brand Consultant</Text>
                </div>
              </div>
            </div>
          </Grid>
        </Container>
      </section>

      {/* Location Section */}
      <section className="py-16 relative overflow-hidden" id="location">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-100/30 to-transparent animate-pulse"></div>
        <Container className="relative">
          <Text variant="heading" className="text-4xl mb-12 glitch-text animate-float">{content.sections.location.title}</Text>
          <div className="space-y-8">
            <Text variant="body" className="mb-8 fade-in animate-slideIn">{content.sections.location.description}</Text>
            <div className="h-[50vh] relative rounded-lg overflow-hidden shadow-lg hover-lift hover-glow animate-fadeIn">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d988.4647811447902!2d110.38087232243927!3d-7.758182399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a592c3b456be3%3A0x78e9499afb829d42!2sEDSU%20house!5e0!3m2!1sen!2sid!4v1711460429818!5m2!1sen!2sid"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}