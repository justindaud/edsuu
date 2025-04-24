import mongoose from 'mongoose'

export interface IMedia extends mongoose.Document {
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  artist: string | null
  year: string | null
  description: string
  isPublic: boolean
  placeholders: string[]
  createdAt: Date
  updatedAt: Date
}

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    default: null
  },
  year: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  placeholders: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
})

export const Media = mongoose.model<IMedia>('Media', mediaSchema) 