import mongoose from 'mongoose'

export interface IMerchandise extends mongoose.Document {
  name: string
  type?: 'image' | 'video'
  url?: string
  thumbnailUrl?: string
  image?: string
  price: number
  description?: string
  isAvailable?: boolean
  createdAt: Date
  updatedAt: Date
}

const merchandiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image',
  },
  url: {
    type: String,
    required: false,
  },
  thumbnailUrl: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
  collection: 'merchandises',
})

export const Merchandise = mongoose.models.Merchandise || mongoose.model<IMerchandise>('Merchandise', merchandiseSchema)

