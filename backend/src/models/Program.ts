import { Schema, model, models } from 'mongoose'

const ProgramSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    required: false
  },
  featuredMedia: {
    _id: String,
    url: String,
    thumbnailUrl: String
  },
  media: [{
    _id: String,
    title: String,
    url: String,
    thumbnailUrl: String
  }],
  articles: [{
    _id: String,
    title: String,
    content: String,
    coverImage: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt timestamp before saving
ProgramSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Add middleware to automatically set status based on dates
ProgramSchema.pre('save', function(next) {
  const now = new Date()
  const startDate = new Date(this.startDate)
  const endDate = new Date(this.endDate)

  if (this.status === 'cancelled') {
    // Don't change status if it's cancelled
    next()
    return
  }

  if (now < startDate) {
    this.status = 'scheduled'
  } else if (now >= startDate && now <= endDate) {
    this.status = 'ongoing'
  } else if (now > endDate) {
    this.status = 'completed'
  }

  next()
})

export const Program = models.Program || model('Program', ProgramSchema) 