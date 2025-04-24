import mongoose, { Document, Schema } from 'mongoose'
import { IMedia } from './Media'

export interface IArticle extends Document {
  title: string
  content: string
  slug: string
  excerpt: string
  coverImage: string
  author: mongoose.Types.ObjectId
  isPublished: boolean
  publishedAt: Date
  media: IMedia[]
  program: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    excerpt: {
      type: String,
      maxlength: [500, 'Excerpt cannot be more than 500 characters']
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    media: [{
      type: Schema.Types.ObjectId,
      ref: 'Media'
    }],
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

// Middleware to set publishedAt when article is published
articleSchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

// Create slug from title before saving
articleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
  next()
})

export default mongoose.models.Article || mongoose.model<IArticle>('Article', articleSchema) 