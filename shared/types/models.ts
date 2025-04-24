import { Document, Model } from 'mongoose'

export interface IUser extends Document {
  username: string
  password: string
  organization: 'EDSU' | 'TokoBuku'
  role: 'admin' | 'editor'
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface IMedia extends Document {
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface IArticle extends Document {
  title: string
  content: string
  coverImage: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IProgram extends Document {
  title: string
  description: string
  startDate: Date
  endDate: Date
  media: IMedia[]
  articles: IArticle[]
  isPublic: boolean
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

// Export model types
export type UserModel = Model<IUser>
export type MediaModel = Model<IMedia>
export type ArticleModel = Model<IArticle>
export type ProgramModel = Model<IProgram> 