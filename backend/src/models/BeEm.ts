import mongoose, { Document, Schema } from 'mongoose'

interface Review {
  reviewer: string
  text: string
  createdAt: Date
}

export interface IBeEm extends Document {
  mediaId: mongoose.Types.ObjectId
  media: mongoose.Types.ObjectId[]
  title: string
  year: number
  author: string
  price: number
  description: string
  reviews: Review[]
  isAvailable: boolean
  relatedPrograms: mongoose.Types.ObjectId[]
  relatedPartyLiterasi: mongoose.Types.ObjectId[]
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
      type: Schema.Types.ObjectId,
      ref: 'MediaTBYT',
      required: true,
    },
    media: [{
      type: Schema.Types.ObjectId,
      ref: 'MediaTBYT',
      required: true,
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
      required: true,
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
      type: Schema.Types.ObjectId,
      ref: 'Program',
    }],
    relatedPartyLiterasi: [{
      type: Schema.Types.ObjectId,
      ref: 'PartyLiterasi',
    }],
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.BeEm || mongoose.model<IBeEm>('BeEm', BeEmSchema) 