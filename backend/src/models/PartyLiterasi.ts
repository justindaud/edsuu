import mongoose, { Document, Schema } from 'mongoose'

export interface IPartyLiterasi extends Document {
  title: string
  description: string
  startDate?: Date
  endDate?: Date
  media?: mongoose.Types.ObjectId[]
  isPublic: boolean
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const PartyLiterasiSchema = new Schema<IPartyLiterasi>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    media: [{
      type: Schema.Types.ObjectId,
      ref: 'Media',
    }],
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.PartyLiterasi || mongoose.model<IPartyLiterasi>('PartyLiterasi', PartyLiterasiSchema) 