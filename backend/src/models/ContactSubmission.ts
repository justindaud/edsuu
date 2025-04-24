import mongoose, { Document, Schema } from 'mongoose'

export interface IContactSubmission extends Document {
  name: string
  email: string
  message: string
  createdAt: Date
  updatedAt: Date
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.ContactSubmission || mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema) 