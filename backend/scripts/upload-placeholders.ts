import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const placeholders = [
  {
    publicId: 'placeholders/program-placeholder',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800'
  },
  {
    publicId: 'placeholders/edsu-placeholder',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800'
  },
  {
    publicId: 'placeholders/book-placeholder',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800'
  },
  {
    publicId: 'placeholders/merch-placeholder',
    url: 'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?q=80&w=800'
  }
]

async function uploadPlaceholders() {
  try {
    for (const placeholder of placeholders) {
      console.log(`Uploading ${placeholder.publicId}...`)
      const result = await cloudinary.uploader.upload(placeholder.url, {
        public_id: placeholder.publicId,
        overwrite: true,
        resource_type: 'image'
      })
      console.log(`Uploaded ${placeholder.publicId}:`, result.secure_url)
    }
    console.log('All placeholders uploaded successfully!')
  } catch (error) {
    console.error('Error uploading placeholders:', error)
  }
}

uploadPlaceholders() 