import mongoose from 'mongoose'
import type { IUser, IMedia, IArticle, IProgram } from '../types/models'

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    select: false,
  },
  organization: {
    type: String,
    enum: ['EDSU', 'TokoBuku'],
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'editor',
  },
}, { timestamps: true })

const mediaSchema = new mongoose.Schema<IMedia>({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Please provide a type'],
  },
  url: {
    type: String,
    required: [true, 'Please provide a URL'],
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Please provide a thumbnail URL'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
}, { timestamps: true })

const articleSchema = new mongoose.Schema<IArticle>({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  coverImage: String,
  isPublic: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const programSchema = new mongoose.Schema<IProgram>({
  title: {
    type: String,
    required: true
  },
  description: String,
  startDate: Date,
  endDate: Date,
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  articles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  }
}, { timestamps: true })

// Add any methods or middleware here
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return true // TODO: Implement password comparison
}

// Create models
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)
export const Media = mongoose.models.Media || mongoose.model<IMedia>('Media', mediaSchema)
export const Article = mongoose.models.Article || mongoose.model<IArticle>('Article', articleSchema)
export const Program = mongoose.models.Program || mongoose.model<IProgram>('Program', programSchema)

export interface IMediaTBYT extends mongoose.Document {
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  description: string
  createdAt: Date
  updatedAt: Date
}

const mediaTBYTSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'mediatbyts'
})

export const MediaTBYT = mongoose.models.MediaTBYT || mongoose.model<IMediaTBYT>('MediaTBYT', mediaTBYTSchema)

export interface IBeEm extends mongoose.Document {
  title: string
  author: string
  description: string
  mediaId: mongoose.Types.ObjectId
  media: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const beEmSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }]
}, {
  timestamps: true,
  collection: 'beems'
})

export const BeEm = mongoose.models.BeEm || mongoose.model<IBeEm>('BeEm', beEmSchema)

export interface IPartyLiterasi extends mongoose.Document {
  title: string
  description: string
  startDate: Date
  endDate: Date
  media: mongoose.Types.ObjectId[]
  isPublic: boolean
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const partyLiterasiSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true,
  collection: 'partyliterasi'
})

export const PartyLiterasi = mongoose.models.PartyLiterasi || mongoose.model<IPartyLiterasi>('PartyLiterasi', partyLiterasiSchema)

export interface IUIMedia extends mongoose.Document {
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  description: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

const uiMediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'uimedia'
})

export const UIMedia = mongoose.models.UIMedia || mongoose.model<IUIMedia>('UIMedia', uiMediaSchema) 

export interface IMerchandise extends mongoose.Document {
  name: string
  image: IMedia
  price: number
  createdAt: Date
  updatedAt: Date
}

const merchandiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
})

export const Merchandise = mongoose.models.Merchandise || mongoose.model<IMerchandise>('Merchandise', merchandiseSchema)