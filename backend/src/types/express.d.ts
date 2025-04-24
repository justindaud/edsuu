import { UserDocument } from '../models/User'
import { Multer } from 'multer'

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument
      file?: Multer.File
    }
  }
} 