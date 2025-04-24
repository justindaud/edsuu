import mongoose, { Document, Schema } from 'mongoose'

export interface IMedia extends Document {
  url: string
  thumbnailUrl: string
  type: 'image' | 'video'
  title?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Media {
  _id: string
  title: string
  description?: string
  url: string
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
}

const MediaSchema = new Schema<IMedia>(
  {
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema) 