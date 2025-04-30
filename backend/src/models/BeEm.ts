import mongoose, { Document, Schema } from 'mongoose'

interface Review {
  reviewer: string
  text: string
  createdAt: Date
}

export interface IBeEm extends Document {
  mediaId?: string
  media?: string[]
  title: string
  year: number
  author: string
  price: number
  description: string
  reviews: Review[]
  isAvailable: boolean
  relatedPrograms?: string[]
  relatedPartyLiterasi?: string[]
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<Review>({
  reviewer: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const BeEmSchema = new Schema<IBeEm>(
  {
    mediaId: {
      type: String,
      required: false,
    },
    media: [{
      type: String,
      required: false,
    }],
    title: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    relatedPrograms: [{
      type: String,
    }],
    relatedPartyLiterasi: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.BeEm || mongoose.model<IBeEm>('BeEm', BeEmSchema) 