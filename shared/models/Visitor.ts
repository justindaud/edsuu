import mongoose from 'mongoose'

export interface IVisitor extends mongoose.Document {
  name: string
  city: string
  category: string
  phoneNumber: string
  email: string
  quantity: number
  visitDate: Date
  createdAt: Date
  updatedAt: Date
}

const visitorSchema = new mongoose.Schema<IVisitor>({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required']
  }
}, {
  timestamps: true
})

export const Visitor = mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', visitorSchema) 