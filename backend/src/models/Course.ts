import mongoose, { Document } from 'mongoose'

export interface ICourse extends Document {
  title: string
  description: string
  code: string // Course code (e.g., CS101)
  credits: number
  organization: 'EDSU' | 'TokoBuku'
  instructor: mongoose.Types.ObjectId
  status: 'active' | 'inactive' | 'draft'
  createdAt: Date
  updatedAt: Date
}

const courseSchema = new mongoose.Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide a course code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    credits: {
      type: Number,
      required: [true, 'Please specify the number of credits'],
      min: [0, 'Credits cannot be negative'],
    },
    organization: {
      type: String,
      enum: ['EDSU', 'TokoBuku'],
      required: [true, 'Please specify the organization'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify the instructor'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for better query performance
courseSchema.index({ code: 1, organization: 1 }, { unique: true })
courseSchema.index({ instructor: 1 })
courseSchema.index({ status: 1 })

export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema) 