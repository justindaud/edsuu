import mongoose, { Document, Schema } from 'mongoose'
import { IMedia } from './Media'

export interface IMerchandise extends Document {
  name: string
  image: IMedia
  price: number
  createdAt: Date
  updatedAt: Date
}

const MerchandiseSchema = new Schema<IMerchandise>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add index for name-based sorting
MerchandiseSchema.index({ name: 1 })

export default mongoose.models.Merchandise || mongoose.model<IMerchandise>('Merchandise', MerchandiseSchema) 