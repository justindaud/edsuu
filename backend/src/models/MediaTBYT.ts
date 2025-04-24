import mongoose, { Document, Schema } from 'mongoose'

export interface IMediaTBYT extends Document {
  url: string
  thumbnailUrl: string
  type: 'image' | 'video'
  title?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

const MediaTBYTSchema = new Schema<IMediaTBYT>(
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

export default mongoose.models.MediaTBYT || mongoose.model<IMediaTBYT>('MediaTBYT', MediaTBYTSchema) 