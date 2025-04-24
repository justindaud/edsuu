export interface Program {
  _id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  isPublic: boolean
  location?: string
  media: any[]
  articles: any[]
  createdAt: Date
  updatedAt: Date
}