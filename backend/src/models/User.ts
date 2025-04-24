import mongoose, { Document } from 'mongoose'
import bcryptjs from 'bcryptjs'

export interface IUser extends Document {
  username: string
  password: string
  organization: 'EDSU' | 'TokoBuku'
  role: 'admin' | 'editor'
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password by default in queries
    },
    organization: {
      type: String,
      enum: ['EDSU', 'TokoBuku'],
      required: [true, 'Please specify the organization'],
    },
    role: {
      type: String,
      enum: ['admin', 'editor'],
      default: 'editor',
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre<IUser>('save', async function(next: mongoose.CallbackWithoutResult) {
  if (!this.isModified('password')) {
    return next(null)
  }

  try {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt)
    next(null)
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema) 