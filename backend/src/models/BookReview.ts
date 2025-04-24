import mongoose, { Document, Schema } from 'mongoose'
import { IMedia } from './Media'

export interface IBookReview extends Document {
  title: string
  image: IMedia
  createdAt: Date
  updatedAt: Date
}

const BookReviewSchema = new Schema<IBookReview>(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add index for title-based sorting
BookReviewSchema.index({ title: 1 })

export default mongoose.models.BookReview || mongoose.model<IBookReview>('BookReview', BookReviewSchema) 