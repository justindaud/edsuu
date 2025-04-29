import mongoose from 'mongoose'

export interface IUIMedia extends mongoose.Document {
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  description: string
  isPublic: boolean
  locationIds: string[]
  index?: number
  createdAt: Date
  updatedAt: Date
}

const uiMediaSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  locationIds: {
    type: [String],
    index: true,
    default: []
  },
  index: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'uimedia'
})

export const UIMedia = mongoose.models.UIMedia || mongoose.model<IUIMedia>('UIMedia', uiMediaSchema) 